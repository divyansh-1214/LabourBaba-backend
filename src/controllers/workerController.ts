import { Request, Response } from "express";
import { workerService } from "../services/workerServices";
import { CreateWorkerReq, UpdateWorkerProfileReq, UpdateWorkerLocationReq, UpdateWorkerOnlineStatusReq, UploadWorkerDocumentReq } from "../type/api_req.type";

// We extract workerId from the JWT token (mocked as coming from req.user or hardcoded for now)
const getWorkerId = (req: Request) => {
  // TODO: Replace with req.user.id once auth middleware is integrated
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  // Temporary mock decoding for demo
  return "b2a6543b-2403-469b-8a8b-302a24d081f9"; 
};

export const registerWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: CreateWorkerReq = req.body;
    const worker = await workerService.register(payload);
    res.status(201).json({ success: true, data: worker });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = getWorkerId(req);
    if (!workerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const worker = await workerService.getProfile(workerId);
    res.status(200).json({ success: true, data: worker });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = getWorkerId(req);
    if (!workerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const payload: UpdateWorkerProfileReq = req.body;
    const worker = await workerService.updateProfile(workerId, payload);
    res.status(200).json({ success: true, data: worker });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = getWorkerId(req);
    if (!workerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const payload: UpdateWorkerLocationReq = req.body;
    const location = await workerService.updateLocation(workerId, payload);
    res.status(200).json({ success: true, data: location });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOnline = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = getWorkerId(req);
    if (!workerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const payload: UpdateWorkerOnlineStatusReq = req.body;
    const worker = await workerService.updateOnlineStatus(workerId, payload);
    res.status(200).json({ success: true, data: worker });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = getWorkerId(req);
    if (!workerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const payload: UploadWorkerDocumentReq = req.body;
    const document = await workerService.uploadDocument(workerId, payload);
    res.status(201).json({ success: true, data: document });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = getWorkerId(req);
    if (!workerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const documents = await workerService.getDocuments(workerId);
    res.status(200).json({ success: true, data: documents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = getWorkerId(req);
    if (!workerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const analytics = await workerService.getAnalytics(workerId);
    res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = getWorkerId(req);
    if (!workerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const bookings = await workerService.getBookings(workerId);
    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = getWorkerId(req);
    if (!workerId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    const earnings = await workerService.getEarnings(workerId);
    res.status(200).json({ success: true, data: { earnings } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
