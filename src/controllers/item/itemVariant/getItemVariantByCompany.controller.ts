import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemVariantByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // cmp_code

    if (!id) {
      return res.status(400).json({ error: "Missing cmp_code" });
    }

    const cacheKey = `item_variant:list:cmp:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: item_variant_by_company");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: item_variant_by_company");

    const query = `
      SELECT * 
      FROM posdb.item_variant 
      WHERE cmp_code = $1
      ORDER BY item_variant_code
    `;

    const result = await pool.query(query, [id]);
    const data = result.rows;

    // Store in Redis for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Failed to fetch Item Variant:", error);

    return res.status(500).json({
      message: "Failed to Fetch Item Variant",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
