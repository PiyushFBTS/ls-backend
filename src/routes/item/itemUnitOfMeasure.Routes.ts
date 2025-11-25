import express from "express";
import { addItemUnitOfMeasure } from "../../controllers/item/itemUnitOfMeasure/addItemUnitOfMeasure.controller";
import { deleteUnitOfMeasure } from "../../controllers/item/itemUnitOfMeasure/deleteItemUnitOfMeasure.controller";
import { getItemUnitOfMeasureByCompany } from "../../controllers/item/itemUnitOfMeasure/getItemUnitOfMeasureByCompany.controller";
import { getItemUnitOfMeasureById } from "../../controllers/item/itemUnitOfMeasure/getItemUnitOfMeasureById.controller";
import { updateItemUnitOfMeasure } from "../../controllers/item/itemUnitOfMeasure/updateItemUnitOfMeasure.controller";
import { validate } from "../../middlewares/validate";
import { ItemUnitOfMeasureFormSchema } from "../../schemas/item/itemUnitOfMeasure.schema";

const router = express.Router();



router.post("/addItemUnitOfMeasure", validate(ItemUnitOfMeasureFormSchema), addItemUnitOfMeasure);
router.post("/deleteItemUnitOfMeasure", deleteUnitOfMeasure);
router.get("/getItemUnitOfMeasureById", getItemUnitOfMeasureById);
router.get("/getItemUnitOfMeasureByCompany/:id", getItemUnitOfMeasureByCompany);
router.put("/updateItemUnitOfMeasure", updateItemUnitOfMeasure);

export default router;
