import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemsByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // cmp_code

    if (!id) {
      return res.status(400).json({ error: "Missing cmp_code" });
    }

    const cacheKey = `items:company:${id}`;

    // Check redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: items_by_company");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: items_by_company");

    const result = await pool.query(
      `SELECT * FROM posdb.item WHERE cmp_code = $1`,
      [id]
    );

    const items = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(items));

    return res.status(200).json(items);

  } catch (error: any) {
    console.error("Error fetching items by company:", error);

    return res.status(500).json({
      message: "Failed to Fetch item",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
