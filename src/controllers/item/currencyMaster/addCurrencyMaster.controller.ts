import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const addCurrency = async (req: Request, res: Response) => {
  try {
    const { currency_code, currency_name, exchange_rate_amount } = req.body;

    if (!currency_code || !currency_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const currentUser = "system"; 
    const currentTime = new Date();

    await pool.query(
      `
      INSERT INTO posdb.currency_master (
        currency_code, 
        currency_name, 
        created_by, created_on,
        modified_by, modified_on,
        exchange_rate_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        currency_code,
        currency_name,
        currentUser,
        currentTime,
        currentUser,
        currentTime,
        exchange_rate_amount,
      ]
    );

    // Clear currency cache
    await redis.del("currency:all");

    return res.status(200).json({ message: "Currency added successfully" });
  } catch (error: any) {
    console.error("Error adding currency:", error);
    return res.status(500).json({
      message: "Failed to create currency",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
