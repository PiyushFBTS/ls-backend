import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVendorPaymentTermsById = async (req: Request, res: Response) => {
  try {
    const { payment_terms_code, cmp_code } = req.query;

    // Validate inputs
    if (!payment_terms_code || !cmp_code) {
      return res.status(400).json({
        error: "payment_terms_code (id) and cmp_code are required",
      });
    }

    const cacheKey = `vendor_payment_terms:${cmp_code}:${payment_terms_code}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      `
        SELECT * 
        FROM posdb.vendor_payment_terms 
        WHERE payment_terms_code = $1 AND cmp_code = $2
      `,
      [payment_terms_code, cmp_code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Vendor payment terms not found",
      });
    }

    const data = result.rows[0]
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Error fetching vendor payment terms:", error);

    return res.status(500).json({
      message: "Failed to fetch Vendor payment terms",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
