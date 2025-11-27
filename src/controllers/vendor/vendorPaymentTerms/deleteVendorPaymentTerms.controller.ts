import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteVendorPaymentTerms = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No records provided",
      });
    }

    for (const item of items) {
      if (!item.payment_terms_code || !item.cmp_code) {
        return res.status(400).json({
          message: "Each item must contain payment_terms_code and cmp_code",
        });
      }
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const notFound: Array<{
        payment_terms_code: string;
        cmp_code: string;
      }> = [];

      for (const item of items) {
        const { payment_terms_code, cmp_code } = item;

        const existsQuery = `
          SELECT 1
          FROM posdb.vendor_payment_terms
          WHERE payment_terms_code = $1 AND cmp_code = $2
        `;
        const existsResult = await client.query(existsQuery, [
          payment_terms_code,
          cmp_code,
        ]);

        if (existsResult.rowCount === 0) {
          notFound.push({ payment_terms_code, cmp_code });
          continue;
        }

        const deleteQuery = `
          DELETE FROM posdb.vendor_payment_terms
          WHERE payment_terms_code = $1 AND cmp_code = $2
        `;
        await client.query(deleteQuery, [payment_terms_code, cmp_code]);

        await redis.del(
          `vendor_payment_terms:${cmp_code}:${payment_terms_code}`
        );
      }

      await redis.del("vendor_payment_terms:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Vendor Payment Terms deletion completed",
        deletedCount: items.length - notFound.length,
        notFound,
        status: "success",
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error during Vendor Payment Terms delete:", err);

      return res.status(500).json({
        message: "Database delete failed",
        error: err,
        status: "fail",
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Failed to delete Vendor Payment Terms:", error);

    return res.status(500).json({
      message: "Failed to delete Vendor Payment Terms",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
