import { Request, Response } from "express";
import { jobService } from "../services/job.services";
import { jobReqService } from "../services/jobReqServices";
import { CreateJobReq, CreateJobRequirementReq } from "../type/api_req.type";

const getCustomerId = (req: Request) => {
  // TODO: Replace with req.user.id once auth is integrated
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  return "a1b2c3d4-e5f6-7890-1234-56789abcdef0"; 
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: CreateJobReq = req.body;
    const job = await jobService.createJob(payload);
    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    if (!customerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const jobs = await jobService.getJobsByCustomer(customerId);
    res.status(200).json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params as any;
    const job = await jobService.getJobDetail(jobId);
    res.status(200).json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params as any;
    const customerId = getCustomerId(req);
    if (!customerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const response = await jobService.cancelJob(jobId, customerId);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobRequirements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params as any;
    const requirements = await jobService.getJobRequirements(jobId);
    res.status(200).json({ success: true, data: requirements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params as any;
    const bookings = await jobService.getJobBookings(jobId);
    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createJobRequirement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params as any;
    const payload: CreateJobRequirementReq = req.body;
    const requirement = await jobReqService.createJobReq(jobId, payload);
    res.status(201).json({ success: true, data: requirement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

