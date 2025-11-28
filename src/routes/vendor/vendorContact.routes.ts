import express from "express";
import { addVendorContact } from "../../controllers/vendor/vendorContact/addVendorContact.controller"
import { deleteVendorContact } from "../../controllers/vendor/vendorContact/deleteVendorContact.controller"
import { getVendorContactById } from "../../controllers/vendor/vendorContact/getVendorContactById.controller"
import { getVendorContactByCompany } from "../../controllers/vendor/vendorContact/getVendorContactbyCompany.controller"
import { updateVendorContact } from "../../controllers/vendor/vendorContact/updateVendorContact.controller"
import { VendorContactFormSchema } from "../../schemas/vendor/vendorContact.schema";
import { validate } from "../../middlewares/validate";

const router = express.Router();

// add new Vendor Conatct
router.post("/addVendorContact", validate(VendorContactFormSchema), addVendorContact);
// delete Vendor Conatct
router.post("/deleteVendorContact", deleteVendorContact);
// get Vendor Conatct by id and cmp_code
router.get("/getVendorContactById", getVendorContactById);
// get Vendor Contact by cmp_Code
router.get("/getVendorContactbyCompany/:id", getVendorContactByCompany);
// update Vendor Conatct
router.put("/updateVendorContact", updateVendorContact);

export default router;