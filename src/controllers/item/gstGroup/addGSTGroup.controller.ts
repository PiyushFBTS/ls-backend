import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const addGST = async (req: Request, res: Response) => {
  try {
    const { gst_group_code, gst_percentage } = req.body;

    // Validate required fields
    if (!gst_group_code || gst_percentage === undefined) {
      return res.status(400).json({
        error: "Missing gst_group_code or gst_percentage",
      });
    }

    const query = `
      INSERT INTO posdb.gst_group (
        gst_group_code, 
        gst_percentage
      ) 
      VALUES ($1, $2)
    `;

    const values = [gst_group_code, gst_percentage];

    await pool.query(query, values);

    // Clear cache for GST group list
    await redis.del("gst_group:all");

    return res.status(200).json({
      message: "GST Group added successfully",
    });
  } catch (error: any) {
    console.error("Error inserting GST group:", error);

    return res.status(500).json({
      message: "Failed to create GST Group",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
