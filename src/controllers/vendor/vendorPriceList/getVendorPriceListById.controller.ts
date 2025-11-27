import { Request, Response } from "express";
import { pool } from "../../../db";

export const getVendorPriceListById = async (req: Request, res: Response) => {
  try {
    const { price_list_code, cmp_code } = req.query; // price_list_code + cmp_code

    if (!price_list_code || !cmp_code) {
      return res.status(400).json({
        error: "Both price_list_code (id) and cmp_code are required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM posdb.vendor_price_list
      WHERE price_list_code = $1 AND cmp_code = $2
      `,
      [price_list_code, cmp_code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Vendor Price List not found",
      });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error: any) {
    console.error("Error fetching Vendor Price List:", error);

    return res.status(500).json({
      message: "Failed to fetch Vendor Price List",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
