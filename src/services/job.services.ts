import prisma from "../config/prisma";
import { CreateJobReq } from "../type/api_req.type";

export const makeJob = async (payload: CreateJobReq) => {
  const now = new Date();
  const data = {
    customer_id: payload.customer_id,
    category_id: payload.category_id,
    description: payload.description,
    latitude: payload.latitude,
    longitude: payload.longitude,
    location: payload.location,
    budget: payload.budget,
    status: "OPEN", // Default initial status
    dispatch_status: "PENDING",
    created_at: now.toISOString()
  }

  const job = await prisma.job.create({ data: data })

  // Find all workers with matching skill category ID
  const workers = await prisma.worker.findMany({
    where: {
      skill_category_id: payload.category_id,
    },
    include: {
      worker_location: {
        orderBy: {
          updated_at: "desc",
        },
        take: 1,
      },
    },
  });

  // Calculate distance and create job application for each worker
  for (const worker of workers) {
    const latestLocation = worker.worker_location?.[0];
    if (
      !latestLocation ||
      typeof latestLocation.latitude !== "number" ||
      typeof latestLocation.longitude !== "number"
    ) {
      console.log(`Skipping worker ${worker.id} due to missing or invalid location coordinates.`);
      continue;
    }

    const distance = calculateDistance(
      payload.latitude,
      payload.longitude,
      latestLocation.latitude,
      latestLocation.longitude
    );

    await prisma.job_application.create({
      data: {
        job_id: job.id,
        worker_id: worker.id,
        distance_km: distance,
        status: "PENDING",
      },
    });
  }

  return job
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}
