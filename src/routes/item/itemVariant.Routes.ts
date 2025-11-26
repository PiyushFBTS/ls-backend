import express from "express";
import { addItemVariant } from "../../controllers/item/itemVariant/addItemVariant.controller";
import { deleteItemVariant } from "../../controllers/item/itemVariant/deleteItemVariant.controller";
import { getItemVariantByCompany } from "../../controllers/item/itemVariant/getItemVariantByCompany.controller";
import { getItemVariantById } from "../../controllers/item/itemVariant/getItemVariantById.controller";
import { updateItemVariant } from "../../controllers/item/itemVariant/updateItemVariant.controller";
import { validate } from "../../middlewares/validate";
import { ItemVariantSchema } from "../../schemas/item/itemVariant.schema";

const router = express.Router();



router.post("/addItemVariant", validate(ItemVariantSchema), addItemVariant);
router.post("/deleteItemVariant", deleteItemVariant);
router.get("/getItemVariantById", getItemVariantById);
router.get("/getItemVariantByCompany/:id", getItemVariantByCompany);
router.put("/updateItemVariant", updateItemVariant);

export default router;
