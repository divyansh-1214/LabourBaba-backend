import request from "supertest";

// Mock Bull Board to prevent queue adapter validation failures during test server startup
jest.mock("@bull-board/api", () => ({
  createBullBoard: jest.fn().mockReturnValue({}),
}));
jest.mock("@bull-board/api/bullMQAdapter", () => ({
  BullMQAdapter: jest.fn().mockImplementation(() => ({})),
}));
jest.mock("@bull-board/express", () => ({
  ExpressAdapter: jest.fn().mockImplementation(() => ({
    setBasePath: jest.fn(),
    getRouter: jest.fn().mockReturnValue((req: any, res: any, next: any) => next()),
  })),
}));

// Mock the bullmq module itself to avoid Redis connection attempts
jest.mock("bullmq", () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn().mockResolvedValue({}),
    })),
    Worker: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn(),
    })),
  };
});

// Mock BullMQ queue config to prevent real connection attempts
jest.mock("../src/config/bullmq", () => ({
  dispatchQueue: {
    add: jest.fn(),
  },
  timeoutQueue: {
    add: jest.fn(),
  },
  connection: {},
}));

// Mock the prisma client fully
jest.mock("../src/config/prisma", () => ({
  __esModule: true,
  default: {
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    worker: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    job_requirement: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    job_dispatch: {
      updateMany: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    worker_location: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    skill_category: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
    $executeRaw: jest.fn(),
  },
}));

import { app } from "../src/server";
import prisma from "../src/config/prisma";
import { dispatchQueue, timeoutQueue } from "../src/config/bullmq";
import { generateToken } from "../src/utils/authUtils";

const MOCK_CUSTOMER_ID = "a1b2c3d4-e5f6-4890-a234-56789abcdef0";
const MOCK_WORKER_ID = "11b2c3d4-e5f6-4890-a234-56789abcdef1";
const MOCK_ADMIN_ID = "22b2c3d4-e5f6-4890-a234-56789abcdef2";
const MOCK_BOOKING_ID = "33b2c3d4-e5f6-4890-a234-56789abcdef3";

describe("API Protection and JWT Validation Tests", () => {
  let customerToken: string;
  let workerToken: string;
  let adminToken: string;

  beforeAll(() => {
    customerToken = generateToken({ id: MOCK_CUSTOMER_ID, phone: "+919876543210", role: "customer" });
    workerToken = generateToken({ id: MOCK_WORKER_ID, phone: "+919999999999", role: "worker" });
    adminToken = generateToken({ id: MOCK_ADMIN_ID, phone: "+918888888888", role: "admin" });
  });

  beforeEach(() => {
    // Re-apply mock implementations before each test to prevent resetMocks from discarding them
    (dispatchQueue.add as jest.Mock).mockResolvedValue({});
    (timeoutQueue.add as jest.Mock).mockResolvedValue({});

    (prisma.$transaction as jest.Mock).mockImplementation((cb) => cb(prisma));
    (prisma.$executeRaw as jest.Mock).mockResolvedValue(1);

    (prisma.customer.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.customer.create as jest.Mock).mockResolvedValue({});

    (prisma.worker.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.worker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.worker.create as jest.Mock).mockResolvedValue({});
    (prisma.worker.update as jest.Mock).mockResolvedValue({});

    (prisma.job.create as jest.Mock).mockResolvedValue({});
    (prisma.job.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.job.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.job.update as jest.Mock).mockResolvedValue({});

    (prisma.job_requirement.create as jest.Mock).mockResolvedValue({});
    (prisma.job_requirement.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.job_requirement.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    (prisma.job_dispatch.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

    (prisma.worker_location.create as jest.Mock).mockResolvedValue({});

    (prisma.payment.create as jest.Mock).mockResolvedValue({});
    (prisma.payment.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.payment.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.payment.update as jest.Mock).mockResolvedValue({});
    (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    (prisma.review.create as jest.Mock).mockResolvedValue({});
    (prisma.review.findMany as jest.Mock).mockResolvedValue([]);

    (prisma.skill_category.create as jest.Mock).mockResolvedValue({});
    (prisma.skill_category.findMany as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Customer Endpoints (/api/clients)", () => {
    it("GET /api/clients should return 401 when unauthenticated", async () => {
      const res = await request(app).get("/api/clients");
      expect(res.status).toBe(401);
    });

    it("GET /api/clients should return 200 when authenticated", async () => {
      (prisma.customer.findMany as jest.Mock).mockResolvedValue([]);
      const res = await request(app)
        .get("/api/clients")
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("POST /api/clients/add should return 401 when unauthenticated", async () => {
      const res = await request(app).post("/api/clients/add").send({ name: "Jane", phone: "+919876543215" });
      expect(res.status).toBe(401);
    });

    it("POST /api/clients/add should return 201 when authenticated", async () => {
      const mockCustomer = { id: MOCK_CUSTOMER_ID, name: "Jane", phone: "+919876543215" };
      (prisma.customer.create as jest.Mock).mockResolvedValue(mockCustomer);
      const res = await request(app)
        .post("/api/clients/add")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ name: "Jane", phone: "+919876543215" });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Job Endpoints (/api/jobs)", () => {
    it("POST /api/jobs should return 401 when unauthenticated", async () => {
      const res = await request(app).post("/api/jobs").send({ customer_id: MOCK_CUSTOMER_ID, latitude: 12.34, longitude: 56.78 });
      expect(res.status).toBe(401);
    });

    it("POST /api/jobs should return 201 when authenticated", async () => {
      const mockJob = { id: "job-uuid", customer_id: MOCK_CUSTOMER_ID, status: "OPEN" };
      (prisma.job.create as jest.Mock).mockResolvedValue(mockJob);
      (prisma.job_requirement.findMany as jest.Mock).mockResolvedValue([]);
      const res = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ customer_id: MOCK_CUSTOMER_ID, latitude: 12.34, longitude: 56.78, requirements: [] });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("GET /api/jobs should return 401 when unauthenticated", async () => {
      const res = await request(app).get("/api/jobs");
      expect(res.status).toBe(401);
    });

    it("GET /api/jobs should return 200 when authenticated", async () => {
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);
      const res = await request(app)
        .get("/api/jobs")
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("GET /api/jobs/:jobId should return 401 when unauthenticated", async () => {
      const res = await request(app).get(`/api/jobs/${MOCK_BOOKING_ID}`);
      expect(res.status).toBe(401);
    });

    it("GET /api/jobs/:jobId should return 200 when authenticated", async () => {
      (prisma.job.findUnique as jest.Mock).mockResolvedValue({ id: MOCK_BOOKING_ID });
      const res = await request(app)
        .get(`/api/jobs/${MOCK_BOOKING_ID}`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("PATCH /api/jobs/:jobId/cancel should return 401 when unauthenticated", async () => {
      const res = await request(app).patch(`/api/jobs/${MOCK_BOOKING_ID}/cancel`);
      expect(res.status).toBe(401);
    });

    it("PATCH /api/jobs/:jobId/cancel should return 200 when authenticated", async () => {
      (prisma.job.findUnique as jest.Mock).mockResolvedValue({ id: MOCK_BOOKING_ID, customer_id: MOCK_CUSTOMER_ID });
      (prisma.job.update as jest.Mock).mockResolvedValue({ id: MOCK_BOOKING_ID, status: "CANCELLED" });
      const res = await request(app)
        .patch(`/api/jobs/${MOCK_BOOKING_ID}/cancel`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Worker Location Endpoints (/api/worker_location)", () => {
    it("POST /api/worker_location/add should return 401 when unauthenticated", async () => {
      const res = await request(app).post("/api/worker_location/add").send({ latitude: 12.34, longitude: 56.78 });
      expect(res.status).toBe(401);
    });

    it("POST /api/worker_location/add should return 200 when authenticated", async () => {
      (prisma.worker_location.create as jest.Mock).mockResolvedValue({ id: "loc-uuid" });
      const res = await request(app)
        .post("/api/worker_location/add")
        .set("Authorization", `Bearer ${workerToken}`)
        .send({ latitude: 12.34, longitude: 56.78 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Skill Endpoints (/api/skill)", () => {
    it("POST /api/skill/add should return 401 when unauthenticated", async () => {
      const res = await request(app).post("/api/skill/add").send({ name: "Carpentry" });
      expect(res.status).toBe(401);
    });

    it("POST /api/skill/add should return 200 when authenticated (matches controller)", async () => {
      (prisma.skill_category.create as jest.Mock).mockResolvedValue({ id: "skill-uuid", name: "Carpentry" });
      const res = await request(app)
        .post("/api/skill/add")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Carpentry" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("GET /api/skill (public) should return 200 without token", async () => {
      (prisma.skill_category.findMany as jest.Mock).mockResolvedValue([]);
      const res = await request(app).get("/api/skill");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Payment Endpoints (/api/payments)", () => {
    it("POST /api/payments/:bookingId/create-order should return 401 when unauthenticated", async () => {
      const res = await request(app).post(`/api/payments/${MOCK_BOOKING_ID}/create-order`).send({ booking_id: MOCK_BOOKING_ID, amount: 500 });
      expect(res.status).toBe(401);
    });

    it("POST /api/payments/:bookingId/create-order should return 201 when authenticated", async () => {
      (prisma.payment.create as jest.Mock).mockResolvedValue({ id: "payment-uuid", status: "CREATED" });
      const res = await request(app)
        .post(`/api/payments/${MOCK_BOOKING_ID}/create-order`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ booking_id: MOCK_BOOKING_ID, amount: 500 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("GET /api/payments/:bookingId should return 401 when unauthenticated", async () => {
      const res = await request(app).get(`/api/payments/${MOCK_BOOKING_ID}`);
      expect(res.status).toBe(401);
    });

    it("GET /api/payments/:bookingId should return 200 when authenticated", async () => {
      (prisma.payment.findMany as jest.Mock).mockResolvedValue([]);
      const res = await request(app)
        .get(`/api/payments/${MOCK_BOOKING_ID}`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Review Endpoints (/api/reviews)", () => {
    it("POST /api/reviews/:bookingId should return 401 when unauthenticated", async () => {
      const res = await request(app).post(`/api/reviews/${MOCK_BOOKING_ID}`).send({
        booking_id: MOCK_BOOKING_ID,
        worker_id: MOCK_WORKER_ID,
        customer_id: MOCK_CUSTOMER_ID,
        rating: 5,
        comment: "Great!"
      });
      expect(res.status).toBe(401);
    });

    it("POST /api/reviews/:bookingId should return 201 when authenticated", async () => {
      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({ id: MOCK_BOOKING_ID, worker_id: MOCK_WORKER_ID });
      (prisma.review.create as jest.Mock).mockResolvedValue({ id: "review-uuid" });
      const res = await request(app)
        .post(`/api/reviews/${MOCK_BOOKING_ID}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          booking_id: MOCK_BOOKING_ID,
          worker_id: MOCK_WORKER_ID,
          customer_id: MOCK_CUSTOMER_ID,
          rating: 5,
          comment: "Great!"
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Admin Endpoints (/api/admin)", () => {
    it("GET /api/admin/workers should return 401 when unauthenticated", async () => {
      const res = await request(app).get("/api/admin/workers");
      expect(res.status).toBe(401);
    });

    it("GET /api/admin/workers should return 200 when authenticated", async () => {
      (prisma.worker.findMany as jest.Mock).mockResolvedValue([]);
      const res = await request(app)
        .get("/api/admin/workers")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
