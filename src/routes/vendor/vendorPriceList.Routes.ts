import express from "express";
import { addVendorPriceList } from "../../controllers/vendor/vendorPriceList/addVendorPriceList.controller"
import { deleteVendorPriceList } from "../../controllers/vendor/vendorPriceList/deleteVendorPriceList.controller"
import { getVendorPriceListByCompany } from "../../controllers/vendor/vendorPriceList/getVendorPriceListByCompany.controller"
import { getVendorPriceListById } from "../../controllers/vendor/vendorPriceList/getVendorPriceListById.controller"
import { updateVendorPriceList } from "../../controllers/vendor/vendorPriceList/updateVendorPriceList.controller"
import { validate } from "../../middlewares/validate";
import { VendorPriceListFormSchema } from "../../schemas/vendor/vendorPriceLIst.schema";

const router = express.Router();

// add new Vendor Conatct
router.post("/addVendorPriceList", validate(VendorPriceListFormSchema), addVendorPriceList);
// delete Vendor Conatct
router.post("/deleteVendorPriceList", deleteVendorPriceList);
// get Vendor Conatct by id and cmp_code
router.get("/getVendorPriceListById", getVendorPriceListById);
// get Vendor Contact by cmp_Code
router.get("/getVendorPriceListByCompany/:id", getVendorPriceListByCompany);
// update Vendor Conatct
router.put("/updateVendorPriceList", updateVendorPriceList);

export default router;