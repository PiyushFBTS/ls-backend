import express from "express";
import { addCurrency } from "../../controllers/item/currencyMaster/addCurrencyMaster.controller";
import { deleteCurrency } from "../../controllers/item/currencyMaster/deleteCurrencyMaster.controller";
import { getCurrency } from "../../controllers/item/currencyMaster/getCurrencyMaster.controller";
import { getCurrencyById } from "../../controllers/item/currencyMaster/getCurrencyMasterById.controller";
import { updateCurrency } from "../../controllers/item/currencyMaster/updateCurrencyMaster.controller";

const router = express.Router();

router.post("/addCurrency", addCurrency);
router.post("/deleteCurrency", deleteCurrency);
router.get("/getCurrency/all", getCurrency);
router.get("/getCurrencyById/:id", getCurrencyById)
router.put("/updateCurrency", updateCurrency);


export default router;
