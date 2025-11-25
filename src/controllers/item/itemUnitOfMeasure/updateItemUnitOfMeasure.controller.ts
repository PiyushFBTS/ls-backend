import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateItemUnitOfMeasure = async (req: Request, res: Response) => {
    try {
        const {
            item_unit_of_measure_code, item_code, qty_per_unit_of_measure, length,
            width, height, cubage, weight, cmp_name, cmp_code, } = req.body;

        // Validate required fields
        if (!item_unit_of_measure_code || !item_code || !qty_per_unit_of_measure) {
            return res.status(400).json({
                error: "Missing required fields",
                status: "fail",
            });
        }

        const query = `
      UPDATE posdb.item_unit_of_measure SET
        item_code = $1,
        qty_per_unit_of_measure = $2,
        length = $3,
        width = $4,
        height = $5,
        cubage = $6,
        weight = $7,
        cmp_name = $8,
        cmp_code = $9
      WHERE item_unit_of_measure_code = $10
    `;

        const values = [
            item_code, qty_per_unit_of_measure, length, width, height,
            cubage, weight, cmp_name, cmp_code, item_unit_of_measure_code,
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Item Unit of Measure Code not found",
                status: "fail",
            });
        }

        // Clear related Redis cache
        await redis.del("item_UnitOfMeasure :all");
        await redis.del(`item_UnitOfMeasure :${item_unit_of_measure_code}`);

        return res.status(200).json({
            message: "Item Unit of Measure Code updated successfully",
            status: "success",
        });
    } catch (error: any) {
        console.error("Failed to update item UnitOfMeasure :", error);

        return res.status(500).json({
            message: "Failed to Update Item Unit of Measure Code",
            error: error.message,
            status: "fail",
            timestamp: new Date().toLocaleString("en-IN"),
        });
    }
};
