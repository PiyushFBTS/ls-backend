// controllers/vat/updateVAT.ts
import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateVat = async (req: Request, res: Response) => {
  try {
    const { vat_code, vat_percentage, cess } = req.body;

    // Validate required fields
    if (!vat_code || vat_percentage === undefined || cess === undefined) {
      return res.status(400).json({
        error: "Missing required fields: vat_code, vat_percentage, cess",
      });
    }

    // Check if record exists
    const checkQuery = `
      SELECT vat_code 
      FROM posdb.vat 
      WHERE vat_code = $1
    `;
    const exists = await pool.query(checkQuery, [vat_code]);

    if (exists.rowCount === 0) {
      return res.status(404).json({
        error: "VAT record not found",
      });
    }

    // Update query
    const updateQuery = `
      UPDATE posdb.vat SET
        vat_percentage = $1,
        cess = $2
      WHERE vat_code = $3
    `;

    const values = [vat_percentage, cess, vat_code];

    await pool.query(updateQuery, values);

    // Clear Redis cache
    try {
      await redis.del("vat:all");
      await redis.del(`vat:${vat_code}`);
    } catch (cacheErr) {
      console.warn("Failed to clear VAT cache:", cacheErr);
    }

    return res.status(200).json({
      message: "VAT updated successfully",
      status: "success",
    });

  } catch (error: any) {
    console.error("Failed to update VAT:", error);

    return res.status(500).json({
      message: "Failed to Update VAT",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
