import express from "express";
import { addItemHierarchy } from "../../controllers/item/itemHierarchy/addItemHierarchy.controller";
import { deleteItemHierarchy } from "../../controllers/item/itemHierarchy/deleteItemHierarchy.controller";
import { getItemHierarchyByCmp } from "../../controllers/item/itemHierarchy/getItemHierarchyByCmp.controller";
import { getItemHierarchyById } from "../../controllers/item/itemHierarchy/getItemHierarchyById.controller";
import { updateItemHierarchy } from "../../controllers/item/itemHierarchy/updateItemHierarchy.controller";


const router = express.Router();


router.post("/addItemHierarchy", addItemHierarchy);

router.post("/deleteItemHierarchy", deleteItemHierarchy);

router.get("/getItemHierarchyByCmp/:id", getItemHierarchyByCmp);

router.get("/getItemHierarchyById/:id", getItemHierarchyById);

router.put("/updateItemHierarchy", updateItemHierarchy);

export default router;
