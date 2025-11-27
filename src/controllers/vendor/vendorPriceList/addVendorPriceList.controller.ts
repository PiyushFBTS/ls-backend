import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { VendorPriceListFormValues } from "../../../schemas/vendor/vendorPriceLIst.schema";

export const addVendorPriceList = async (req: Request, res: Response) => {
    try {
        if (!pool) {
            return res.status(500).json({
                error: "Database connection not available",
            });
        }

        const body = req.body as VendorPriceListFormValues;

        const {
            cmp_code,
            cmp_name,
            price_list_code,
            description,
            assign_to_group,
            assign_to_type,
            assign_to_no,
            assign_to_parent_no_projects,
            assign_to_id,
            price_type,
            defines,
            currency_code,
            starting_date,
            ending_date,
            price_includes_vat,
            vat_bus_posting_gr_price,
            allow_line_disc,
            allow_invoice_disc,
            no_series,
            status,
            filter_source_no,
            allow_updating_default,
            assign_to_no_alt,
            assign_to_parent_no_alt,
            approval_status,
        } = body;

        // Required validations
        if (!cmp_code || !price_list_code) {
            return res.status(400).json({
                error: "cmp_code and price_list_code are required",
                status: "fail",
            });
        }

        // --- Duplicate Price List Check ---
        const exists = await pool.query(
            `
      SELECT price_list_code 
      FROM posdb.vendor_price_list 
      WHERE price_list_code = $1
    `,
            [price_list_code]
        );

        if ((exists.rowCount ?? 0) > 0) {
            return res.status(400).json({
                error: "Vendor Price List with this price_list_code already exists",
                status: "fail",
            });
        }

        const query = `
      INSERT INTO posdb.vendor_price_list (
        cmp_code, cmp_name, price_list_code, description, assign_to_group,
        assign_to_type, assign_to_no, assign_to_parent_no_projects, assign_to_id,
        price_type, defines, currency_code, starting_date, ending_date,
        price_includes_vat, vat_bus_posting_gr_price, allow_line_disc,
        allow_invoice_disc, no_series, status, filter_source_no,
        allow_updating_default, assign_to_no_alt, assign_to_parent_no_alt,
        approval_status
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23, $24,
        $25
      )
    `;

        const values = [
            cmp_code,
            cmp_name,
            price_list_code,
            description,
            assign_to_group,
            assign_to_type,
            assign_to_no,
            assign_to_parent_no_projects,
            assign_to_id,
            price_type,
            defines,
            currency_code,
            starting_date,
            ending_date,
            price_includes_vat,
            vat_bus_posting_gr_price,
            allow_line_disc,
            allow_invoice_disc,
            no_series,
            status,
            filter_source_no,
            allow_updating_default,
            assign_to_no_alt,
            assign_to_parent_no_alt,
            approval_status,
        ];

        await pool.query(query, values);

        // --- Redis Cache Invalidation ---
        try {
            await redis.del("vendor_price_list:all");
            await redis.del(`vendor_price_list:cmp:${cmp_code}`);
            await redis.del(`vendor_price_list:code:${price_list_code}`);
        } catch (cacheErr) {
            console.warn("Failed to invalidate Vendor Price List cache:", cacheErr);
        }

        return res.status(200).json({
            message: "Vendor Price List added successfully",
            status: "success",
        });

    } catch (error: any) {
        console.error("Error creating Vendor Price List:", error);

        return res.status(500).json({
            message: "Failed to create Vendor Price List",
            error: error.message,
            status: "fail",
            timestamp: new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
            }),
        });
    }
};
