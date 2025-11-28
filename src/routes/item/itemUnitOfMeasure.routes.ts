import express from "express";
import { addItemUnitOfMeasure } from "../../controllers/item/itemUnitOfMeasure/addItemUnitOfMeasure.controller";
import { deleteUnitOfMeasure } from "../../controllers/item/itemUnitOfMeasure/deleteItemUnitOfMeasure.controller";
import { getItemUnitOfMeasureByCompany } from "../../controllers/item/itemUnitOfMeasure/getItemUnitOfMeasureByCompany.controller";
import { getItemUnitOfMeasureById } from "../../controllers/item/itemUnitOfMeasure/getItemUnitOfMeasureById.controller";
import { updateItemUnitOfMeasure } from "../../controllers/item/itemUnitOfMeasure/updateItemUnitOfMeasure.controller";
import { validate } from "../../middlewares/validate";
import { ItemUnitOfMeasureFormSchema } from "../../schemas/item/itemUnitOfMeasure.schema";

const router = express.Router();


// add new UnitOfMeasure
router.post("/addItemUnitOfMeasure", validate(ItemUnitOfMeasureFormSchema), addItemUnitOfMeasure);
// delete UnitOfMeasure
router.post("/deleteItemUnitOfMeasure", deleteUnitOfMeasure);
// get UnitOfMeasure by Id
router.get("/getItemUnitOfMeasureById", getItemUnitOfMeasureById);
// get UnitOfMeasure by company
router.get("/getItemUnitOfMeasureByCompany/:id", getItemUnitOfMeasureByCompany);
// update UnitOfMeasure
router.put("/updateItemUnitOfMeasure", updateItemUnitOfMeasure);

export default router;
