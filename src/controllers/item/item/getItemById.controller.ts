import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // item_code

    if (!id) {
      return res.status(400).json({ error: "Missing item_code" });
    }

    const cacheKey = `item:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: item_by_id");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: item_by_id");

    const result = await pool.query(
      `SELECT * FROM posdb.item WHERE item_code = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = result.rows[0];

    // Convert PostgreSQL bytea buffer → base64 URL
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
