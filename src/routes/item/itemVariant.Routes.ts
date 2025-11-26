import express from "express";
import { addItemVariant } from "../../controllers/item/itemVariant/addItemVariant.controller";
import { deleteItemVariant } from "../../controllers/item/itemVariant/deleteItemVariant.controller";
import { getItemVariantByCompany } from "../../controllers/item/itemVariant/getItemVariantByCompany.controller";
import { getItemVariantById } from "../../controllers/item/itemVariant/getItemVariantById.controller";
import { updateItemVariant } from "../../controllers/item/itemVariant/updateItemVariant.controller";
import { validate } from "../../middlewares/validate";
import { ItemVariantSchema } from "../../schemas/item/itemVariant.schema";

const router = express.Router();


// add Item Variant
router.post("/addItemVariant", validate(ItemVariantSchema), addItemVariant);
// deleet Item Variant
router.post("/deleteItemVariant", deleteItemVariant);
// get Item Variant by Id
router.get("/getItemVariantById", getItemVariantById);
// get Item Variantby Company
router.get("/getItemVariantByCompany/:id", getItemVariantByCompany);
// update Item Variant
router.put("/updateItemVariant", updateItemVariant);

export default router;
