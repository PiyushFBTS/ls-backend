import { z } from "zod";

const parseCalcString = (s?: string | null) => {
    if (!s) return null;
    const m = s.match(/^(\d+)([DMY])$/);
    if (!m) return null;
    return { num: parseInt(m[1], 10), unit: m[2] as "D" | "M" | "Y" };
};

const toDays = (num: number, unit: "D" | "M" | "Y") => {
    switch (unit) {
        case "D": return num;
        case "M": return num * 30;
        case "Y": return num * 365;
    }
};

export const VendorPaymentTermsFormSchema = z
    .object({
        cmp_code: z.string().nonempty(),
        cmp_name: z.string().nonempty(),
        payment_terms_code: z.string().nonempty(),
        due_date_calculations: z
            .string()
            .regex(/^(\d+)([DMY])$/, "Must be a valid format like '30D', '1M', or '1Y'")
            .optional()
            .or(z.literal("").optional()),

        discount_date_calculation: z
            .string()
            .regex(/^(\d+)([DMY])$/, "Must be a valid format like '30D', '1M', or '1Y'")
            .nullable()
            .optional()
            .or(z.literal("").optional()),

        discount_percent: z.number().nullable().optional(),
        description: z.string().nullable().optional(),
        calc_pmt_disc_on_cr_memos: z.boolean().optional(),
        coupled_to_dataverse: z.boolean().optional(),
    })
    .refine(
        (data) => {
            const due = parseCalcString(data.due_date_calculations);
            const disc = parseCalcString(data.discount_date_calculation);

            // Skip check if either field missing or invalid format
            if (!due || !disc) return true;

            const dueInDays = toDays(due.num, due.unit);
            const discInDays = toDays(disc.num, disc.unit);

            return discInDays <= dueInDays;
        },
        {
            message: "Discount Date cannot be greater than Due Date",
            path: ["discount_date_calculation"],
        }
    );


export type VendorPaymentTermsFormValues = z.infer<typeof VendorPaymentTermsFormSchema>;
