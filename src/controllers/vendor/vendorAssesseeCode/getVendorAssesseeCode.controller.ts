import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVendorAssesseeCode = async (req: Request, res: Response) => {
  try {
    const cacheKey = "vendor:assessee:codes";

    // -----------------------------------------
    // 1️⃣ CHECK CACHE
    // -----------------------------------------
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // -----------------------------------------
    // 2️⃣ FETCH FROM DATABASE
    // -----------------------------------------
    const result = await pool.query(
      "SELECT * FROM posdb.vendor_assessee_code ORDER BY assessee_code ASC"
    );

    const data = result.rows;

    // -----------------------------------------
    // 3️⃣ STORE IN CACHE FOR 5 MIN
    // -----------------------------------------
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Error fetching Vendor Assessee Codes:", error);

    return res.status(500).json({
      message: "Failed to fetch Vendor Assessee Codes",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
