import express from "express";
import { addGST } from "../../controllers/item/gstGroup/addGSTGroup.controller";
import { deleteGSTGroup } from "../../controllers/item/gstGroup/deleteGSTGroup.controller";
import { getGSTGroup } from "../../controllers/item/gstGroup/getGSTGroup.controller";
import { getGSTGroupById } from "../../controllers/item/gstGroup/getGSTGroupById.controller";
import { updateGSTGroup } from "../../controllers/item/gstGroup/updateGSTGroup.controller";

const router = express.Router();


// add new Gst
router.post("/addGST", addGST);
// delete gst
router.post("/deleteGST", deleteGSTGroup);
// get all gst 
router.get("/getGST", getGSTGroup);
// get gst by Id
router.get("/getGSTById/:id", getGSTGroupById);
// update Item
router.put("/updateGST", updateGSTGroup);

export default router;
