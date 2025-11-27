import express from "express";
import { addVendorPaymentTerms } from "../../controllers/vendor/vendorPaymentTerms/addVendorPaymentTerms.controller"
import { deleteVendorPaymentTerms } from "../../controllers/vendor/vendorPaymentTerms/deleteVendorPaymentTerms.controller"
import { getVendorPaymentTermsByCompany } from "../../controllers/vendor/vendorPaymentTerms/getVendorPaymentTermByCompanys.controller"
import { getVendorPaymentTermsById } from "../../controllers/vendor/vendorPaymentTerms/getVendorPaymentTermsById.controller"
import { updateVendorPaymentTerms } from "../../controllers/vendor/vendorPaymentTerms/updateVendorPaymentTerms.controller"
import { validate } from "../../middlewares/validate";
import { VendorPaymentTermsFormSchema } from "../../schemas/vendor/vendorPaymentTerms.schema";

const router = express.Router();

// add new Vendor Conatct
router.post("/addVendorPaymentTerms", validate(VendorPaymentTermsFormSchema), addVendorPaymentTerms);
// delete Vendor Conatct
router.post("/deleteVendorPaymentTerms", deleteVendorPaymentTerms);
// get Vendor Conatct by id and cmp_code
router.get("/getVendorPaymentTermsById", getVendorPaymentTermsById);
// get Vendor Contact by cmp_Code
router.get("/getVendorPaymentTermsByCompany/:id", getVendorPaymentTermsByCompany);
// update Vendor Conatct
router.put("/updateVendorPaymentTerms", updateVendorPaymentTerms);

export default router;