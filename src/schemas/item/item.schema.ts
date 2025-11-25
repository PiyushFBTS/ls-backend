import { z } from "zod";

export const ItemFormSchema = z.object({
  item_code: z.string().min(1, "Item Code is required"),
  description: z.string().min(1, "Description is required"),
  base_unit_of_measure: z.string().min(1, "Base Unit Of Measure is required"),
  gross_weight: z.coerce.number().optional().or(z.literal("")),
  net_weight: z.coerce.number().optional().or(z.literal("")),
  division: z.string().min(1, "Division is required"),
  item_category_code: z.string().min(1, "Item Category is required"),
  product_group_code: z.string().min(1, "Product Group is required"),

  picture: z.string().optional(),

  lot_nos: z.string().min(1, "Lot Nos is required"),
  gst_group_code: z.string().min(1, "GST Group Code is required"),
  hsn_sac_code: z.string().min(1, "HSN/SAC Code is required"),

  exempted: z.string().optional().or(z.literal("")),
  price_include_gst: z.string().optional().or(z.literal("")),

  restaurant_gst_group_code: z
    .string()
    .min(1, "Restaurant GST Group Code is required"),

  restaurant_hsn_sac_code: z
    .string()
    .min(1, "Restaurant HSN/SAC Code is required"),

  special_group_code: z.string().min(1, "Special Group Code is required"),

  qty_not_in_decimal: z.string().optional().or(z.literal("")),
  oum_pop_up_on_pos: z.string().optional().or(z.literal("")),
  sales_unit_of_measure: z.string().min(1, "Sales Unit of Measure is required"),

  zero_price_valid: z.string().optional().or(z.literal("")),
  no_discount_allowed: z.string().optional().or(z.literal("")),
  qty_becomes_negative: z.string().optional().or(z.literal("")),
  keying_in_price: z.string().optional().or(z.literal("")),
  keying_in_quantity: z.string().optional().or(z.literal("")),
  skip_compression_when_scanned: z.string().optional().or(z.literal("")),
  variant_aplicable: z.string().optional().or(z.literal("")),

  cmp_code: z.string().min(1, "Company code is required"),
  cmp_name: z.string().min(1, "Company name is required"),
});

export type ItemFormType = z.infer<typeof ItemFormSchema>;
