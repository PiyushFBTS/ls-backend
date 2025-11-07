import { z } from 'zod';

export const companyFormSchema = z.object({
  cmp_code: z.string().min(1),
  cmp_name: z.string().min(1),
  add1: z.string().optional(),
  add2: z.string().optional(),
  country_code: z.string().min(1),
  state_code: z.string().min(1),
  city_code: z.number().int(),
  phone: z.string().optional(),
  email: z.string().email(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_mail: z.string().email().optional(),
  blocked: z.string().default('N'),
  vat_regn_no: z.string().optional(),
  tan_no: z.string().optional(),
  gstin: z.string().optional(),
  arn_no: z.string().optional(),
  tcan_no: z.string().optional(),
  pan_no: z.string().optional(),
  cmp_logo: z.string().optional(), // base64
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
