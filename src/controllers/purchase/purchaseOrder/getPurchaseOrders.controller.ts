import { Request, Response } from 'express';
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const getPurchaseOrders = async (req: Request, res: Response) => {
    try {
        const cacheKey = "purchase:all";

        const cached = await redis.get(cacheKey);
        if (cached) return res.status(200).json(JSON.parse(cached));

        const query = `
      SELECT purchase_id, vendor_code, document_date, posting_date,
             address, vendor_gst_reg_no, ship_to_code
      FROM posdb.purchase_header
      ORDER BY purchase_id DESC;
    `;

        const result = await pool.query(query);

        await redis.set(cacheKey, JSON.stringify(result.rows), "EX", 60); // 1 min

        return res.status(200).json(result.rows);

    } catch (err) {
        console.error("Get all PO error:", err);
        return res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
};
