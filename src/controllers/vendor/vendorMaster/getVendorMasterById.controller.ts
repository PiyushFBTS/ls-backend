import { Request, Response } from "express";
import { pool } from "../../../db";

export const getVendorMasterById = async (req: Request, res: Response) => {
  try {
    const { vendor_code, cmp_code } = req.query;

    if (!vendor_code || !cmp_code) {
      return res.status(400).json({
        error: "vendor_code (id) and cmp_code are required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM posdb.vendor_master WHERE vendor_code = $1 AND cmp_code = $2",
      [vendor_code, cmp_code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch Vendor",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
