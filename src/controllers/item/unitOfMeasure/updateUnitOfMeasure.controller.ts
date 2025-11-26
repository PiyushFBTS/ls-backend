import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateUnitOfMeasure = async (req: Request, res: Response) => {
    try {
        const { uom_code, uom_description, decimal_allowed, cmp_name, cmp_code } = req.body;

        // Validate required fields
        if (!uom_code || !cmp_code) {
            return res.status(400).json({
                message: "Missing required fields: uom_code or cmp_code",
            });
        }

        const query = `
      UPDATE posdb.unit_of_measure SET
        uom_description = $1,
        decimal_allowed = $2,
        cmp_name = $3
      WHERE cmp_code = $4 
        AND uom_code = $5
    `;

        const values = [uom_description, decimal_allowed, cmp_name, cmp_code, uom_code];

        const result = await pool.query(query, values);

        // Check if any row was updated
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Unit of Measure not found for given cmp_code & uom_code",
            });
        }

        // Clear Redis caches
        try {
            await redis.del("uom:all"); // List cache
            await redis.del(`uom:${cmp_code}:${uom_code}`); // Single UOM cache
            console.log("Redis cache cleared for UOM update");
        } catch (cacheErr) {
            console.warn("Failed to clear UOM cache:", cacheErr);
        }

        return res.status(200).json({
            message: "Unit of Measure updated successfully",
            status: "success",
        });

    } catch (error: any) {
        console.error("Failed to update Unit of Measure:", error);

        return res.status(500).json({
            message: "Failed to update Unit of Measure",
            error: error.message,
            status: "fail",
            timestamp: new Date().toLocaleString("en-IN"),
        });
    }
};
