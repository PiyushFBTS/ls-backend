// controllers/vat/deleteVAT.ts
import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteVat = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    // Delete VAT records
    const deleteQuery = `
      DELETE FROM posdb.vat
      WHERE vat_code = ANY($1::text[])
    `;

    const result = await pool.query(deleteQuery, [ids]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No VAT records deleted (not found)",
      });
    }

    // Clear Redis cache
    try {
      await redis.del("vat:all");

      const pipeline = redis.pipeline();
      ids.forEach((id) => pipeline.del(`vat:${id}`));
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn("Failed to clear VAT cache:", cacheErr);
    }

    return res.status(200).json({
      message: "VAT deleted successfully",
      deletedCount: result.rowCount,
      status: "success",
    });

  } catch (error: any) {
    console.error("Failed to delete VAT:", error);

    return res.status(500).json({
      message: "Failed to Delete VAT",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
