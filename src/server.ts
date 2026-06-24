import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import prisma from "./config/prisma";
import workerRoutes from "./routes/workerRoutes";
import clientRoute from "./routes/customerRoutes"
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/workers", workerRoutes);
app.use("/api/clients", clientRoute);
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

startServer();
