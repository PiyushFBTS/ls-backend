import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { VendorMasterFormValues } from "../../../schemas/vendor/vendorMaster.schema";

export const addVendorMaster = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const body = req.body as VendorMasterFormValues;

    // ----- Basic validation -----
    if (!body.vendor_code || !body.name || !body.cmp_code) {
      return res.status(400).json({
        error: "Missing required fields: vendor_code, name, cmp_code",
        status: "fail",
      });
    }

    // ----- Check if vendor_code already exists -----
    const exists = await pool.query(
      `SELECT vendor_code FROM posdb.vendor_master WHERE vendor_code = $1`,
      [body.vendor_code]
    );

    if ((exists.rowCount ?? 0) > 0) {
      return res.status(400).json({
        error: "Vendor with this vendor_code already exists",
        status: "fail",
      });
    }

    // ----- Prepare IST timestamps -----
    const now = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffsetMs);

    const last_modified_date_time = istTime
      .toISOString()
      .replace("T", " ")
      .split(".")[0];

    const last_date_modified = istTime.toISOString().split("T")[0];

    // ----- List of DB columns -----
    const columns = [
      "cmp_code",
      "cmp_name",
      "vendor_code",
      "name",
      "search_name",
      "address",
      "address_2",
      "city",
      "contact",
      "phone_no",
      "currency_code",
      "language_code",
      "registration_no",
      "payment_terms_code",
      "country_region_code",
      "blocked",
      "pay_to_vendor_no",
      "payment_method_code",
      "vat_registration_no",
      "post_code",
      "county",
      "eori_number",
      "email",
      "home_page",
      "primary_contact_no",
      "mobile_phone_no",
      "location_code",
      "gst_registration_no",
      "gst_vendor_type",
      "aggregate_turnover",
      "arn_no",
      "transporter",
      "subcontractor",
      "assessee_code",
      "pan_no",
      "pan_status",
      "pan_reference_no",
      "state_code",
      "tax_code",
      "fssi_code",
      "fssi_expiry_date",
      "msme_no",
      "msme_status",
      "msme_type",
      "msme_applicable",
      "email_2",
      "api_gst_reg_no",
      "status",
      "last_modified_date_time",
      "last_date_modified",
    ];

    // ----- Build dynamic SQL values -----
    const values = columns.map((col) => {
      if (col === "last_modified_date_time") return last_modified_date_time;
      if (col === "last_date_modified") return last_date_modified;
      return body[col as keyof VendorMasterFormValues] ?? null;
    });

    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    // ----- Execute Insert Query -----
    const query = `
      INSERT INTO posdb.vendor_master (${columns.join(", ")})
      VALUES (${placeholders})
    `;

    await pool.query(query, values);

    // ----- Redis Cache Invalidation -----
    try {
      await redis.del("vendor_master:all");
      await redis.del(`vendor_master:cmp:${body.cmp_code}`);
      await redis.del(`vendor_master:vendor:${body.vendor_code}`);
    } catch (cacheErr) {
      console.warn("Redis cache invalidation failed:", cacheErr);
    }

    return res.status(200).json({
      message: "Vendor added successfully",
      status: "success",
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create Vendor",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
