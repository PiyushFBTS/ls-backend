import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVendorContactByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // cmp_code

    if (!id) {
      return res.status(400).json({ error: "cmp_code is required" });
    }

    const cacheKey = `vendor:contact:company:${id}`;

    // -----------------------------------------
    // 1️⃣ CHECK REDIS CACHE
    // -----------------------------------------
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // -----------------------------------------
    // 2️⃣ FETCH FROM DATABASE
    // -----------------------------------------
    const result = await pool.query(
      "SELECT * FROM posdb.vendor_contact WHERE cmp_code = $1",
      [id]
    );

    const vendorContacts = result.rows;

    // -----------------------------------------
    // 3️⃣ STORE IN REDIS FOR 5 MIN
    // -----------------------------------------
    await redis.setex(cacheKey, 300, JSON.stringify(vendorContacts));

    return res.status(200).json(vendorContacts);

  } catch (error: any) {
    console.error("Error fetching vendor contacts:", error);

    return res.status(500).json({
      message: "Failed to Fetch Vendor Contacts",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
