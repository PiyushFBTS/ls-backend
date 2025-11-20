import { Router } from "express";
import { addTerminal } from "../../../controllers/control/terminal/addTerminal.controller";
import { deleteTerminal } from "../../../controllers/control/terminal/deleteTerminal.controller";
import { getTerminalsByCompany } from "../../../controllers/control/terminal/getTerminalsByCompany.controller";
import { getTerminalById } from "../../../controllers/control/terminal/getTerminalById.controller";
import { updateTerminal } from "../../../controllers/control/terminal/updateTerminal.controller";
import { validate } from "../../../middlewares/validate";
import { TerminalSchema } from "../../../schemas/control/terminal/terminal.schema";

const router = Router();

router.post("/addTerminal", validate(TerminalSchema), addTerminal);
router.post("/deleteTerminal", deleteTerminal);
router.get("/getTerminalByCompany/:id", getTerminalsByCompany);
router.get("/getTerminal/:id", getTerminalById);
router.put("/updateTerminal/:id", updateTerminal);

export default router;
