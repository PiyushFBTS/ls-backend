import { z } from "zod";

export const ItemVariantSchema = z.object({
  item_variant_code: z.string().min(1, "Item Variant Code is required"),
  item_code: z.string().min(1, "Item Code is required"),
  description: z.string().min(1, "Description is required"),
  cmp_name: z.string().min(1, "Company Name is required"),
  cmp_code: z.string().min(1, "Company Code is required"),
});

export type ItemVariantType = z.infer<typeof ItemVariantSchema>;
