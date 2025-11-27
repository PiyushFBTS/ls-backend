import express from "express";
import { addVendorMaster } from "../../controllers/vendor/vendorMaster/addVendorMaster.controller";
import { deleteVendorMaster } from "../../controllers/vendor/vendorMaster/deleteVendorMaster.controller";
import { getVendorMasterByCompany } from "../../controllers/vendor/vendorMaster/getVendorMasterByCompany.controller";
import { getVendorMasterById } from "../../controllers/vendor/vendorMaster/getVendorMasterById.controller";
import { updateVendorMaster } from "../../controllers/vendor/vendorMaster/updateVendorMaster.controller";

import { validate } from "../../middlewares/validate";
import { VendorMasterFormSchema } from "../../schemas/vendor/vendorMaster.schema";

const router = express.Router();

// add new Vendor
router.post("/addVendorMaster", validate(VendorMasterFormSchema), addVendorMaster);
// delete Vendor
router.post("/deleteVendorMaster", deleteVendorMaster);
// get Vendor by company
router.get("/getVendorMasterByCompany/:id", getVendorMasterByCompany);
// get Vendor by Id and cmp_code
router.get("/getVendorMasterById", getVendorMasterById);
// update Vendor
router.put("/updateVendorMaster", updateVendorMaster);

export default router;