import { Request, Response } from 'express';
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const updatePurchaseOrder = async (req: Request, res: Response) => {
    try {
        const { purchase_id } = req.query;
        const body = req.body;

        if (!purchase_id)
            return res.status(400).json({ error: "purchase_id is required" });

        const query = `
      UPDATE posdb.purchase_header SET
        vendor_code = $2,
        document_date = $3,
        posting_date = $4,
        address = $5,
        vendor_gst_reg_no = $6,
        ship_to_code = $7
      WHERE purchase_id = $1
      RETURNING purchase_id
    `;

        const values = [
            purchase_id,
            body.vendor_code,
            body.document_date,
            body.posting_date,
            body.address,
            body.vendor_gst_reg_no,
            body.ship_to_code,
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0)
            return res.status(404).json({ error: "PO not found" });

        // CLEAR CACHE
        await redis.del("purchase:all");
        await redis.del(`purchase:${purchase_id}`);

        return res.status(200).json({ message: "Purchase Order Updated" });

    } catch (err) {
        console.error("Update PO error:", err);
        return res.status(500).json({ error: "Failed to update PO" });
    }
};
