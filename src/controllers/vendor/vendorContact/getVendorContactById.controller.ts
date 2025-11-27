import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVendorContactById = async (req: Request, res: Response) => {
  try {
    const { contact_code, cmp_code } = req.query;

    // Validate
    if (!contact_code || !cmp_code) {
      return res.status(400).json({
        error: "Both contact_code and cmp_code are required",
      });
    }

    const cacheKey = `vendor_contact:${cmp_code}:${contact_code}`;

    // 1️⃣ Check Redis Cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // 2️⃣ Fetch From DB
    const result = await pool.query(
      `SELECT * FROM posdb.vendor_contact 
       WHERE contact_code = $1 AND cmp_code = $2`,
      [contact_code, cmp_code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Vendor contact not found",
      });
    }

    const data = result.rows[0];

    // 3️⃣ Cache for 5 min
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Error fetching Vendor Contact:", error);

    return res.status(500).json({
      message: "Failed to fetch Vendor Contact",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
