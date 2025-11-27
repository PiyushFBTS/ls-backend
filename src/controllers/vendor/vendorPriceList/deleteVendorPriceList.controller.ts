import { Request, Response } from "express";
import { pool } from "../../../db";

export const deleteVendorPriceList = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    // Validate request
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No records provided",
      });
    }

    // Validate fields inside each item
    const invalid = items.find(
      (i) => !i.price_list_code || !i.cmp_code
    );

    if (invalid) {
      return res.status(400).json({
        message: "Each item must include price_list_code and cmp_code",
      });
    }

    // ------------------------------------------------------
    // 1️⃣ CHECK IF RECORDS EXIST BEFORE DELETING
    // ------------------------------------------------------
    const checkQuery = `
      SELECT price_list_code, cmp_code
      FROM posdb.vendor_price_list
      WHERE (price_list_code, cmp_code) IN (
        ${items.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}
      )
    `;

    const checkValues: any[] = [];
    items.forEach((item) => {
      checkValues.push(item.price_list_code, item.cmp_code);
    });

    const checkResult = await pool.query(checkQuery, checkValues);

    const existsSet = new Set(
      checkResult.rows.map(
        (r) => `${r.price_list_code}-${r.cmp_code}`
      )
    );

    // Find missing entries
    const missing = items.filter(
      (i) => !existsSet.has(`${i.price_list_code}-${i.cmp_code}`)
    );

    if (missing.length > 0) {
      return res.status(404).json({
        message: "Some Vendor Price List records were not found",
        missing,
      });
    }

    // ------------------------------------------------------
    // 2️⃣ DELETE MATCHING COMBINATIONS
    // ------------------------------------------------------
    const deleteQuery = `
      DELETE FROM posdb.vendor_price_list
      WHERE (price_list_code, cmp_code) IN (
        ${items.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}
      )
    `;

    const deleteValues: any[] = [];
    items.forEach((item) => {
      deleteValues.push(item.price_list_code, item.cmp_code);
    });

    await pool.query(deleteQuery, deleteValues);

    return res.status(200).json({
      message: "Vendor Price List deleted successfully",
    });

  } catch (error: any) {
    console.error("Error deleting Vendor Price List:", error);

    return res.status(500).json({
      message: "Failed to delete Vendor Price List",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
