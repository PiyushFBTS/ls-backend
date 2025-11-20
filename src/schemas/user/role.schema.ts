import * as z from "zod"

export const RoleFormSchema = z.object({
  role_name: z.coerce.string().min(1, "Role name is required"),
  role_description: z.coerce.string().min(1, "Role description is required"),
  role_code: z.coerce.number().optional(),
  cmp_code: z.string().min(1, "Company is required"),
  cmp_name: z.string().min(1, "Company name is required"),
})

export type RoleFormValues = z.infer<typeof RoleFormSchema>