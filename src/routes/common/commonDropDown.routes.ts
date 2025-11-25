import express from "express";
import { getAllCurrency } from "../../controllers/common/getAllCurrency.controller";
import { getAllGSTGroup } from "../../controllers/common/getAllGSTGroup.controller";

const router = express.Router();

router.get("/getAllCurrency", getAllCurrency);
router.get("/getAllGSTGroup", getAllGSTGroup);




export default router;
