import express from "express";
import { addItemSales } from "../../controllers/item/itemSales/addItemSales.controller";
import { deleteItemSales } from "../../controllers/item/itemSales/deleteItemSales.controller";
import { getItemSalesByCompany } from "../../controllers/item/itemSales/getItemSalesByCmp.controller";
import { getItemSalesById } from "../../controllers/item/itemSales/getItemSalesById.controller";
import { updateItemSales } from "../../controllers/item/itemSales/updateItemSales.controller";
import { validate } from "../../middlewares/validate";
import { ItemSalesFormSchema } from "../../schemas/item/itemSales.schema";

const router = express.Router();

router.post("/addItemSales", validate(ItemSalesFormSchema), addItemSales);
router.post("/deleteItemSales", deleteItemSales);
router.get("/getItemSalesByCmp/:id", getItemSalesByCompany);
router.get("/getItemSalesById/:id", getItemSalesById);
router.put("/updateItemSales", updateItemSales);

export default router;
