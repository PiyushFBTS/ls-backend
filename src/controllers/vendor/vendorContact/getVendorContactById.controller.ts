import { Request, Response } from "express";
import { pool } from "../../../db";

export const getVendorContactById = async (req: Request, res: Response) => {
  try {
    const { contact_code, cmp_code } = req.query; // contact_code + cmp_code

    if (!contact_code || !cmp_code) {
      return res.status(400).json({
        error: "Both contact_code and cmp_code are required",
      });
    }

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

    return res.status(200).json(result.rows[0]);

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch Vendor Contact",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
