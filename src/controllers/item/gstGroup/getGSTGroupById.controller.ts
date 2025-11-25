import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getGSTGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing gst_group_code" });
    }

    const cacheKey = `gst_group:${id}`;

    // Try Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: gst_group");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: gst_group");

    const result = await pool.query(
      `SELECT * FROM posdb.gst_group WHERE gst_group_code = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "GST Group not found" });
    }

    const gstGroup = result.rows[0];

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(gstGroup));

    return res.status(200).json(gstGroup);
  } catch (error: any) {
    console.error("Error fetching GST Group by id:", error);
    return res.status(500).json({
      message: "Failed to Fetch GST Group",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
