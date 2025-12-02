import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const addPurchaseOrder = async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const { header, lines } = req.body;

        if (!header || !lines || lines.length === 0) {
            return res.status(400).json({ error: "Header & lines are required" });
        }

        await client.query("BEGIN");

        // Insert Header
        const headerQuery = `
            INSERT INTO posdb.purchase_header 
            (purchase_id, vendor_code, document_date, posting_date, address, vendor_gst_reg_no, ship_to_code)
            VALUES ($1, $2, NOW(), $3, $4, $5, $6)
        `;

        await client.query(headerQuery, [
            header.purchase_id,
            header.vendor_code ?? null,
            header.posting_date ?? null,
            header.address ?? null,
            header.vendor_gst_reg_no ?? null,
            header.ship_to_code ?? null
        ]);

        // Insert Lines
        const lineQuery = `
            INSERT INTO posdb.purchase_line 
            (purchase_id, type, item_code, location_code, quantity, qty_to_receive, vat)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
        `;

        for (const line of lines) {
            await client.query(lineQuery, [
                header.purchase_id,
                line.type ?? null,
                line.item_code ?? null,
                line.location_code ?? null,
                line.quantity ?? 0,
                line.qty_to_receive ?? 0,
                line.vat ?? null
            ]);
        }

        await client.query("COMMIT");

        // CLEAR CACHE
        await redis.del("purchase:all");
        await redis.del(`purchase:${header.purchase_id}`);

        return res.status(201).json({ message: "Purchase Order created" });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Create PO Error:", err);
        return res.status(500).json({ error: "Failed to create Purchase Order" });
    } finally {
        client.release();
    }
};
