// routes/vat.routes.ts
import { Router } from "express";
import { addVat } from "../../controllers/item/vat/addVat.controller";
import { deleteVat } from "../../controllers/item/vat/deleteVat.controller";
import { getVat } from "../../controllers/item/vat/getVat.controller";
import { getVatById } from "../../controllers/item/vat/getVatById.controller";
import { updateVat } from "../../controllers/item/vat/updateVat.controller";
import { VATFormSchema } from "../../schemas/item/vat.schema";
import { validate } from "../../middlewares/validate";

const router = Router();

//add VAt
router.post("/addVat", validate(VATFormSchema), addVat);
// delete Vat
router.post("/deleteVat", deleteVat);
// get All Vat
router.get("/getVat", getVat);
//update Vat
router.put("/updateVat", updateVat);
// Get vat by vat code
router.get("/getVATById/:id", getVatById);

export default router;
