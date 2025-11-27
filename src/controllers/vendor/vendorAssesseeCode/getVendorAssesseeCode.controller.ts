import { Request, Response } from "express";
import { pool } from "../../../db";

export const getVendorAssesseeCode = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM posdb.vendor_assessee_code ORDER BY assessee_code ASC"
    );

    return res.status(200).json(result.rows);

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch Vendor Assessee Codes",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
