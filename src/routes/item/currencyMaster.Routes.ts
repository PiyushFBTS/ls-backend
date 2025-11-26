import express from "express";
import { addCurrency } from "../../controllers/item/currencyMaster/addCurrencyMaster.controller";
import { deleteCurrency } from "../../controllers/item/currencyMaster/deleteCurrencyMaster.controller";
import { getCurrency } from "../../controllers/item/currencyMaster/getCurrencyMaster.controller";
import { getCurrencyById } from "../../controllers/item/currencyMaster/getCurrencyMasterById.controller";
import { updateCurrency } from "../../controllers/item/currencyMaster/updateCurrencyMaster.controller";

const router = express.Router();

// add new currency
router.post("/addCurrency", addCurrency);
// delete currency
router.post("/deleteCurrency", deleteCurrency);
// get all currency
router.get("/getCurrency/all", getCurrency);
// get currency by id
router.get("/getCurrencyById/:id", getCurrencyById)
// update currency
router.put("/updateCurrency", updateCurrency);


export default router;
