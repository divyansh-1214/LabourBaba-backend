import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CreateCustomerReq } from "../type/api_req.type"
import { redis } from "../config/redis"
import { errors } from "@upstash/redis";
export const getWorkers = async (req: Request, res: Response,): Promise<void> => {
  try {
    const workers = await prisma.worker.findMany();
    console.log(workers)
    res.status(200).json({
      success: true,
      data: workers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "An error occurred",
    });
  }
};


export const addWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: CreateCustomerReq = req.body;
    console.log(payload)
    const worker = await prisma.worker.create({
      data: payload
    })

    res.status(201).json({
      success: true,
      data: worker,
    });
  } catch (error: any) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const locate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, lon, lat } = req.body;
    const worker = prisma.worker.findFirst({ where: { id } })

    console.log(worker);
    res.status(200).json({
      succes: "true",
      data: worker
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
