import prisma from "../config/prisma";

export const dispatchService = {
  async getIncomingJob(workerId: string) {
    // Find a pending dispatch for this worker
    return await prisma.job_dispatch.findFirst({
      where: { worker_id: workerId, status: "PENDING" },
      include: {
        job_requirement: {
          include: { job: true }
        }
      }
    });
  },

  async acceptJob(requirementId: string, workerId: string) {
    return await prisma.$transaction(async (tx) => {
      const dispatch = await tx.job_dispatch.findFirst({
        where: { requirement_id: requirementId, worker_id: workerId, status: "PENDING" }
      });

      if (!dispatch) throw new Error("No pending dispatch found for this requirement and worker");

      // Mark dispatch as ACCEPTED
      await tx.job_dispatch.update({
        where: { id: dispatch.id },
        data: { status: "ACCEPTED", responded_at: new Date() }
      });

      const requirement = await tx.job_requirement.findUnique({
        where: { id: requirementId },
        include: { job: true }
      });

      if (!requirement) throw new Error("Requirement not found");

      // Create booking atomically
      const booking = await tx.booking.create({
        data: {
          job_id: requirement.job_id,
          requirement_id: requirementId,
          worker_id: workerId,
          customer_id: requirement.job.customer_id,
          status: "PENDING",
          otp_hash: "mock-otp-1234", // mock logic
        }
      });

      // Update requirement filled count
      const filled = (requirement.worker_count_filled || 0) + 1;
      await tx.job_requirement.update({
        where: { id: requirementId },
        data: { 
          worker_count_filled: filled,
          status: filled >= requirement.worker_count_needed ? "FILLED" : "OPEN"
        }
      });

      return booking;
    });
  },

  async declineJob(requirementId: string, workerId: string) {
    return await prisma.$transaction(async (tx) => {
      const dispatch = await tx.job_dispatch.findFirst({
        where: { requirement_id: requirementId, worker_id: workerId, status: "PENDING" }
      });

      if (!dispatch) throw new Error("No pending dispatch found");

      await tx.job_dispatch.update({
        where: { id: dispatch.id },
        data: { status: "DECLINED", responded_at: new Date() }
      });

      // In real scenario, trigger BullMQ to find next worker

      return { success: true, message: "Job declined" };
    });
  },

  async getWaves(requirementId: string) {
    return await prisma.dispatch_wave.findMany({
      where: { requirement_id: requirementId },
      include: {
        job_dispatch: true
      }
    });
  }
};
