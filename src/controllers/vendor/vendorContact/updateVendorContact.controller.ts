import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateVendorContact = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const {
      cmp_code,
      contact_code,
      cmp_name,
      job_title,
      name,
      search_name,
      address,
      address_2,
      county,
      state,
      city,
      post_code,
      phone_no,
      mobile_phone_no,
      email,
      image,
    } = req.body;

    // ------------------------------------------------------
    // 🔍 Validate required fields
    // ------------------------------------------------------
    if (!cmp_code || !contact_code) {
      return res.status(400).json({
        error: "Missing required fields: cmp_code or contact_code",
      });
    }

    // ------------------------------------------------------
    // 🖼️ Convert Base64 image → Buffer
    // ------------------------------------------------------
    let imageBuffer: Buffer | null = null;

    if (image && typeof image === "string" && image.startsWith("data:image")) {
      try {
        const base64Data = image.split(",")[1];
        imageBuffer = Buffer.from(base64Data, "base64");
      } catch (err) {
        return res.status(400).json({
          error: "Invalid Base64 image format",
        });
      }
    }

    // ------------------------------------------------------
    // 🕒 Generate IST timestamps
    // ------------------------------------------------------
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);

    const last_date_modified = istTime.toISOString().split("T")[0];
    const last_time_modified = istTime.toISOString().split("T")[1].split(".")[0];

    // ------------------------------------------------------
    // 📝 SQL Update Query
    // ------------------------------------------------------
    const query = `
      UPDATE posdb.vendor_contact
      SET
        cmp_name = $1,
        job_title = $2,
        name = $3,
        search_name = $4,
        address = $5,
        address_2 = $6,
        county = $7,
        state = $8,
        city = $9,
        post_code = $10,
        phone_no = $11,
        mobile_phone_no = $12,
        email = $13,
        last_date_modified = $14,
        last_time_modified = $15,
        image = $16
      WHERE cmp_code = $17 AND contact_code = $18
    `;

    const values = [
      cmp_name,
      job_title,
      name,
      search_name,
      address,
      address_2,
      county,
      state,
      city,
      post_code ? Number(post_code) : null,
      phone_no,
      mobile_phone_no,
      email,
      last_date_modified,
      last_time_modified,
      imageBuffer,
      cmp_code,
      contact_code,
    ];

    const result = await pool.query(query, values);


    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Vendor contact not found",
        status: "fail",
      });
    }

    // ------------------------------------------------------
    // 🧹 REDIS CACHE CLEARING
    // ------------------------------------------------------
    await redis.del("vendorContacts:all");                          // All contacts list
    await redis.del(`vendorContacts:company:${cmp_code}`);          // Contacts for company
    await redis.del(`vendorContact:${cmp_code}:${contact_code}`);   // Single contact

    return res.status(200).json({
      message: "Vendor contact updated successfully",
      status: "success",
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update vendor contact",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
