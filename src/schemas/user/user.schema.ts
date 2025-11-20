import { z } from "zod";

export const UserSchema = z.object({
  user_code: z.coerce.number().optional(),
  role_name: z.coerce.string().min(1, "Role name is required"),
  role_code: z.coerce.number().min(1, "Role code is required"),
  user_name: z.string().min(1, "Username is required"),
  user_full_name: z.string().min(1, "Full name is required"),
  user_mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  user_email: z.string().email("Invalid email address"),
  user_pass: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  cmp_code: z.string().min(1, "Company is required"),
  cmp_name: z.string().min(1, "Company name is required"),
  blocked: z.coerce.boolean().optional()
});

export type UserFormValues = z.infer<typeof UserSchema>;
