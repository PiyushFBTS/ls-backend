import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVendorPriceListByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // cmp_code

    if (!id) {
      return res.status(400).json({
        error: "cmp_code is required",
      });
    }

    const cacheKey = `vendor:price_list:company:${id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      "SELECT * FROM posdb.vendor_price_list WHERE cmp_code = $1",
      [id]
    );

    const priceList = result.rows;


    await redis.setex(cacheKey, 300, JSON.stringify(priceList));

    return res.status(200).json(priceList);

  } catch (error: any) {
    console.error("Error fetching Vendor Price List:", error);

    return res.status(500).json({
      message: "Failed to Fetch Vendor Price List",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
