import express from "express";
import { addGST } from "../../controllers/item/gstGroup/addGSTGroup.controller";
import { deleteGSTGroup } from "../../controllers/item/gstGroup/deleteGSTGroup.controller";
import { getGSTGroup } from "../../controllers/item/gstGroup/getGSTGroup.controller";
import { getGSTGroupById } from "../../controllers/item/gstGroup/getGSTGroupById.controller";
import { updateGSTGroup } from "../../controllers/item/gstGroup/updateGSTGroup.controller";

const router = express.Router();


router.post("/addGST", addGST);
router.post("/deleteGST", deleteGSTGroup);

router.get("/getGST/all", getGSTGroup);
router.get("/getGSTById/:id", getGSTGroupById);

router.put("/updateGST", updateGSTGroup);

export default router;
