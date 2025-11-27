import * as z from "zod"

export const VendorContactFormSchema = z.object({
  cmp_code: z.string().min(1, "Company Code is required"),
  cmp_name: z.string().min(1, "Company Name is required"),
  contact_code: z.string().min(1, "Contact Code is required"),
  job_title: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  search_name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  address_2: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  post_code: z.coerce.number().nullable().optional(),
  phone_no: z.string().nullable().optional(),
  mobile_phone_no: z.string().nullable().optional(),
  email: z
    .string()
    .email("Invalid email format")
    .nullable()
    .optional()
    .or(z.literal("")), // allow empty string too
  last_date_modified: z.string().nullable().optional(),
  last_time_modified: z.string().nullable().optional(),
  image: z.any().nullable().optional(),
})

export type VendorContactFormValues = z.infer<typeof VendorContactFormSchema>
