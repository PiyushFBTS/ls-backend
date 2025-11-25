import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteCurrency = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const query = `
      DELETE FROM posdb.currency_master
      WHERE currency_code = ANY($1::text[])
    `;

    await pool.query(query, [ids]);

    // Clear cache because values changed
    await redis.del("currency:all");

    return res
      .status(200)
      .json({ message: "Currency Master deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting currency:", error);

    return res.status(500).json({
      message: "Failed to delete Currency Master",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
