import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVendorAssesseeCodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate
    if (!id) {
      return res.status(400).json({ error: "assessee_code is required" });
    }

    const cacheKey = `vendor_assessee:${id}`;

    // 1️⃣ Check Redis Cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 2️⃣ Fetch from DB
    const result = await pool.query(
      "SELECT * FROM posdb.vendor_assessee_code WHERE assessee_code = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Vendor Assessee Code not found",
      });
    }

    const data = result.rows[0];

    // 3️⃣ Save to Redis (5 minutes)
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Error fetching Vendor Assessee Code:", error);

    return res.status(500).json({
      message: "Failed to Fetch Vendor Assessee Code",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
