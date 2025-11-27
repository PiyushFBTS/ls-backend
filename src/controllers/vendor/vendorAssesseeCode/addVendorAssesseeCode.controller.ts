import { Request, Response } from "express";
import { pool } from "../../../db";
import { VendorAssesseeCodeFormValues } from "../../../schemas/vendor/vendorAssesseeCode.schema"

export const addVendorAssesseeCode = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const { assessee_code, description, type } = req.body as VendorAssesseeCodeFormValues;

    // Basic validation
    if (!assessee_code || !description || !type) {
      return res.status(400).json({
        message: "assessee_code, description and type are required",
      });
    }

    const query = `
      INSERT INTO posdb.vendor_assessee_code 
      (assessee_code, description, type)
      VALUES ($1, $2, $3)
    `;

    await pool.query(query, [assessee_code, description, type]);

    return res.status(200).json({
      message: "Vendor Assessee Code added successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create Vendor Assessee Code",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
