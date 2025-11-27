import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVendorMasterByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // cmp_code

    if (!id) {
      return res.status(400).json({ message: "Company ID (cmp_code) is required" });
    }

    const cacheKey = `vendor:master:company:${id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      "SELECT * FROM posdb.vendor_master WHERE cmp_code = $1",
      [id]
    );

    const vendorMaster = result.rows;

    await redis.setex(cacheKey, 300, JSON.stringify(vendorMaster));

    return res.status(200).json(vendorMaster);

  } catch (error: any) {
    console.error("Error fetching vendor master:", error);

    return res.status(500).json({
      message: "Failed to Fetch Vendor",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
