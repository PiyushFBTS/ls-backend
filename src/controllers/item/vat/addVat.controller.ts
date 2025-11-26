// controllers/vat/addVAT.ts
import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { VATType } from "../../../schemas/item/vat.schema";

export const addVat = async (req: Request, res: Response) => {
  try {
    const { vat_code, vat_percentage, cess } = req.body as VATType;

    const query = `
      INSERT INTO posdb.vat (
        vat_code, vat_percentage, cess
      ) VALUES ($1, $2, $3)
    `;

    await pool.query(query, [vat_code, vat_percentage, cess]);

    // Optional: clear VAT cache
    try {
      await redis.del("vat:all");
    } catch (cacheErr) {
      console.warn("Failed to clear VAT cache:", cacheErr);
    }

    return res.status(200).json({
      message: "VAT added successfully",
      status: "success",
    });
  } catch (error: any) {
    console.error("Failed to create VAT:", error);

    return res.status(500).json({
      message: "Failed to create VAT",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
