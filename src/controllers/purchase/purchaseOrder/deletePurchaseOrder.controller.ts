import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const deletePurchaseOrder = async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const { ids } = req.body;

        // Validate request
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No IDs provided" });
        }

        const checkQuery = `
            SELECT purchase_id 
            FROM posdb.purchase_header 
            WHERE purchase_id = ANY($1::text[])
        `;
        const existing = await pool.query(checkQuery, [ids]);

        if (existing.rows.length === 0) {
            return res.status(404).json({
                message: "No Purchase Orders found for deletion",
            });
        }

        await client.query("BEGIN");

        const deleteLinesQuery = `
            DELETE FROM posdb.purchase_line
            WHERE purchase_id = ANY($1::text[])
        `;
        await client.query(deleteLinesQuery, [ids]);

        const deleteHeaderQuery = `
            DELETE FROM posdb.purchase_header
            WHERE purchase_id = ANY($1::text[])
        `;
        const headerDelete = await client.query(deleteHeaderQuery, [ids]);

        await client.query("COMMIT");

        try {
            await redis.del("purchase:all");
            
            const pipeline = redis.pipeline();
            ids.forEach((id) => pipeline.del(`purchase:${id}`));
            await pipeline.exec();
        } catch (cacheErr) {
            console.warn("Failed to invalidate cache:", cacheErr);
        }

        return res.status(200).json({
            message: "Purchase Orders deleted successfully",
            deletedCount: headerDelete.rowCount,
        });

    } catch (err: any) {
        await client.query("ROLLBACK");
        console.error("Delete PO error:", err);

        return res.status(500).json({
            message: "Failed to delete Purchase Order",
            error: err.message,
            status: "fail",
            timestamp: new Date().toLocaleString("en-IN"),
        });
    } finally {
        client.release();
    }
};
