import { Request, Response } from "express";
import prisma from "../config/prisma";
export const getClient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const clients = await prisma.client.findMany();

    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "An error occurred",
    });
  }
};
