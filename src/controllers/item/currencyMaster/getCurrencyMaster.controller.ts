import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getCurrency = async (req: Request, res: Response) => {
  try {
    const cacheKey = "currency:all";

    // Try Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(`
      SELECT *
      FROM posdb.currency_master
      ORDER BY currency_code ASC
    `);

    const currencies = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(currencies));

    return res.status(200).json(currencies);

  } catch (error: any) {
    console.error("Error fetching currencies:", error);

    return res.status(500).json({
      message: "Failed to load Currency Code",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
