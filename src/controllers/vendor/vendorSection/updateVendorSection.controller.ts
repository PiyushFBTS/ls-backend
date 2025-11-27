import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateVendorSection = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const {
      section_code, description, ecode, detail, presentation_order,
      indentation_level, parent_code, section_order } = req.body;

    if (!section_code) {
      return res.status(400).json({
        error: "section_code are required",
      });
    }

    const query = `
      UPDATE posdb.vendor_section
      SET
        description = $1,
        ecode = $2,
        detail = $3,
        presentation_order = $4,
        indentation_level = $5,
        parent_code = $6,
        section_order = $7
      WHERE section_code = $8 
    `;

    const values = [
      description,
      ecode,
      detail,
      presentation_order,
      indentation_level,
      parent_code,
      section_order,
      section_code
    ];

    const result = await pool.query(query, values);


    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Vendor Section not found",
        status: "fail",
      });
    }

    await redis.del("vendorSection:all");                  // all sections
    await redis.del(`vendorSection:${section_code}`);     // specific section

    return res.status(200).json({
      message: "Vendor Section updated successfully",
      status: "success",
    });

  } catch (error: any) {
    console.error("Error updating Vendor Section:", error);

    return res.status(500).json({
      message: "Failed to update Vendor Section",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
