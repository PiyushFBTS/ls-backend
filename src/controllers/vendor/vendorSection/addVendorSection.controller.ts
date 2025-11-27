import { Request, Response } from "express";
import { pool } from "../../../db";

export const addVendorSection = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const {
      section_code,
      description,
      ecode,
      detail,
      presentation_order,
      indentation_level,
      parent_code,
      section_order
    } = req.body;

    // -------------------------------------------------
    // 🔍 VALIDATION
    // -------------------------------------------------
    if (!section_code) {
      return res.status(400).json({
        error: "section_code is required",
      });
    }

    const query = `
      INSERT INTO posdb.vendor_section
      (
        section_code, description, ecode, detail,
        presentation_order, indentation_level, parent_code, section_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const values = [
      section_code,
      description,
      ecode,
      detail,
      presentation_order,
      indentation_level,
      parent_code,
      section_order
    ];

    await pool.query(query, values);

    return res.status(200).json({
      message: "Vendor Section added successfully",
    });

  } catch (error: any) {
    console.error("Error inserting Vendor Section:", error);

    return res.status(500).json({
      message: "Failed to create Vendor Section",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
