import { Request, Response } from "express";
import { pool } from "../../../db";

export const updateVendorPaymentTerms = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const {
      cmp_name,
      due_date_calculations,
      discount_date_calculation,
      discount_percent,
      description,
      calc_pmt_disc_on_cr_memos,
      coupled_to_dataverse,
      cmp_code,
      payment_terms_code,
    } = req.body;

    // ----------------------------------------------------
    // 🔍 Validate
    // ----------------------------------------------------
    if (!cmp_code || !payment_terms_code) {
      return res.status(400).json({
        error: "cmp_code and payment_terms_code are required",
      });
    }

    // ----------------------------------------------------
    // 🕒 IST Timestamp
    // ----------------------------------------------------
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);

    const last_modified_date_time = istTime
      .toISOString()
      .replace("T", " ")
      .split(".")[0];

    // ----------------------------------------------------
    // 📝 SQL Update Query
    // ----------------------------------------------------
    const query = `
      UPDATE posdb.vendor_payment_terms
      SET
        cmp_name = $1,
        due_date_calculations = $2,
        discount_date_calculation = $3,
        discount_percent = $4,
        description = $5,
        calc_pmt_disc_on_cr_memos = $6,
        last_modified_date_time = $7,
        coupled_to_dataverse = $8
      WHERE cmp_code = $9 AND payment_terms_code = $10
    `;

    const values = [
      cmp_name,
      due_date_calculations,
      discount_date_calculation,
      discount_percent,
      description,
      calc_pmt_disc_on_cr_memos,
      last_modified_date_time,
      coupled_to_dataverse,
      cmp_code,
      payment_terms_code,
    ];

    const result = await pool.query(query, values);

    // ----------------------------------------------------
    // ❌ If record does not exist
    // ----------------------------------------------------
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Vendor Payment Terms not found",
        status: "fail",
      });
    }

    return res.status(200).json({
      message: "Vendor Payment Terms updated successfully",
      status: "success",
    });

  } catch (error: any) {
    console.error("Error updating Vendor Payment Terms:", error);

    return res.status(500).json({
      message: "Failed to update vendor Payment Terms",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
