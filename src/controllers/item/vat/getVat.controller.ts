// controllers/vat/getAllVAT.ts
import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVat = async (req: Request, res: Response) => {
  try {
    const cacheKey = "vat:all";

    // 1️⃣ Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: vat:all");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: vat:all");

    // 2️⃣ Fetch from DB
    const query = `
      SELECT * 
      FROM posdb.vat 
      ORDER BY vat_code ASC
    `;

    const result = await pool.query(query);

    const data = result.rows;

    // 3️⃣ Cache result for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    // 4️⃣ Return response
    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Failed to fetch VAT:", error);

    return res.status(500).json({
      message: "Failed to Fetch VAT",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
