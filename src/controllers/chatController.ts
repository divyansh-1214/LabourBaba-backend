import { Request, Response } from "express";
import { chatService } from "../services/chatServices";

const getUserId = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  return "b2a6543b-2403-469b-8a8b-302a24d081f9"; // mock
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params as any;
    const userId = getUserId(req);
    if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    
    const messages = await chatService.getMessages(bookingId);
    res.status(200).json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params as any;
    const { content } = req.body;
    const userId = getUserId(req);
    if (!userId) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }
    
    const message = await chatService.sendMessage(bookingId, userId, content);
    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
