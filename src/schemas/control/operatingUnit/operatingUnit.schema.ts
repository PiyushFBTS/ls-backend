import { z } from 'zod';

export const operatingUnitSchema = z.object({
  cmp_code: z.string().min(1),
  cmp_name: z.string().min(1),
  ou_code: z.number().int(),
  ou_name: z.string().min(1),
});

export type OperatingUnitFormValues = z.infer<typeof operatingUnitSchema>;
