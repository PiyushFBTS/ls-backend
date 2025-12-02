import { z } from "zod";

export const LocationFormSchema = z.object({
  location_code: z.string().min(1, "Location Code is required"),
  name: z.string().min(1, "Location Name is required"),
  address1: z.string().min(1, "Address is required"),
  county: z.string().optional().or(z.literal("")),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  post_code: z.string().min(1, "Post Code is required"),
  phone: z.string().min(1, "Phone is required"),
  gst: z.string().optional().or(z.literal("")),
  cmp_name: z.string().min(1, "Company Name is required"),
  cmp_code: z.string().min(1, "Company Code is required"),

});

export type LocationFormType = z.infer<typeof LocationFormSchema>;
