import express from "express";
import { getWorkers } from "../controllers/workerController";
import { WorkerSchema } from "../schemas";
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

router.get("/", getWorkers);

export default router;
