import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemSalesByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Company code is required" });
    }

    const cacheKey = `sales_price:company:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      `SELECT * FROM posdb.sales_price WHERE cmp_code = $1`,
      [id]
    );

    const data = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Failed to fetch Item Sales:", error);

    return res.status(500).json({
      message: "Failed to Fetch Sales",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
