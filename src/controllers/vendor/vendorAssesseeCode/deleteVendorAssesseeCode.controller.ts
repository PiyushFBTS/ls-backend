import { Request, Response } from "express";
import { pool } from "../../../db";

export const deleteVendorAssesseeCode = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const checkQuery = `
      SELECT assessee_code
      FROM posdb.vendor_assessee_code
      WHERE assessee_code = ANY($1::text[])
    `;

    const checkResult = await pool.query(checkQuery, [ids]);
    const existing = checkResult.rows.map((row) => row.assessee_code);


    const missing = ids.filter((id: string) => !existing.includes(id));

    if (missing.length > 0) {
      return res.status(404).json({
        message: "Some Vendor Assessee Codes were not found",
        missing,
      });
    }

    const deleteQuery = `
      DELETE FROM posdb.vendor_assessee_code
      WHERE assessee_code = ANY($1::text[])
    `;

    await pool.query(deleteQuery, [ids]);

    return res.status(200).json({
      message: "Vendor Assessee Code(s) deleted successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to delete Vendor Assessee Code",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
