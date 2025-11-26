import express from "express";
import { addItemHierarchy } from "../../controllers/item/itemHierarchy/addItemHierarchy.controller";
import { deleteItemHierarchy } from "../../controllers/item/itemHierarchy/deleteItemHierarchy.controller";
import { getItemHierarchyByCmp } from "../../controllers/item/itemHierarchy/getItemHierarchyByCmp.controller";
import { getItemHierarchyById } from "../../controllers/item/itemHierarchy/getItemHierarchyById.controller";
import { updateItemHierarchy } from "../../controllers/item/itemHierarchy/updateItemHierarchy.controller";


const router = express.Router();

//  new item Hierarchy
router.post("/addItemHierarchy", addItemHierarchy);
//  delete item Hierarchy
router.post("/deleteItemHierarchy", deleteItemHierarchy);
//  get item Hierarchy by Id
router.get("/getItemHierarchyByCmp/:id", getItemHierarchyByCmp);
//  get item Hierarchy by company
router.get("/getItemHierarchyById", getItemHierarchyById);
//  update item Hierarchy 
router.put("/updateItemHierarchy", updateItemHierarchy);

export default router;
