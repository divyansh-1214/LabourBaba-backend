import express from "express";
import { registerWorker, getMe, updateMe, updateLocation, updateOnline, uploadDocuments, getDocuments, getAnalytics, getBookings, getEarnings } from "../controllers/workerController";
import { validateBody } from "../middlewares/validationMiddleware";
import { CreateWorkerReqSchema, UpdateWorkerProfileReqSchema, UpdateWorkerLocationReqSchema, UpdateWorkerOnlineStatusReqSchema, UploadWorkerDocumentReqSchema, WorkerSchema, WorkerLocationSchema, WorkerDocumentSchema, WorkerAnalyticsSchema, BookingSchema } from "../schemas";
import { registry } from "../config/swagger";
import { z } from "zod";

const router = express.Router();

registry.registerPath({
  method: "post",
  path: "/api/workers/registerWorker",
  summary: "Create worker profile",
  tags: ["Workers"],
  request: { body: { content: { "application/json": { schema: CreateWorkerReqSchema } } } },
  responses: { 201: { description: "Created", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkerSchema }) } } } }
});

registry.registerPath({
  method: "get",
  path: "/api/workers/me",
  summary: "Get own profile",
  tags: ["Workers"],
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkerSchema }) } } } }
});

registry.registerPath({
  method: "patch",
  path: "/api/workers/me",
  summary: "Update name, phone, skill",
  tags: ["Workers"],
  request: { body: { content: { "application/json": { schema: UpdateWorkerProfileReqSchema } } } },
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkerSchema }) } } } }
});

registry.registerPath({
  method: "patch",
  path: "/api/workers/me/location",
  summary: "Update GPS coordinates",
  tags: ["Workers"],
  request: { body: { content: { "application/json": { schema: UpdateWorkerLocationReqSchema } } } },
  responses: { 200: { description: "Success" } }
});

registry.registerPath({
  method: "patch",
  path: "/api/workers/me/online",
  summary: "Toggle is_online true/false",
  tags: ["Workers"],
  request: { body: { content: { "application/json": { schema: UpdateWorkerOnlineStatusReqSchema } } } },
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkerSchema }) } } } }
});

registry.registerPath({
  method: "post",
  path: "/api/workers/me/documents",
  summary: "Upload Aadhaar/PAN to Supabase Storage",
  tags: ["Workers"],
  request: { body: { content: { "application/json": { schema: UploadWorkerDocumentReqSchema } } } },
  responses: { 201: { description: "Created", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkerDocumentSchema }) } } } }
});

registry.registerPath({
  method: "get",
  path: "/api/workers/me/documents",
  summary: "List uploaded documents",
  tags: ["Workers"],
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.array(WorkerDocumentSchema) }) } } } }
});

registry.registerPath({
  method: "get",
  path: "/api/workers/me/analytics",
  summary: "Get acceptance rate, avg response time",
  tags: ["Workers"],
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: WorkerAnalyticsSchema }) } } } }
});

registry.registerPath({
  method: "get",
  path: "/api/workers/me/bookings",
  summary: "List own booking history",
  tags: ["Workers"],
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.array(BookingSchema) }) } } } }
});

registry.registerPath({
  method: "get",
  path: "/api/workers/me/earnings",
  summary: "Earnings summary by date range",
  tags: ["Workers"],
  responses: { 200: { description: "Success", content: { "application/json": { schema: z.object({ success: z.boolean(), data: z.object({ earnings: z.number() }) }) } } } }
});

router.post("/registerWorker", validateBody(CreateWorkerReqSchema), registerWorker);
router.get("/me", getMe);
router.patch("/me", validateBody(UpdateWorkerProfileReqSchema), updateMe);
router.patch("/me/location", validateBody(UpdateWorkerLocationReqSchema), updateLocation);
router.patch("/me/online", validateBody(UpdateWorkerOnlineStatusReqSchema), updateOnline);
router.post("/me/documents", validateBody(UploadWorkerDocumentReqSchema), uploadDocuments);
router.get("/me/documents", getDocuments);
router.get("/me/analytics", getAnalytics);
router.get("/me/bookings", getBookings);
router.get("/me/earnings", getEarnings);

export default router;
