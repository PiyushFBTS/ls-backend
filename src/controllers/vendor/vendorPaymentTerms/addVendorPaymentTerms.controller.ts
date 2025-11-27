import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { VendorPaymentTermsFormValues } from "../../../schemas/vendor/vendorPaymentTerms.schema";

export const addVendorPaymentTerms = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const body = req.body as VendorPaymentTermsFormValues;

    const { cmp_code, cmp_name, payment_terms_code, due_date_calculations,
      discount_date_calculation, discount_percent, description, calc_pmt_disc_on_cr_memos,
      coupled_to_dataverse } = body;

    // Required fields
    if (!cmp_code || !payment_terms_code) {
      return res.status(400).json({
        error: "Missing required fields: cmp_code or payment_terms_code",
        status: "fail",
      });
    }

    // --- Check for duplicates ---
    const exists = await pool.query(
      `SELECT payment_terms_code 
       FROM posdb.vendor_payment_terms
       WHERE payment_terms_code = $1`,
      [payment_terms_code]
    );

    if ((exists.rowCount ?? 0) > 0) {
      return res.status(400).json({
        error: "Vendor Payment Terms with this code already exists",
        status: "fail",
      });
    }

    // --- IST Timestamp ---
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const last_modified_date_time = istTime
      .toISOString()
      .replace("T", " ")
      .split(".")[0]; // YYYY-MM-DD HH:mm:ss

    // --- Insert Query ---
    const query = `
      INSERT INTO posdb.vendor_payment_terms (
        cmp_code, cmp_name, payment_terms_code, due_date_calculations,
        discount_date_calculation, discount_percent, description,
        calc_pmt_disc_on_cr_memos, last_modified_date_time, coupled_to_dataverse
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
      cmp_code,
      cmp_name,
      payment_terms_code,
      due_date_calculations,
      discount_date_calculation,
      discount_percent,
      description,
      calc_pmt_disc_on_cr_memos,
      last_modified_date_time,
      coupled_to_dataverse,
    ];

    await pool.query(query, values);

    // --- Redis Cache Invalidation ---
    try {
      await redis.del("vendor_payment_terms:all");
      await redis.del(`vendor_payment_terms:cmp:${cmp_code}`);
      await redis.del(`vendor_payment_terms:code:${payment_terms_code}`);
    } catch (err) {
      console.warn("Redis cache invalidation failed:", err);
    }

    return res.status(200).json({
      message: "Vendor Payment Terms added successfully",
      status: "success",
    });

  } catch (error: any) {
    console.error("Error inserting Vendor Payment Terms:", error);

    return res.status(500).json({
      message: "Failed to create Vendor Payment Terms",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    });
  }
};
