import express from "express";
import { addItem } from "../../controllers/item/item/addItem.controller";
import { deleteItem } from "../../controllers/item/item/deleteItem.controller";
import { getItemsByCompany } from "../../controllers/item/item/getItemByCompany.controller";
import { getItemById } from "../../controllers/item/item/getItemById.controller";
import { updateItem } from "../../controllers/item/item/updateItem.controller";
import { validate } from "../../middlewares/validate";
import { ItemFormSchema } from "../../schemas/item/item.schema";

const router = express.Router();


router.post("/addItem", validate(ItemFormSchema), addItem);
router.post("/deleteItem", deleteItem);
router.get("/getItemsByCompany/:id", getItemsByCompany);
router.get("/getItemById", getItemById);
router.put("/updateItem", validate(ItemFormSchema), updateItem);

export default router;