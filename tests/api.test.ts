import request from "supertest";
import { app } from "../src/server";
import prisma from "../src/config/prisma";

// Mock the prisma client
jest.mock("../src/config/prisma", () => ({
  __esModule: true,
  default: {
    customer: {
      findUnique: jest.fn(),
    },
    worker: {
      findUnique: jest.fn(),
    },
  },
}));

describe("API Integration Tests", () => {
  describe("GET /health", () => {
    it("should return 200 and status OK", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "OK",
        timestamp: expect.any(String),
      });
    });
  });

  describe("POST /api/auth/send-otp", () => {
    it("should return 200 for valid input", async () => {
      const res = await request(app)
        .post("/api/auth/send-otp")
        .send({ phone: "+919876543210", type: "login" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "OTP sent successfully to +919876543210",
      });
    });

    it("should return 400 for invalid phone number", async () => {
      const res = await request(app)
        .post("/api/auth/send-otp")
        .send({ phone: "123", type: "login" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/verify-otp", () => {
    it("should verify OTP and return JWT for existing customer", async () => {
      const mockCustomer = { id: "a1b2c3d4-e5f6-7890-1234-56789abcdef0", phone: "+919876543210", name: "John Doe" };
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ phone: "+919876543210", otp: "123456" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data).toHaveProperty("refreshToken");
      expect(res.body.data.role).toBe("customer");
    });

    it("should return 401 for incorrect OTP", async () => {
      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ phone: "+919876543210", otp: "000000" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid OTP");
    });
  });
});
