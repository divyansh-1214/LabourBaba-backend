import prisma from "../config/prisma";
import { CreateJobReq } from "../type/api_req.type";

export const jobService = {
  async createJob(payload: CreateJobReq) {
    return await prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          customer_id: payload.customer_id,
          latitude: payload.latitude,
          longitude: payload.longitude,
          location: payload.location,
          status: "OPEN",
          dispatch_status: "PENDING",
        }
      });

      if (payload.requirements && payload.requirements.length > 0) {
        for (const req of payload.requirements) {
          await tx.job_requirement.create({
            data: {
              job_id: job.id,
              skill_type: req.skill_type,
              worker_count_needed: req.worker_count_needed,
              rate_per_day: req.rate_per_day,
              status: "OPEN"
            }
          });
        }
      }
      return job;
    });
  },

  async getJobsByCustomer(customerId: string) {
    return await prisma.job.findMany({
      where: { customer_id: customerId },
      include: { job_requirement: true }
    });
  },

  async getJobDetail(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { 
        job_requirement: { include: { job_dispatch: true } } 
      }
    });
    if (!job) throw new Error("Job not found");
    return job;
  },

  async cancelJob(jobId: string, customerId: string) {
    return await prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({ where: { id: jobId } });
      if (!job) throw new Error("Job not found");
      if (job.customer_id !== customerId) throw new Error("Unauthorized");
      if (job.status === "COMPLETED") throw new Error("Cannot cancel a completed job");

      await tx.job.update({
        where: { id: jobId },
        data: { status: "CANCELLED" }
      });

      await tx.job_requirement.updateMany({
        where: { job_id: jobId },
        data: { status: "CANCELLED" }
      });

      // Also cancel pending dispatches
      const reqs = await tx.job_requirement.findMany({ where: { job_id: jobId } });
      for (const r of reqs) {
        await tx.job_dispatch.updateMany({
          where: { requirement_id: r.id, status: "PENDING" },
          data: { status: "CANCELLED" }
        });
      }

      return { success: true, message: "Job cancelled" };
    });
  },

  async getJobRequirements(jobId: string) {
    return await prisma.job_requirement.findMany({
      where: { job_id: jobId }
    });
  },

  async getJobBookings(jobId: string) {
    return await prisma.booking.findMany({
      where: { job_id: jobId },
      include: { worker: true }
    });
  }
};
