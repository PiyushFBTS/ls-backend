import { z } from "zod";

export const purchaseHeaderSchema = z.object({
    purchase_id: z.string().min(1, "Purchase ID is required"),
    vendor_code: z.string().min(1, "Vendor Code is required"),
    posting_date: z.string().optional().or(z.literal("")),
    address: z.string().min(1, "Address is required"),
    vendor_gst_reg_no: z.string().optional().or(z.literal("")),
    ship_to_code: z.string().min(1, "Ship-To Location Code is required"),
});

export const purchaseLineSchema = z.object({
    type: z.string().min(1, "Type is required"),
    item_code: z.string().min(1, "Item Code is required"),
    location_code: z.string().min(1, "Location Code is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    qty_to_receive: z.coerce.number().min(0, "Qty to receive cannot be negative"),
    vat: z.string().optional().or(z.literal("")),
});

export const purchaseOrderSchema = z.object({
    header: purchaseHeaderSchema,
    lines: z.array(purchaseLineSchema).min(1, "At least one line item is required"),
});

export type PurchaseOrderType = z.infer<typeof purchaseOrderSchema>;
