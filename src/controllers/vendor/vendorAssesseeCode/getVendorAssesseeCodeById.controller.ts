import { Request, Response } from "express";
import { pool } from "../../../db";

export const getVendorAssesseeCodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({ error: "assessee_code is required" });
    }

    const result = await pool.query(
      "SELECT * FROM posdb.vendor_assessee_code WHERE assessee_code = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Vendor Assessee Code not found",
      });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error: any) {

    return res.status(500).json({
      message: "Failed to Fetch Vendor Assessee Code",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
