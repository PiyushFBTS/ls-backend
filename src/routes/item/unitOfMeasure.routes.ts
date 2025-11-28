import express from "express";
import { addUnitOfMeasure } from "../../controllers/item/unitOfMeasure/addUnitOfMeasure.controller";
import { deleteUnitOfMeasure } from "../../controllers/item/unitOfMeasure/deleteUnitOfMeasure.controller";
import { getUnitOfMeasureByCompany } from "../../controllers/item/unitOfMeasure/getUnitOfMeasureByCompany.controller";
import { getUnitOfMeasureById } from "../../controllers/item/unitOfMeasure/getUnitOfMeasureById.controller";
import { updateUnitOfMeasure } from "../../controllers/item/unitOfMeasure/updateUnitOfMeasure.controller";

import { validate } from "../../middlewares/validate";
import { UnitOfMeasureFormSchema } from "../../schemas/item/unitOfMeasure.schema";

const router = express.Router();


// add new UnitOfMeasure
router.post("/addUnitOfMeasure", validate(UnitOfMeasureFormSchema), addUnitOfMeasure);
// delete UnitOfMeasure
router.post("/deleteUnitOfMeasure", deleteUnitOfMeasure);
// get UnitOfMeasure by id
router.get("/getUnitOfMeasureById", getUnitOfMeasureById);
// get UnitOfMeasure by company
router.get("/getUnitOfMeasureByCompany/:id", getUnitOfMeasureByCompany);
//update UnitOfMeasure
router.put("/updateUnitOfMeasure", updateUnitOfMeasure);

export default router;
