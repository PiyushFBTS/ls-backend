import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemHierarchyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // category_code

    if (!id) {
      return res.status(400).json({ error: "Missing category_code" });
    }

    const cacheKey = `item_hierarchy:${id}`;

    // Try Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      `SELECT * FROM posdb.item_hierarchy WHERE category_code = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item Hierarchy not found" });
    }

    const itemHierarchy = result.rows[0];

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(itemHierarchy));

    return res.status(200).json(itemHierarchy);

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
