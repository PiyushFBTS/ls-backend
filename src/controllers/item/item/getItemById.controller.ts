import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { item_code, cmp_code } = req.query;

    // Validate inputs
    if (!item_code || !cmp_code) {
      return res.status(400).json({
        error: "Missing required query parameters: item_code, cmp_code",
      });
    }

    const cacheKey = `item:${cmp_code}:${item_code}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const query = `
      SELECT *
      FROM posdb.item
      WHERE item_code = $1
      AND cmp_code = $2
    `;

    const result = await pool.query(query, [item_code, cmp_code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = result.rows[0];

    // Convert picture bytea to base64 if exists
    if (item.picture && Buffer.isBuffer(item.picture)) {
      const base64 = item.picture.toString("base64");
      item.picture = `data:image/jpeg;base64,${base64}`;
    }

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(item));

    return res.status(200).json(item);

  } catch (error: any) {
    console.error("Error fetching Item:", error);
    return res.status(500).json({
      message: "Failed to Fetch Item",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
