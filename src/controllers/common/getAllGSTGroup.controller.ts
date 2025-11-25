import { Request, Response } from "express";
import { pool } from "../../db";
import { redis } from "../../db/redis";

export const getAllGSTGroup = async (req: Request, res: Response) => {
  try {
    const cacheKey = "gst_group:all";

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: gst_group");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: gst_group");

    const result = await pool.query(
      `
      SELECT gst_group_code, gst_percentage
      FROM posdb.gst_group
      ORDER BY gst_group_code ASC
      `
    );

    const gstGroups = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(gstGroups));

    return res.status(200).json(gstGroups);

  } catch (error: any) {
    console.error("Error fetching GST groups:", error);

    return res.status(500).json({
      message: "Failed to fetch GST groups",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
