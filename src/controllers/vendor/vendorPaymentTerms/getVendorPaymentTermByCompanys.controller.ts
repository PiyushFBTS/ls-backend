import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVendorPaymentTermsByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // cmp_code

    if (!id) {
      return res.status(400).json({
        error: "cmp_code is required",
      });
    }

    const cacheKey = `vendor:payment_terms:company:${id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      "SELECT * FROM posdb.vendor_payment_terms WHERE cmp_code = $1",
      [id]
    );

    const paymentTerms = result.rows;

    await redis.setex(cacheKey, 300, JSON.stringify(paymentTerms));

    return res.status(200).json(paymentTerms);

  } catch (error: any) {
    console.error("Error fetching Vendor Payment Terms:", error);

    return res.status(500).json({
      message: "Failed to fetch Vendor Payment Terms",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
