import { Request, Response } from "express";
import prisma from "../config/prisma";
import { convertToGeography } from "../utils/locationUtils";

export const addLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { worker_id, latitude, longitude, location } = req.body;

    const locationGeo = convertToGeography(longitude, latitude);

    const workerLocation = await prisma.worker_location.upsert({
      where: { worker_id },
      update: {
        latitude,
        longitude,
        location,
        updated_at: new Date(),
      },
      create: {
        worker_id,
        latitude,
        longitude,
        location,
        updated_at: new Date(),
      },
    });

    // Update worker's geography location
    await prisma.worker.update({
      where: { id: worker_id },
      data: {
        location_geo: locationGeo,
      },
    });

    res.status(200).json({
      success: true,
      data: workerLocation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
