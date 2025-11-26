import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemVariantById = async (req: Request, res: Response) => {
  try {
    const { item_variant_code, cmp_code } = req.query;

    // Validate required query params
    if (!item_variant_code || !cmp_code) {
      return res.status(400).json({
        error: "Missing item_variant_code or cmp_code",
      });
    }

    const cacheKey = `item_variant:id:${cmp_code}:${item_variant_code}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }


    const query = `
      SELECT *
      FROM posdb.item_variant
      WHERE item_variant_code = $1
      AND cmp_code = $2
    `;

    const result = await pool.query(query, [item_variant_code, cmp_code]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Item Variant not found for given item_variant_code & cmp_code",
      });
    }

    const data = result.rows[0];

    // Cache for 5 minutes
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
