import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { location_code } = req.query;
    const body = req.body;

    if (!location_code) {
      return res.status(400).json({ error: "location_code is required in query params" });
    }

    const {
      name,
      address1,
      county,
      state,
      city,
      post_code,
      phone,
      gst,
      cmp_name,
      cmp_code
    } = body;

    const query = `
      UPDATE posdb.location SET
        name = $2,
        address1 = $3,
        county = $4,
        state = $5,
        city = $6,
        post_code = $7,
        phone = $8,
        gst = $9,
        cmp_name = $10,
        cmp_code = $11
      WHERE location_code = $1
      RETURNING location_code
    `;

    const values = [
      location_code,
      name ?? null,
      address1 ?? null,
      county ?? null,
      state ?? null,
      city ?? null,
      post_code ?? null,
      phone ?? null,
      gst ?? null ,
      cmp_name ,
      cmp_code 
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Invalidate redis cache
    try {
      await redis.del("locations:all");
      await redis.del(`location:${location_code}`);
    } catch (cacheErr) {
      console.warn("Redis cache clear failed:", cacheErr);
    }

    return res.status(200).json({
      message: "Location updated successfully",
      location_code,
    });

  } catch (error: any) {
    console.error("Failed to update location:", error);
    return res.status(500).json({
      message: "Failed to update location",
      error: error.message,
    });
  }
};
