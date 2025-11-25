import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteGSTGroup = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const query = `
      DELETE FROM posdb.gst_group
      WHERE gst_group_code = ANY($1::text[])
    `;

    await pool.query(query, [ids]);

    // Clear cached GST list
    await redis.del("gst_group:all");

    return res
      .status(200)
      .json({ message: "GST Group deleted successfully" });

  } catch (error: any) {
    console.error("Error deleting GST Group:", error);
    return res.status(500).json({
      message: "Failed to Delete GST Group",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
