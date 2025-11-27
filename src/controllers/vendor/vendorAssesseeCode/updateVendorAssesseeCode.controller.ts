import { Request, Response } from "express";
import { pool } from "../../../db";

export const updateVendorAssesseeCode = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const { assessee_code, description, type } = req.body;

    // Basic validation
    if (!assessee_code) {
      return res.status(400).json({
        message: "assessee_code is required",
      });
    }

    const query = `
      UPDATE posdb.vendor_assessee_code
      SET 
        description = $1,
        type = $2
      WHERE assessee_code = $3
    `;

    const values = [description, type, assessee_code];

    const result = await pool.query(query, values);

    // If no rows updated → record not found
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Vendor Assessee Code not found",
      });
    }

    return res.status(200).json({
      message: "Vendor Assessee Code updated successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update Vendor Assessee Code",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
