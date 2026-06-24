export interface CreateWorkerReq {
  name: string;
  phone: string;
  profile_picture_url?: string;
  aadhaar_last4?: string;
  skill_category_id: string;
  years_of_experience?: number;
  device_id?: string;
  device_token?: string;
}
// Create Customer
export interface CreateCustomerReq {
  name: string;
  phone: string;
  email?: string;
  city?: string;
}
// Create Job
export interface CreateJobReq {
  customer_id: string;
  category_id: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  budget: number;
}
// Apply Job
export interface ApplyJobReq {
  job_id: string;
  worker_id: string;
}
// Dispatch Job
export interface DispatchJobReq {
  job_id: string;
  worker_id: string;
  rank: number;
}
// Create Booking
export interface CreateBookingReq {
  job_id: string;
  worker_id: string;
  customer_id: string;
}
// Verify OTP
export interface VerifyOtpReq {
  booking_id: string;
  otp: string;
}
// Create Payment
export interface CreatePaymentReq {
  booking_id: string;
  amount: number;
}
// Create Review
export interface CreateReviewReq {
  booking_id: string;
  worker_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
}
// Send Message
export interface SendMessageReq {
  conversation_id: string;
  sender_id: string;
  content: string;
}
// Update Worker Location
export interface UpdateWorkerLocationReq {
  worker_id: string;
  latitude: number;
  longitude: number;
  location: string;
}
// Upload Worker Document
export interface UploadWorkerDocumentReq {
  worker_id: string;
  document_type: "AADHAAR" | "PAN" | "SELFIE";
  file_url: string;
}
// Recommended Enums
// Instead of plain strings:

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
