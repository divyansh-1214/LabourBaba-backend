import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CreateJobReq } from "../type/api_req.type";
import { makeJob } from "../services/job.services";

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        category: true,
      },
    });
    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "An error occurred while fetching jobs",
    });
  }
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: CreateJobReq = req.body;
    const job = await makeJob(payload)
    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "An error occurred while creating the job",
    });
  }
};
