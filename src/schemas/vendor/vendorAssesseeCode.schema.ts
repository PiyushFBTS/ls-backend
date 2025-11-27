import * as z from "zod"

export const VendorAssesseeCodeFormSchema = z.object({
    assessee_code: z.string().min(1, "Company Code is required"),
    description: z.string().min(1, "Company Name is required"),
    type: z.string().min(1, "Price List Code is required")
})



export type VendorAssesseeCodeFormValues = z.infer<typeof VendorAssesseeCodeFormSchema>;
