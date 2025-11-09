import { z } from 'zod';

export const StoreGroupSchema = z.object({
  cmp_code: z.string().min(1, 'Company Code is required'),
  cmp_name: z.string().min(1, 'Company Name is required'),
  ou_code: z.number().int(),
  ou_name: z.string().min(1, 'Operating Unit Name is required'),
  sg_code: z.string().min(1, 'Store Group Code is required'),
  sg_name: z.string().min(1, 'Store Group Name is required'),
});

export type StoreGroupFormValues = z.infer<typeof StoreGroupSchema>;
