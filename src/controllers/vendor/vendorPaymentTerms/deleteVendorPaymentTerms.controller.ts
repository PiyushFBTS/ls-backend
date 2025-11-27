import { Request, Response } from "express";
import { pool } from "../../../db";

export const deleteVendorPaymentTerms = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No records provided",
      });
    }

    // Validate each record
    const invalid = items.find(
      (item) => !item.payment_terms_code || !item.cmp_code
    );

    if (invalid) {
      return res.status(400).json({
        message: "Each item must contain payment_terms_code and cmp_code",
      });
    }

    // ------------------------------------------------------
    // 1️⃣ CHECK IF RECORDS EXIST
    // ------------------------------------------------------
    const checkQuery = `
      SELECT payment_terms_code, cmp_code
      FROM posdb.vendor_payment_terms
      WHERE (payment_terms_code, cmp_code) IN (
        ${items.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}
      )
    `;

    const checkValues: any[] = [];
    items.forEach((item) => {
      checkValues.push(item.payment_terms_code, item.cmp_code);
    });

    const checkResult = await pool.query(checkQuery, checkValues);

    const existingSet = new Set(
      checkResult.rows.map(
        (row) => `${row.payment_terms_code}-${row.cmp_code}`
      )
    );

    // Find missing combination records
    const missing = items.filter(
      (item) =>
        !existingSet.has(`${item.payment_terms_code}-${item.cmp_code}`)
    );

    if (missing.length > 0) {
      return res.status(404).json({
        message: "Some Payment Terms records were not found",
        missing,
      });
    }

    // ------------------------------------------------------
    // 2️⃣ DELETE MATCHING EXACT COMBINATIONS
    // ------------------------------------------------------
    const deleteQuery = `
      DELETE FROM posdb.vendor_payment_terms
      WHERE (payment_terms_code, cmp_code) IN (
        ${items.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}
      )
    `;

    const deleteValues: any[] = [];
    items.forEach((item) => {
      deleteValues.push(item.payment_terms_code, item.cmp_code);
    });

    await pool.query(deleteQuery, deleteValues);

    return res.status(200).json({
      message: "Vendor Payment Terms deleted successfully",
    });

  } catch (error: any) {
    console.error("Error deleting Vendor Payment Terms:", error);

    return res.status(500).json({
      message: "Failed to delete Vendor Payment Terms",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
