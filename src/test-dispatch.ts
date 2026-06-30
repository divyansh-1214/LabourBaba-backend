// src/test-dispatch.ts
import prisma from "./config/prisma";
import { dispatchQueue, timeoutQueue } from "./config/bullmq";
import { jobService } from "./services/job.services";
import { acceptDispatch, declineDispatch } from "./services/dispatchServices";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testPipeline() {
  console.log("=== STARTING BULLMQ DISPATCH PIPELINE TEST ===");

  // 1. Setup/Ensure Clean Data
  console.log("\n[1] Setting up mock data...");

  // Upsert skill category
  const skillCategory = await prisma.skill_category.upsert({
    where: { name: "Plumbing" },
    update: {},
    create: { name: "Plumbing" },
  });
  console.log(`- Skill category: ${skillCategory.name} (${skillCategory.id})`);

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      name: "Test Customer",
      phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    },
  });
  console.log(`- Customer: ${customer.name} (${customer.id})`);

  // Create a worker
  const worker1 = await prisma.worker.create({
    data: {
      name: "Worker 1",
      skill_category_id: skillCategory.id,
      skill_type: "Plumbing",
      phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      is_online: true,
      verification_status: "verified",
      device_token: "mock-fcm-token-1",
      worker_score: 4.8,
    },
  });

  const worker2 = await prisma.worker.create({
    data: {
      name: "Worker 2",
      skill_category_id: skillCategory.id,
      skill_type: "Plumbing",
      phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      is_online: true,
      verification_status: "verified",
      device_token: "mock-fcm-token-2",
      worker_score: 4.5,
    },
  });

  console.log(`- Created Worker 1 ID: (${worker1.id})`);
  console.log(`- Created Worker 2 ID: (${worker2.id})`);

  // Set PostGIS geolocation near Bangalore (12.9716, 77.5946)
  // Bengaluru coordinates
  const lat = 12.9716;
  const lng = 77.5946;

  console.log("- Setting worker geographic locations using raw PostGIS SQL...");
  await prisma.$executeRaw`
    UPDATE worker
    SET location_geo = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
    WHERE id IN (${worker1.id}::uuid, ${worker2.id}::uuid)
  `;

  // 2. Create Job (triggers BullMQ)
  console.log("\n[2] Creating job posting (which triggers BullMQ dispatch flow)...");
  const job = await jobService.createJob({
    customer_id: customer.id,
    latitude: lat,
    longitude: lng,
    location: "Bangalore Central",
    requirements: [
      {
        skill_type: "Plumbing",
        worker_count_needed: 1,
        rate_per_day: 800,
      },
    ],
  });
  console.log(`- Job created successfully: ${job.id}`);

  // Fetch requirement ID
  const requirements = await prisma.job_requirement.findMany({
    where: { job_id: job.id },
  });
  const req = requirements[0];
  console.log(`- Requirement ID generated: ${req.id}`);

  console.log("\nWaiting 3 seconds for BullMQ Worker to process dispatch...");
  await sleep(3000);

  // Check dispatch waves
  const dispatches = await prisma.job_dispatch.findMany({
    where: { requirement_id: req.id },
  });

  console.log(`\n- Dispatches created: ${dispatches.length}`);
  for (const d of dispatches) {
    console.log(`  * Dispatch ID: ${d.id} | Worker ID: ${d.worker_id} | Status: ${d.status}`);
  }

  // 3. Test Decline Flow (Worker 2 declines)
  console.log(`\n[3] Simulating worker decline...`);
  console.log(`- Worker 2 (${worker2.id}) declines requirement...`);
  await declineDispatch(req.id, worker2.id);

  // Verify decline status
  const d2 = await prisma.job_dispatch.findFirst({
    where: { requirement_id: req.id, worker_id: worker2.id },
  });
  console.log(`- Worker 2 dispatch status: ${d2?.status}`);

  const w2Updated = await prisma.worker.findUnique({
    where: { id: worker2.id },
    select: { decline_count: true },
  });
  console.log(`- Worker 2 decline_count: ${w2Updated?.decline_count}`);

  // 4. Test Accept Flow (Worker 1 accepts)
  console.log(`\n[4] Simulating worker accept...`);
  console.log(`- Worker 1 (${worker1.id}) accepts requirement...`);
  const acceptResult = await acceptDispatch(req.id, worker1.id);
  console.log(`- Booking created: ${acceptResult.booking.id} with OTP hash: ${acceptResult.booking.otp_hash}`);
  console.log(`- Now filled: ${acceptResult.nowFilled} (${acceptResult.newFilled}/${acceptResult.needed})`);

  // Verify job status
  const jobUpdated = await prisma.job.findUnique({
    where: { id: job.id },
  });
  console.log(`- Job status: ${jobUpdated?.status} | Dispatch status: ${jobUpdated?.dispatch_status}`);

  console.log("\n=== PIPELINE TEST FINISHED ===");
}

testPipeline()
  .catch((err) => {
    console.error("Test failed with error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
