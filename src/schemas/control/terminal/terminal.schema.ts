import { z } from "zod";

export const TerminalSchema = z.object({
  cmp_code: z.string().min(1, "Company Code is required"),
  cmp_name: z.string().min(1, "Company Name is required"),
  ou_code: z.number().int(),
  ou_name: z.string().min(1, "Operating Unit Name is required"),
  store_code: z.string().min(1, "Store Code is required"),
  store_name: z.string().min(1, "Store Name is required"),
  terminal_id: z.string().min(1, "Terminal ID is required"),
});

export type TerminalFormValues = z.infer<typeof TerminalSchema>;
