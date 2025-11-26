import { z } from "zod";

export const UnitOfMeasureFormSchema = z.object({
  uom_code: z.string().min(1, "Unit of measure code is required"),
  uom_description: z.string().min(1, "Unit of measure is required"),
  decimal_allowed: z.boolean(),
  cmp_name: z.string().min(1, "Company name is required"),
  cmp_code: z.string().min(1, "Company code is required"),
});

export type UnitOfMeasureFormType = z.infer<typeof UnitOfMeasureFormSchema>;
