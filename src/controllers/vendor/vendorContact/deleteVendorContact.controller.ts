import { Request, Response } from "express";
import { pool } from "../../../db";

export const deleteVendorContact = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No records provided for deletion" });
    }

    // Validate each item
    const invalid = items.find(
      (item) => !item.cmp_code || !item.contact_code
    );

    if (invalid) {
      return res.status(400).json({
        message: "Each record must include cmp_code and contact_code",
      });
    }

    const checkQuery = `
      SELECT cmp_code, contact_code
      FROM posdb.vendor_contact
      WHERE (cmp_code, contact_code) IN (
        ${items.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}
      )
    `;

    const checkValues: any[] = [];
    items.forEach((item) => {
      checkValues.push(item.cmp_code, item.contact_code);
    });

    const checkResult = await pool.query(checkQuery, checkValues);

    const existingSet = new Set(
      checkResult.rows.map((row) => `${row.cmp_code}-${row.contact_code}`)
    );

    // Find missing records
    const missing = items.filter(
      (i) => !existingSet.has(`${i.cmp_code}-${i.contact_code}`)
    );

    if (missing.length > 0) {
      return res.status(404).json({
        message: "Some Vendor Contact records were not found",
        missing,
      });
    }

    const deleteQuery = `
      DELETE FROM posdb.vendor_contact
      WHERE (cmp_code, contact_code) IN (
        ${items.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}
      )
    `;

    const deleteValues: any[] = [];
    items.forEach((item) => {
      deleteValues.push(item.cmp_code, item.contact_code);
    });

    await pool.query(deleteQuery, deleteValues);

    return res.status(200).json({
      message: "Vendor Contact deleted successfully",
    });

  } catch (error: any) {

    return res.status(500).json({
      message: "Failed to delete Vendor Contact",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
