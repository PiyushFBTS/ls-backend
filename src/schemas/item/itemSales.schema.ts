import { z } from "zod";

export const ItemSalesFormSchema = z.object({
  sales_code: z.string().min(1, "Sales code is required"),
  item_code: z.string().min(1, "Item Code is required"),
  currency_code: z.string().min(1, "Currency Code is required"),

  // FIX: remove required_error
  starting_date: z
    .coerce
    .date()
    .refine((d) => !isNaN(d.getTime()), { message: "Starting Date is required" }),

  unit_price: z.string().min(1, "Unit Price is required"),
  minimum_quantity: z.string().min(1, "Minimum Quantity is required"),

  ending_date: z
    .coerce
    .date()
    .refine((d) => !isNaN(d.getTime()), { message: "Ending Date is required" }),

  item_unit_of_measure_code: z.string().min(1, "Unit of Measure Code is required"),

  item_variant_code: z.string().optional().or(z.literal("")),

  cmp_name: z.string().min(1, "Company name is required"),
  cmp_code: z.string().min(1, "Company code is required"),
});

export type ItemSalesFormType = z.infer<typeof ItemSalesFormSchema>;
