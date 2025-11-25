import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { ItemUnitOfMeasureType } from "../../../schemas/item/itemUnitOfMeasure.schema";

export const addItemUnitOfMeasure = async (req: Request, res: Response) => {
    try {
        const body = req.body as ItemUnitOfMeasureType;

        const { item_unit_of_measure_code, item_code, qty_per_unit_of_measure, length,
            width, height, cubage, weight, cmp_name, cmp_code } = body;

        const query = `
      INSERT INTO posdb.item_unit_of_measure (
        item_unit_of_measure_code, item_code, qty_per_unit_of_measure,
        length, width, height, cubage, weight, cmp_name, cmp_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `;

        const values = [
            item_unit_of_measure_code,
            item_code,
            qty_per_unit_of_measure,
            length || null,
            width || null,
            height || null,
            cubage || null,
            weight || null,
            cmp_name,
            cmp_code,
        ];

        await pool.query(query, values);

        // Clear cached lists
        await redis.del("item_uom:all");
        await redis.del(`item_uom:item:${item_code}`);

        return res.status(200).json({
            message: "Item Unit of Measure created successfully",
            status: "success",
        });
    } catch (error: any) {
        console.error("Failed to create Item UOM:", error);

        return res.status(500).json({
            message: "Failed to Create Item Unit of Measure Code",
            error: error.message,
            status: "fail",
            timestamp: new Date().toLocaleString("en-IN"),
        });
    }
};
