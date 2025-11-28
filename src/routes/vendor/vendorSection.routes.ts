import express from "express";
import { addVendorSection } from "../../controllers/vendor/vendorSection/addVendorSection.controller"
import { deleteVendorSection } from "../../controllers/vendor/vendorSection/deleteVendorSection.controller"
import { getVendorSection } from "../../controllers/vendor/vendorSection/getVendorSection.controller"
import { getVendorSectionById } from "../../controllers/vendor/vendorSection/getVendorSectionById.controller"
import { updateVendorSection } from "../../controllers/vendor/vendorSection/updateVendorSection.controller"
import { validate } from "../../middlewares/validate";
import { VendorSectionFormSchema } from "../../schemas/vendor/vendorSection.schema";

const router = express.Router();

// add new Vendor Section
router.post("/addVendorSection", validate(VendorSectionFormSchema), addVendorSection);
// delete Vendor Section
router.post("/deleteVendorSection", deleteVendorSection);
// get Vendor Section by id and cmp_code
router.get("/getVendorSection", getVendorSection);
// get Vendor Section by cmp_Code
router.get("/getVendorSectionById/:id", getVendorSectionById);
// update Vendor Section
router.put("/updateVendorSection", updateVendorSection);

export default router;