import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const addVendorSection = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const {
      section_code, description, ecode, detail, presentation_order, indentation_level,
      parent_code, section_order } = req.body;


    if (!section_code) {
      return res.status(400).json({
        error: "section_code is required",
        status: "fail",
      });
    }


    const exists = await pool.query(
      `
      SELECT section_code 
      FROM posdb.vendor_section 
      WHERE section_code = $1
    `,
      [section_code]
    );

    if ((exists.rowCount ?? 0) > 0) {
      return res.status(400).json({
        error: "Vendor Section with this section_code already exists",
        status: "fail",
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
      section_code, description, ecode, detail, presentation_order, indentation_level,
      parent_code, section_order];

    await pool.query(query, values);

    try {
      await redis.del("vendor_section:all");
      await redis.del(`vendor_section:code:${section_code}`);
      if (parent_code) {
        await redis.del(`vendor_section:parent:${parent_code}`);
      }
    } catch (cacheErr) {
      console.warn("Failed to invalidate Vendor Section cache:", cacheErr);
    }

    return res.status(200).json({
      message: "Vendor Section added successfully",
      status: "success",
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
