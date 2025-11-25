import { z } from "zod";

export const ItemUnitOfMeasureFormSchema = z.object({
  item_unit_of_measure_code: z
    .string()
    .min(1, "Item Unit of Measure Code is required"),

  item_code: z.string().min(1, "Item code is required"),

  qty_per_unit_of_measure: z.coerce
    .number()
    .min(1, "Qty per unit of measure must be at least 1"),

  length: z
    .union([z.coerce.number(), z.literal("")])
    .optional(),

  width: z
    .union([z.coerce.number(), z.literal("")])
    .optional(),

  height: z
    .union([z.coerce.number(), z.literal("")])
    .optional(),

  cubage: z
    .union([z.coerce.number(), z.literal("")])
    .optional(),

  weight: z
    .union([z.coerce.number(), z.literal("")])
    .optional(),

  cmp_name: z.string().min(1, "Company name is required"),
  cmp_code: z.string().min(1, "Company code is required"),
});

export type ItemUnitOfMeasureType = z.infer<
  typeof ItemUnitOfMeasureFormSchema
>;
