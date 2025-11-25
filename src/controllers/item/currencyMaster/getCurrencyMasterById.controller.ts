import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getCurrencyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing currency_code" });
    }

    const cacheKey = `currency:${id}`;

    // Try Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: currency");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: currency");

    const result = await pool.query(
      `SELECT * FROM posdb.currency_master WHERE currency_code = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Currency not found" });
    }

    const currency = result.rows[0];

    // Cache the result
    await redis.setex(cacheKey, 300, JSON.stringify(currency));

    return res.status(200).json(currency);

  } catch (error: any) {
    console.error("Error fetching currency:", error);
    return res.status(500).json({
      message: "Failed to Fetch Currency Master",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
