// controllers/vat/getVATById.ts
import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getVatById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // vat_code

    if (!id) {
      return res.status(400).json({ error: "Missing vat_code" });
    }

    const cacheKey = `vat:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    //Query PostgreSQL
    const query = `
      SELECT *
      FROM posdb.vat
      WHERE vat_code = $1
    `;
    
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "VAT not found" });
    }

    const vat = result.rows[0];

    //Store in Redis for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(vat));

    //Send response
    return res.status(200).json(vat);

  } catch (error: any) {
    console.error("Error fetching VAT:", error);

    return res.status(500).json({
      message: "Failed to Fetch VAT",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
