import express from "express";
import { addUnitOfMeasure } from "../../controllers/item/unitOfMeasure/addUnitOfMeasure.controller";
import { deleteUnitOfMeasure } from "../../controllers/item/unitOfMeasure/deleteUnitOfMeasure.controller";
import { getUnitOfMeasureByCompany } from "../../controllers/item/unitOfMeasure/getUnitOfMeasureByCompany.controller";
import { getUnitOfMeasureById } from "../../controllers/item/unitOfMeasure/getUnitOfMeasureById.controller";
import { updateUnitOfMeasure } from "../../controllers/item/unitOfMeasure/updateUnitOfMeasure.controller";

import { validate } from "../../middlewares/validate";
import { UnitOfMeasureFormSchema } from "../../schemas/item/unitOfMeasure.schema";

const router = express.Router();



router.post("/addUnitOfMeasure", validate(UnitOfMeasureFormSchema), addUnitOfMeasure);
router.post("/deleteUnitOfMeasure", deleteUnitOfMeasure);
router.get("/getUnitOfMeasureById", getUnitOfMeasureById);
router.get("/getUnitOfMeasureByCompany/:id", getUnitOfMeasureByCompany);
router.put("/updateUnitOfMeasure", updateUnitOfMeasure);

export default router;
