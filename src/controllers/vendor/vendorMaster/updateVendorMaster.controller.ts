import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateVendorMaster = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({ error: "Database connection not available" });
    }

    const body = req.body;

    const {
      cmp_code, cmp_name, vendor_code, name, search_name, address, address_2, city, contact, phone_no,
      currency_code, language_code, registration_no, payment_terms_code, country_region_code, blocked,
      pay_to_vendor_no, payment_method_code, vat_registration_no, post_code, county, eori_number, email,
      home_page, primary_contact_no, mobile_phone_no, location_code, gst_registration_no, gst_vendor_type,
      aggregate_turnover, arn_no, transporter, subcontractor, assessee_code, pan_no, pan_status,
      pan_reference_no, state_code, tax_code, fssi_code, fssi_expiry_date, msme_no, msme_status,
      msme_type, msme_applicable, email_2, api_gst_reg_no, status
    } = body;

    // Validate required identifiers
    if (!cmp_code || !vendor_code) {
      return res.status(400).json({
        message: "cmp_code and vendor_code are required for update",
      });
    }

    // Generate IST timestamps
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const last_modified_date_time = istTime.toISOString().replace("T", " ").split(".")[0];
    const last_date_modified = istTime.toISOString().split("T")[0];

    const query = `
      UPDATE posdb.vendor_master
      SET
        cmp_name = $1,
        name = $2,
        search_name = $3,
        address = $4,
        address_2 = $5,
        city = $6,
        contact = $7,
        phone_no = $8,
        currency_code = $9,
        language_code = $10,
        registration_no = $11,
        payment_terms_code = $12,
        country_region_code = $13,
        blocked = $14,
        pay_to_vendor_no = $15,
        payment_method_code = $16,
        last_modified_date_time = $17,
        last_date_modified = $18,
        vat_registration_no = $19,
        post_code = $20,
        county = $21,
        eori_number = $22,
        email = $23,
        home_page = $24,
        primary_contact_no = $25,
        mobile_phone_no = $26,
        location_code = $27,
        gst_registration_no = $28,
        gst_vendor_type = $29,
        aggregate_turnover = $30,
        arn_no = $31,
        transporter = $32,
        subcontractor = $33,
        assessee_code = $34,
        pan_no = $35,
        pan_status = $36,
        pan_reference_no = $37,
        state_code = $38,
        tax_code = $39,
        fssi_code = $40,
        fssi_expiry_date = $41,
        msme_no = $42,
        msme_status = $43,
        msme_type = $44,
        msme_applicable = $45,
        email_2 = $46,
        api_gst_reg_no = $47,
        status = $48
      WHERE cmp_code = $49 AND vendor_code = $50
    `;

    const values = [
      cmp_name,
      name,
      search_name,
      address,
      address_2,
      city,
      contact,
      phone_no,
      currency_code,
      language_code,
      registration_no,
      payment_terms_code,
      country_region_code,
      blocked ?? null,
      pay_to_vendor_no,
      payment_method_code,
      new Date(last_modified_date_time),
      new Date(last_date_modified),
      vat_registration_no,
      post_code ? Number(post_code) : null,
      county,
      eori_number,
      email,
      home_page,
      primary_contact_no,
      mobile_phone_no,
      location_code,
      gst_registration_no,
      gst_vendor_type,
      aggregate_turnover,
      arn_no,
      transporter ?? false,
      subcontractor ?? false,
      assessee_code,
      pan_no,
      pan_status,
      pan_reference_no,
      state_code,
      tax_code,
      fssi_code,
      fssi_expiry_date ? new Date(fssi_expiry_date) : null,
      msme_no,
      msme_status,
      msme_type,
      msme_applicable ?? false,
      email_2,
      api_gst_reg_no,
      status,
      cmp_code,
      vendor_code,
    ];

    await pool.query(query, values);

    await redis.del("vendor_master:all");
    await redis.del(`vendor_master:vendor:${vendor_code}`);
    await redis.del(`vendor_master:cmp:${cmp_code}`);

    return res.status(200).json({ message: "Vendor updated successfully" });

  } catch (error: any) {
    console.error("Vendor update error:", error);
    return res.status(500).json({
      message: "Failed to update vendor",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
