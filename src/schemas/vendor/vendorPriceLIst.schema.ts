import * as z from "zod"

export const VendorPriceListFormSchema = z.object({
  cmp_code: z.string().min(1, "Company Code is required"),
  cmp_name: z.string().min(1, "Company Name is required"),
  price_list_code: z.string().min(1, "Price List Code is required"),
  description: z.string().min(1, "Description is required"),
  
  assign_to_group: z.string().nullable().optional(),
  assign_to_type: z.string().nullable().optional(),
  assign_to_no: z.string().nullable().optional(),
  assign_to_parent_no_projects: z.string().nullable().optional(),
  assign_to_id: z.string().nullable().optional(),
  price_type: z.string().nullable().optional(),
  defines: z.string().nullable().optional(),
  currency_code: z.string().nullable().optional(),
  starting_date: z.string().nullable().optional(), // or z.date() if you handle Date objects
  ending_date: z.string().nullable().optional(), // or z.date() if you handle Date objects
  price_includes_vat: z.boolean().nullable().optional(),
  vat_bus_posting_gr_price: z.string().nullable().optional(),
  allow_line_disc: z.boolean().nullable().optional(),
  allow_invoice_disc: z.boolean().nullable().optional(),
  no_series: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  filter_source_no: z.string().nullable().optional(),
  allow_updating_default: z.boolean().nullable().optional(),
  assign_to_no_alt: z.string().nullable().optional(),
  assign_to_parent_no_alt: z.string().nullable().optional(),
  approval_status: z.string().nullable().optional(),
})

export type VendorPriceListFormValues = z.infer<typeof VendorPriceListFormSchema>;
