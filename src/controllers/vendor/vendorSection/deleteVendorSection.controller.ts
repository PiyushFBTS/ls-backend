import { Request, Response } from "express";
import { pool } from "../../../db";

export const deleteVendorSection = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // -------------------------------------------------------
    // 1️⃣ VALIDATE INPUT
    // -------------------------------------------------------
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "No IDs provided",
      });
    }

    // -------------------------------------------------------
    // 2️⃣ CHECK IF RECORDS EXIST
    // -------------------------------------------------------
    const checkQuery = `
      SELECT section_code
      FROM posdb.vendor_section
      WHERE section_code = ANY($1::text[])
    `;

    const checkResult = await pool.query(checkQuery, [ids]);

    const existingCodes = checkResult.rows.map((r) => r.section_code);

    // Identify missing section_codes
    const missing = ids.filter((id: string) => !existingCodes.includes(id));

    if (missing.length > 0) {
      return res.status(404).json({
        message: "Some Vendor Section codes were not found",
        missing,
      });
    }

    // -------------------------------------------------------
    // 3️⃣ DELETE ONLY EXISTING RECORDS
    // -------------------------------------------------------
    const deleteQuery = `
      DELETE FROM posdb.vendor_section
      WHERE section_code = ANY($1::text[])
    `;

    await pool.query(deleteQuery, [ids]);

    return res.status(200).json({
      message: "Vendor Section deleted successfully",
    });

  } catch (error: any) {
    console.error("Error deleting Vendor Section:", error);

    return res.status(500).json({
      message: "Failed to delete Vendor Section",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
