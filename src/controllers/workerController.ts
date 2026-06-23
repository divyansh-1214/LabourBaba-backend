import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getWorkers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const workers = await prisma.worker.findMany();

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
