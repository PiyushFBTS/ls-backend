import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { UnitOfMeasureFormType } from "../../../schemas/item/unitOfMeasure.schema";

export const addUnitOfMeasure = async (req: Request, res: Response) => {
    try {
        const body = req.body as UnitOfMeasureFormType;

        const { uom_code, uom_description, decimal_allowed, cmp_name, cmp_code } = body;

        const insertQuery = `
      INSERT INTO posdb.unit_of_measure (
        uom_code, uom_description, decimal_allowed, cmp_name, cmp_code
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

        await pool.query(insertQuery, [
            uom_code,
            uom_description,
            decimal_allowed,
            cmp_name,
            cmp_code,
        ]);

        // Invalidate cache
        await redis.del("uom:all");

        return res.status(200).json({
            message: "Unit of Measure added successfully",
            status: "success",
        });
    } catch (error: any) {
        console.error("Add UOM error:", error);
        return res.status(500).json({
            message: "Failed to create Unit of Measure",
            error: error.message,
            status: "fail",
        });
    }
};
