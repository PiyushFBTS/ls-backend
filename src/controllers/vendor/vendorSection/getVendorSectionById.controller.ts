import { Request, Response } from "express";
import { pool } from "../../../db";

export const getVendorSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // section_code

    if (!id) {
      return res.status(400).json({
        error: "section_code is required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM posdb.vendor_section WHERE section_code = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Vendor Section not found",
      });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error: any) {
    console.error("Error fetching Vendor Section:", error);

    return res.status(500).json({
      message: "Failed to fetch Vendor Section",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
