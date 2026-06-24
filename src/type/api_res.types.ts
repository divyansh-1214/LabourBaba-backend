import { z } from "zod";
import {
  CustomerSchema,
  WorkerSchema,
  SkillCategorySchema,
  JobSchema,
  BookingSchema,
  PaymentSchema,
  ReviewSchema
} from "../schemas";

export type Customer = z.infer<typeof CustomerSchema>;
export type Worker = z.infer<typeof WorkerSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type Job = z.infer<typeof JobSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Review = z.infer<typeof ReviewSchema>;

export interface JobApplication {
  id: string;
  job_id?: string;
  worker_id?: string;
  status?: string;
  distance_km?: number;
  application_score?: number;
}
export interface JobDispatch {
  id: string;
  job_id?: string;
  worker_id?: string;
  rank?: number;
  status?: string;
  notified_at?: Date;
  responded_at?: Date;
  expires_at?: Date;
}
export interface Conversation {
  id: string;
  booking_id?: string;
  worker_id?: string;
  customer_id?: string;
  created_at?: Date;
}
export interface Message {
  id: string;
  conversation_id?: string;
  sender_id?: string;
  content?: string;
  created_at?: Date;
}
export interface Notification {
  id: string;
  worker_id?: string;
  job_id?: string;
  type?: string;
  is_read?: boolean;
  created_at?: Date;
}
export interface WorkerAnalytics {
  id: string;
  worker_id?: string;
  avg_response_time_s?: number;
  acceptance_rate?: number;
  completion_rate?: number;
  calculated_at?: Date;
}
export interface WorkerDevice {
  id: string;
  worker_id?: string;
  device_id?: string;
  ip_address?: string;
  first_seen?: Date;
  last_seen?: Date;
}
export interface WorkerDocument {
  id: string;
  worker_id?: string;
  document_type?: string;
  file_url?: string;
  status?: string;
}
export interface WorkerLocation {
  id: string;
  worker_id?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  updated_at?: Date;
}

export interface CreateJobDto {
  customer_id: string;
  category_id: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  budget: number;
}
export interface ApplyJobDto {
  job_id: string;
  worker_id: string;
}
export interface CreateBookingDto {
  job_id: string;
  worker_id: string;
  customer_id: string;
}
export interface CreateReviewDto {
  booking_id: string;
  worker_id: string;
  customer_id: string;
  rating: number;
  comment: string;
}
