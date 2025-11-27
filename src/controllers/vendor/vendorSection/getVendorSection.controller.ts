import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVendorSection = async (req: Request, res: Response) => {
  try {
    const cacheKey = "vendor:sections";


    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(`
      SELECT * 
      FROM posdb.vendor_section 
      ORDER BY section_code ASC
    `);

    const sections = result.rows;

    await redis.setex(cacheKey, 300, JSON.stringify(sections));

    return res.status(200).json(sections);

  } catch (error: any) {
    console.error("Error fetching Vendor Sections:", error);

    return res.status(500).json({
      message: "Failed to fetch Vendor Sections",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
