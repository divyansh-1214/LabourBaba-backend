import { z } from "zod";
import {
  CreateWorkerReqSchema,
  CreateCustomerReqSchema,
  CreateJobReqSchema,
  ApplyJobReqSchema,
  DispatchJobReqSchema,
  CreateBookingReqSchema,
  VerifyOtpReqSchema,
  CreatePaymentReqSchema,
  CreateReviewReqSchema,
  SendMessageReqSchema,
  UpdateWorkerLocationReqSchema,
  UploadWorkerDocumentReqSchema,
  SignupCustomerReqSchema,
  LoginCustomerReqSchema
} from "../schemas";

export type CreateWorkerReq = z.infer<typeof CreateWorkerReqSchema>;
export type CreateCustomerReq = z.infer<typeof CreateCustomerReqSchema>;
export type CreateJobReq = z.infer<typeof CreateJobReqSchema>;
export type ApplyJobReq = z.infer<typeof ApplyJobReqSchema>;
export type DispatchJobReq = z.infer<typeof DispatchJobReqSchema>;
export type CreateBookingReq = z.infer<typeof CreateBookingReqSchema>;
export type VerifyOtpReq = z.infer<typeof VerifyOtpReqSchema>;
export type CreatePaymentReq = z.infer<typeof CreatePaymentReqSchema>;
export type CreateReviewReq = z.infer<typeof CreateReviewReqSchema>;
export type SendMessageReq = z.infer<typeof SendMessageReqSchema>;
export type UpdateWorkerLocationReq = z.infer<typeof UpdateWorkerLocationReqSchema>;
export type UploadWorkerDocumentReq = z.infer<typeof UploadWorkerDocumentReqSchema>;
export type SignupCustomerReq = z.infer<typeof SignupCustomerReqSchema>;
export type LoginCustomerReq = z.infer<typeof LoginCustomerReqSchema>;

export enum JobStatus {
  OPEN = "OPEN",
  DISPATCHING = "DISPATCHING",
  BOOKED = "BOOKED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum BookingStatus {
  PENDING = "PENDING",
  OTP_PENDING = "OTP_PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum VerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED"
}
