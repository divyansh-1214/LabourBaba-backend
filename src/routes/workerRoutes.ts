import express from "express";
import { getWorkers, addWorker, locate } from "../controllers/workerController";
import { WorkerSchema, CreateWorkerReqSchema, LocateWorkerReqSchema } from "../schemas";
import { registry } from "../config/swagger";
import { z } from "zod";

const router = express.Router();

// Register GET /api/workers
registry.registerPath({
  method: "get",
  path: "/api/workers",
  summary: "Get all workers",
  tags: ["Workers"],
  responses: {
    200: {
      description: "List of all workers",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(WorkerSchema),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
    },
  },
});

// Register POST /api/workers/add
registry.registerPath({
  method: "post",
  path: "/api/workers/add",
  summary: "Create a new worker",
  tags: ["Workers"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateWorkerReqSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Worker created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: WorkerSchema,
          }),
        },
      },
    },
    400: {
      description: "Validation failed",
    },
    500: {
      description: "Internal server error",
    },
  },
});

// Register POST /api/workers/locate
registry.registerPath({
  method: "post",
  path: "/api/workers/locate",
  summary: "Locate a worker by ID and coordinates",
  tags: ["Workers"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LocateWorkerReqSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Worker location details fetched successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: WorkerSchema,
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
    },
  },
});

router.get("/", getWorkers);
router.post("/add", addWorker)
router.post("/locate", locate);

export default router;
