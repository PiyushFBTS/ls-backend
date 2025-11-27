import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { VendorContactFormValues } from "../../../schemas/vendor/vendorContact.schema";

export const addVendorContact = async (req: Request, res: Response) => {
    try {
        if (!pool) {
            return res.status(500).json({
                error: "Database connection not available",
            });
        }

        const body = req.body as VendorContactFormValues;
        const { cmp_code, cmp_name, contact_code, job_title, name, search_name, address,
            address_2, county, state, city, post_code, phone_no, mobile_phone_no, email,
            image } = body;

        // Required fields check
        if (!cmp_code || !contact_code || !name) {
            return res.status(400).json({
                error: "Missing required fields: cmp_code, contact_code, or name",
                status: "fail",
            });
        }

        // Check if contact already exists
        const checkQuery = `
      SELECT contact_code 
      FROM posdb.vendor_contact 
      WHERE contact_code = $1
    `;
        const exists = await pool.query(checkQuery, [contact_code]);

        if ((exists.rowCount ?? 0) > 0) {
            return res.status(400).json({
                error: "Vendor contact with this contact_code already exists",
                status: "fail",
            });
        }

        // Convert Base64 image to buffer
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

        // Get IST time
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);

        const last_date_modified = istTime.toISOString().split("T")[0]; // YYYY-MM-DD
        const last_time_modified = istTime.toISOString().split("T")[1].split(".")[0]; // HH:MM:SS

        // Insert query
        const query = `
      INSERT INTO posdb.vendor_contact (
        cmp_code, cmp_name, contact_code, job_title, name, search_name,
        address, address_2, county, state, city, post_code,
        phone_no, mobile_phone_no, email,
        last_date_modified, last_time_modified, image
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15,
        $16, $17, $18
      )
    `;

        const values = [
            cmp_code,
            cmp_name,
            contact_code,
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
            last_date_modified,
            last_time_modified,
            imageBuffer,
        ];

        await pool.query(query, values);

        //  Redis Cache Invalidation
        try {
            await redis.del("vendorContacts:all"); // All vendor contacts
            await redis.del(`vendorContacts:company:${cmp_code}`); // Contacts for specific company
            await redis.del(`vendorContacts:contact:${contact_code}`); // If used anywhere
        } catch (cacheErr) {
            console.warn("Failed to invalidate Vendor Contact cache:", cacheErr);
        }

        return res.status(200).json({
            message: "Vendor Contact added successfully",
            status: "success",
        });

    } catch (error: any) {
        return res.status(500).json({
            message: "Failed to create Vendor Contact",
            error: error.message,
            status: "fail",
            timestamp: new Date().toLocaleString("en-IN"),
        });
    }
};
