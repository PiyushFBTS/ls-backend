import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateCurrency = async (req: Request, res: Response) => {
  try {
    const { 
      currency_code, 
      currency_name, 
      created_by, 
      created_on, 
      exchange_rate_amount 
    } = req.body;

    if (!currency_code || !currency_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const currentUser ="system"; // (use your JWT middleware)
    const currentTime = new Date();

    const query = `
      UPDATE posdb.currency_master SET
        currency_name = $1,
        created_by = $2,
        created_on = $3,
        modified_by = $4,
        modified_on = $5,
        exchange_rate_amount = $6
      WHERE currency_code = $7
    `;

    const values = [
      currency_name,
      created_by,
      created_on,
      currentUser,
      currentTime,
      exchange_rate_amount,
      currency_code,
    ];

    await pool.query(query, values);

    // Clear related Redis cache
    await redis.del("currency:all");
    await redis.del(`currency:${currency_code}`);

    return res
      .status(200)
      .json({ message: "Currency Master updated successfully" });

  } catch (error: any) {
    console.error("Error updating currency:", error);
    return res.status(500).json({
      message: "Failed to Update Currency Master",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
