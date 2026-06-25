import { Request, Response } from "express";
import prisma from "../config/prisma";

export const addLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const worker = prisma.worker_location.create({ data })
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
