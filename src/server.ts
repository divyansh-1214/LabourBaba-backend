import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import prisma from "./config/prisma";
import workerRoutes from "./routes/workerRoutes";
import clientRoute from "./routes/customerRoutes";
import skillRoute from "./routes/skillRouter";
import jobRoutes from "./routes/jobRoutes";
import authRoutes from "./routes/authRoutes";
import dispatchRoutes from "./routes/dispatchRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import chatRoutes from "./routes/chatRoutes";
import adminRoutes from "./routes/adminRoutes";
import { setupSwagger } from "./config/swagger";
import workerLocationRoute from "./routes/worker_location.routes";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({ origin: process.env.FRONT_END_URL }))
// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/clients", clientRoute);
app.use("/api/workers", workerRoutes);
app.use("/api/skill", skillRoute);
app.use("/api/worker_location", workerLocationRoute);
app.use("/api/jobs", jobRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

// Setup Swagger UI
setupSwagger(app);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Database connection test and startup
async function startServer() {
  try {
    // Attempt to connect to Supabase
    console.log("Connecting to Supabase PostgreSQL database...");
    try {
      await prisma.$connect();
      console.log(
        "Database connection established successfully via Prisma Client.",
      );
    } catch (e) {
      console.log("there is error in the connecting the db", e);
    }
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app };
