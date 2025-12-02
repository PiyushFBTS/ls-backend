import { Request, Response } from 'express';
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const getPurchaseOrderById = async (req: Request, res: Response) => {
    try {
        const { purchase_id } = req.query;

        if (!purchase_id)
            return res.status(400).json({ error: "purchase_id is required" });

        const cacheKey = `purchase:${purchase_id}`;

        const cached = await redis.get(cacheKey);
        if (cached) return res.status(200).json(JSON.parse(cached));

        const headerQuery = `
      SELECT * FROM posdb.purchase_header
      WHERE purchase_id = $1;
    `;
        const lineQuery = `
      SELECT * FROM posdb.purchase_line
      WHERE purchase_id = $1;
    `;

        const headerRes = await pool.query(headerQuery, [purchase_id]);
        if (headerRes.rowCount === 0)
            return res.status(404).json({ error: "PO not found" });

        const lineRes = await pool.query(lineQuery, [purchase_id]);

        const response = {
            purchase_order: headerRes.rows[0],
            lines: lineRes.rows,
        };

        await redis.set(cacheKey, JSON.stringify(response), "EX", 120);

        return res.status(200).json(response);

    } catch (err) {
        console.error("Get PO by ID error:", err);
        return res.status(500).json({ error: "Failed to fetch PO" });
    }
};
