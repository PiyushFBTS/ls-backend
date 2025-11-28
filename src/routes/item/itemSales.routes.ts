import express from "express";
import { addItemSales } from "../../controllers/item/itemSales/addItemSales.controller";
import { deleteItemSales } from "../../controllers/item/itemSales/deleteItemSales.controller";
import { getItemSalesByCompany } from "../../controllers/item/itemSales/getItemSalesByCmp.controller";
import { getItemSalesById } from "../../controllers/item/itemSales/getItemSalesById.controller";
import { updateItemSales } from "../../controllers/item/itemSales/updateItemSales.controller";
import { validate } from "../../middlewares/validate";
import { ItemSalesFormSchema } from "../../schemas/item/itemSales.schema";

const router = express.Router();

// add new item sales prices
router.post("/addItemSales", validate(ItemSalesFormSchema), addItemSales);
// delete item sales prices
router.post("/deleteItemSales", deleteItemSales);
//get item sales prices by company
router.get("/getItemSalesByCmp/:id", getItemSalesByCompany);
// get  new item sales prices by Id
router.get("/getItemSalesById", getItemSalesById);
// update item sales prices
router.put("/updateItemSales", updateItemSales);

export default router;
