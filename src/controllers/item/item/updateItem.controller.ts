import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { ItemFormType } from "../../../schemas/item/item.schema";

export const updateItem = async (req: Request, res: Response) => {
  try {
    const body = req.body as ItemFormType | any;

    const {
      item_code,
      description,
      base_unit_of_measure,
      gross_weight,
      net_weight,
      division,
      item_category_code,
      product_group_code,
      picture,
      lot_nos,
      gst_group_code,
      hsn_sac_code,
      exempted,
      price_include_gst,
      restaurant_gst_group_code,
      restaurant_hsn_sac_code,
      special_group_code,
      qty_not_in_decimal,
      oum_pop_up_on_pos,
      sales_unit_of_measure,
      zero_price_valid,
      no_discount_allowed,
      qty_becomes_negative,
      keying_in_price,
      keying_in_quantity,
      skip_compression_when_scanned,
      variant_aplicable,
      cmp_name,
      cmp_code,
    } = body;

    if (!item_code) {
      return res.status(400).json({ error: "item_code is required" });
    }

    // Convert Base64 → Buffer
    let pictureBuffer = null;
    if (picture) {
      const base64Data = picture.split(",")[1];
      pictureBuffer = Buffer.from(base64Data, "base64");
    }

    const query = `
      UPDATE posdb.item SET
        description = $1,
        base_unit_of_measure = $2,
        gross_weight = $3,
        net_weight = $4,
        division = $5,
        item_category_code = $6,
        product_group_code = $7,
        picture = $8,
        lot_nos = $9,
        gst_group_code = $10,
        hsn_sac_code = $11,
        exempted = $12,
        price_include_gst = $13,
        restaurant_gst_group_code = $14,
        restaurant_hsn_sac_code = $15,
        special_group_code = $16,
        qty_not_in_decimal = $17,
        oum_pop_up_on_pos = $18,
        sales_unit_of_measure = $19,
        zero_price_valid = $20,
        no_discount_allowed = $21,
        qty_becomes_negative = $22,
        keying_in_price = $23,
        keying_in_quantity = $24,
        skip_compression_when_scanned = $25,
        variant_aplicable = $26,
        cmp_name = $27,
        cmp_code = $28
      WHERE item_code = $29
    `;

    const values = [
      description,
      base_unit_of_measure,
      gross_weight,
      net_weight,
      division,
      item_category_code,
      product_group_code,
      pictureBuffer,
      lot_nos,
      gst_group_code,
      hsn_sac_code,
      exempted,
      price_include_gst,
      restaurant_gst_group_code,
      restaurant_hsn_sac_code,
      special_group_code,
      qty_not_in_decimal,
      oum_pop_up_on_pos,
      sales_unit_of_measure,
      zero_price_valid,
      no_discount_allowed,
      qty_becomes_negative,
      keying_in_price,
      keying_in_quantity,
      skip_compression_when_scanned,
      variant_aplicable,
      cmp_name,
      cmp_code,
      item_code,
    ];

    await pool.query(query, values);

    // Clear caches
    await redis.del("items:all");
    await redis.del(`item:${item_code}`);
    if (cmp_code) await redis.del(`items:company:${cmp_code}`);

    return res.status(200).json({
      message: "Item updated successfully",
    });

  } catch (error: any) {
    console.error("Update Item Error:", error);
    return res.status(500).json({
      message: "Failed to Update Item",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
