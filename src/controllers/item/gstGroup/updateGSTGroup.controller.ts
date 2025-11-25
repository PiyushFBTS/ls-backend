import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateGSTGroup = async (req: Request, res: Response) => {
  try {
    const { gst_group_code, gst_percentage } = req.body;

    if (!gst_group_code || gst_percentage === undefined) {
      return res.status(400).json({
        error: "Missing gst_group_code or gst_percentage"
      });
    }

    const query = `
      UPDATE posdb.gst_group SET
        gst_percentage = $1
      WHERE gst_group_code = $2
    `;

    const values = [gst_percentage, gst_group_code];

    await pool.query(query, values);

    // Remove cache for all + single GST group
    await redis.del("gst_group:all");
    await redis.del(`gst_group:${gst_group_code}`);

    return res.status(200).json({
      message: "GST Group updated successfully"
    });

  } catch (error: any) {
    console.error("Error updating GST Group:", error);
    return res.status(500).json({
      message: "Failed to Update GST Group",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
