import express from "express";
import { addItem } from "../../controllers/item/item/addItem.controller";
import { deleteItem } from "../../controllers/item/item/deleteItem.controller";
import { getItemsByCompany } from "../../controllers/item/item/getItemByCompany.controller";
import { getItemById } from "../../controllers/item/item/getItemById.controller";
import { updateItem } from "../../controllers/item/item/updateItem.controller";
import { validate } from "../../middlewares/validate";
import { ItemFormSchema } from "../../schemas/item/item.schema";

const router = express.Router();

// add new Item
router.post("/addItem", validate(ItemFormSchema), addItem);
// delete Item
router.post("/deleteItem", deleteItem);
// get Item by company
router.get("/getItemsByCompany/:id", getItemsByCompany);
// get item by Id 
router.get("/getItemById", getItemById);
// update Item
router.put("/updateItem", validate(ItemFormSchema), updateItem);

export default router;