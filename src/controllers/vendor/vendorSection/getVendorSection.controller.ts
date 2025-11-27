import { Request, Response } from "express";
import { pool } from "../../../db";

export const getVendorSection = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * 
      FROM posdb.vendor_section 
      ORDER BY section_code ASC
    `);

    return res.status(200).json(result.rows);

  } catch (error: any) {
    console.error("Error fetching Vendor Sections:", error);

    return res.status(500).json({
      message: "Failed to fetch Vendor Sections",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
