import express from "express";
import { addVendorAssesseeCode } from "../../controllers/vendor/vendorAssesseeCode/addVendorAssesseeCode.controller";
import { deleteVendorAssesseeCode } from "../../controllers/vendor/vendorAssesseeCode/deleteVendorAssesseeCode.controller";
import { getVendorAssesseeCode } from "../../controllers/vendor/vendorAssesseeCode/getVendorAssesseeCode.controller";
import { getVendorAssesseeCodeById } from "../../controllers/vendor/vendorAssesseeCode/getVendorAssesseeCodeById.controller";
import { updateVendorAssesseeCode } from "../../controllers/vendor/vendorAssesseeCode/updateVendorAssesseeCode.controller";
import { validate } from "../../middlewares/validate";
import { VendorAssesseeCodeFormSchema } from "../../schemas/vendor/vendorAssesseeCode.schema";

const router = express.Router();

// add new Vendor Assessee Code
router.post("/addVendorAssesseeCode", validate(VendorAssesseeCodeFormSchema), addVendorAssesseeCode);
// delete Vendor Assessee Code
router.post("/deleteVendorAssesseeCode", deleteVendorAssesseeCode);
// get Vendor Assessee Code by Id 
router.get("/getVendorAssesseeCodeById/:id", getVendorAssesseeCodeById);
// get Vendor all Assessee Code 
router.get("/getVendorAssesseeCode", getVendorAssesseeCode);
// update Vendor Assessee Code
router.put("/updateVendorAssesseeCode", updateVendorAssesseeCode);

export default router;