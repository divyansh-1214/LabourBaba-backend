import { Request, Response } from "express";
import prisma from "../config/prisma";
import { generateToken } from "../utils/authUtils";
import { SignupCustomerReq, LoginCustomerReq } from "../type/api_req.type";

/**
 * Register a new customer client (Legacy - simplified for new DB schema).
 */
export const signupCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone }: SignupCustomerReq = req.body;

    // Check if phone number is already registered
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existingCustomer) {
      res.status(400).json({
        success: false,
        message: "Customer with this phone number already exists",
      });
      return;
    }

    // Create the customer in the database (only name and phone exist)
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
      },
    });

    // Generate JWT token
    const token = generateToken({
      id: customer.id,
      phone: customer.phone,
      role: "customer",
    });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: customer,
      token,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during customer signup",
    });
  }
};

/**
 * Log in an existing customer client (Legacy - simplified for new DB schema).
 */
export const loginCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone }: LoginCustomerReq = req.body;

    // Find the customer by phone number
    const customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer) {
      res.status(401).json({
        success: false,
        message: "Invalid phone number or password",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: customer.id,
      phone: customer.phone,
      role: "customer",
    });

    res.status(200).json({
      success: true,
      message: "Customer logged in successfully",
      data: customer,
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during customer login",
    });
  }
};
