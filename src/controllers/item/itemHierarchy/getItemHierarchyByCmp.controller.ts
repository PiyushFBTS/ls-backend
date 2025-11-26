import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemHierarchyByCmp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // cmp_code

    if (!id) {
      return res.status(400).json({ error: "Missing cmp_code" });
    }

    const cacheKey = `item_hierarchy:cmp:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      `SELECT * FROM posdb.item_hierarchy WHERE cmp_code = $1`,
      [id]
    );

    const rows = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(rows));

    return res.status(200).json(rows);

  } catch (error: any) {
    console.error("Error fetching Item Hierarchy:", error);
    return res.status(500).json({
      message: "Failed to Fetch Item Hierarchy",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
