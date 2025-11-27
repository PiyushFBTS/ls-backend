import * as z from "zod"

export const VendorSectionFormSchema = z.object({
  section_code: z.string().min(1, "Section Code is required"),
  description: z.string().min(1, "Description is required"),
  ecode: z.string().nullable().optional(),
  detail: z.string().nullable().optional(),
  
  presentation_order:z.coerce.number().nullable().optional(),
  indentation_level: z.coerce.number().nullable().optional(),
  parent_code: z.string().nullable().optional(),
  section_order: z.coerce.number().nullable().optional(),
})

export type VendorSectionFormValues = z.infer<typeof VendorSectionFormSchema>;
