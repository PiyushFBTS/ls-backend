
import { z } from "zod";

export const VATFormSchema = z.object({
  vat_code: z.string().min(1, "VAT Code is required"),
  vat_percentage: z.coerce.number().min(1, "VAT Percentage must be at least 0"),
  cess: z.coerce.number().min(1, "Cess must be at least 0")
});

export type VATType = z.infer<typeof VATFormSchema>;
