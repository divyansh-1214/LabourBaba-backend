import prisma from '../config/prisma';
import { dispatchQueue } from '../config/bullmq';
import { generateOTP, hashOTP } from '../utils/authUtils';
import { Prisma } from '@prisma/client';

// ── Helper: check if all requirements for a job are filled ──────────────────

async function checkJobComplete(
  jobId: string,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const unfilledCount = await tx.job_requirement.count({
    where: {
      job_id: jobId,
      status: { not: 'filled' },
    },
  });

  if (unfilledCount === 0) {
    await tx.job.update({
      where: { id: jobId },
      data: { dispatch_status: 'fully_booked' },
    });
    console.log(`[dispatchServices] Job ${jobId} is fully booked.`);
  }
}

// ── Accept ───────────────────────────────────────────────────────────────────

export const acceptDispatch = async (requirementId: string, workerId: string) => {
  return await prisma.$transaction(async (tx) => {
    // Row-lock to prevent race conditions when multiple workers accept simultaneously
    await tx.$queryRaw`
      SELECT id FROM job_requirement
      WHERE id = ${requirementId}::uuid FOR UPDATE
    `;

    const req = await tx.job_requirement.findUnique({
      where: { id: requirementId },
      include: { job: true },
    });

    if (!req) throw new Error('REQUIREMENT_NOT_FOUND');
    if (req.status === 'filled') throw new Error('SLOTS_FULL');

    // Mark this worker's dispatch as accepted
    await tx.job_dispatch.updateMany({
      where: { requirement_id: requirementId, worker_id: workerId },
      data: { status: 'accepted', responded_at: new Date() },
    });

    // Generate and hash a fresh OTP for job start verification
    const otp = generateOTP();
    const otp_hash = await hashOTP(otp);

    // Create booking
    const booking = await tx.booking.create({
      data: {
        job_id: req.job_id,
        requirement_id: requirementId,
        worker_id: workerId,
        customer_id: req.job.customer_id,
        status: 'confirmed',
        otp_hash,
      },
    });

    // Increment filled count and flip status if all slots filled
    const newFilled = (req.worker_count_filled ?? 0) + 1;
    const nowFilled = newFilled >= req.worker_count_needed;

    await tx.job_requirement.update({
      where: { id: requirementId },
      data: {
        worker_count_filled: newFilled,
        status: nowFilled ? 'filled' : 'dispatching',
      },
    });

    // Check if ALL requirements for this job are now filled → mark job fully_booked
    if (nowFilled) {
      await checkJobComplete(req.job_id, tx);
    }

    return {
      booking,
      nowFilled,
      newFilled,
      needed: req.worker_count_needed,
    };
  });
};

// ── Decline ──────────────────────────────────────────────────────────────────

export const declineDispatch = async (requirementId: string, workerId: string) => {
  // 1. Mark dispatch as declined and increment worker's decline_count
  await prisma.$transaction(async (tx) => {
    await tx.job_dispatch.updateMany({
      where: {
        requirement_id: requirementId,
        worker_id: workerId,
        status: 'pending',
      },
      data: { status: 'declined', responded_at: new Date() },
    });

    await tx.worker.update({
      where: { id: workerId },
      data: { decline_count: { increment: 1 } },
    });
  });

  // 2. Check if any pending dispatches remain in the current wave
  const currentWaveDispatch = await prisma.job_dispatch.findFirst({
    where: { requirement_id: requirementId, worker_id: workerId },
    select: { wave_number: true },
    orderBy: { notified_at: 'desc' },
  });

  if (!currentWaveDispatch) {
    return { success: true, message: 'Job declined' };
  }

  // wave_number is nullable in schema — guard before using
  const currentWave = currentWaveDispatch.wave_number ?? 1;

  const pendingCount = await prisma.job_dispatch.count({
    where: {
      requirement_id: requirementId,
      wave_number: currentWave,
      status: 'pending',
    },
  });

  // 3. If no pending left and requirement not yet filled → fire next wave immediately
  if (pendingCount === 0) {
    const req = await prisma.job_requirement.findUnique({
      where: { id: requirementId },
      select: { status: true, job_id: true, worker_count_needed: true },
    });

    if (req && req.status !== 'filled') {
      console.log(
        `[dispatchServices] All wave ${currentWave} workers responded for requirement ${requirementId}. Firing next wave immediately.`,
      );

      // Close current wave
      await prisma.dispatch_wave.updateMany({
        where: {
          requirement_id: requirementId,
          wave_number: currentWave,
        },
        data: { status: 'exhausted', resolved_at: new Date() },
      });

      // Re-queue with next offset
      const nextWaveNumber = currentWave + 1;
      const nextOffset = currentWave * (req.worker_count_needed * 2);

      await dispatchQueue.add('dispatch-wave', {
        requirementId,
        jobId: req.job_id,
        waveNumber: nextWaveNumber,
        offset: nextOffset,
      });
    }
  }

  return { success: true, message: 'Job declined' };
};

// ── Get Incoming (worker polling) ────────────────────────────────────────────

export const getIncomingDispatches = async (workerId: string) => {
  return await prisma.job_dispatch.findMany({
    where: { worker_id: workerId, status: 'pending' },
    include: {
      job_requirement: {
        include: { job: true },
      },
    },
    orderBy: { notified_at: 'desc' },
  });
};

// ── Get Waves (for a requirement) ────────────────────────────────────────────

export const getWaves = async (requirementId: string) => {
  const waves = await prisma.dispatch_wave.findMany({
    where: { requirement_id: requirementId },
    orderBy: { wave_number: 'asc' },
  });
  const dispatches = await prisma.job_dispatch.findMany({
    where: { requirement_id: requirementId },
    orderBy: { wave_position: 'asc' },
  });
  return { waves, dispatches };
};

// ── Legacy export shape (keeps controller imports working) ───────────────────

export const dispatchService = {
  getIncomingJob: (workerId: string) => getIncomingDispatches(workerId),
  acceptJob: (requirementId: string, workerId: string) =>
    acceptDispatch(requirementId, workerId),
  declineJob: (requirementId: string, workerId: string) =>
    declineDispatch(requirementId, workerId),
  getWaves: (requirementId: string) => getWaves(requirementId),
};
