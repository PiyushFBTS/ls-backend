import express from "express";
import { addRole } from "../../controllers/userAndRole/role/addRole.controller";
import { deleteRoles } from "../../controllers/userAndRole/role/deleteRole.controller";
import { getRolesByCompany } from "../../controllers/userAndRole/role/getRoleByCompanyCode.controller";
import { getRoleById } from "../../controllers/userAndRole/role/getRoleById.controller";
import { updateRole } from "../../controllers/userAndRole/role/updateRole.controller";
import { RoleFormSchema } from "../../schemas/user/role.schema";
import { validate } from "../../middlewares/validate";


const router = express.Router();

router.post("/addRole", validate(RoleFormSchema), addRole);
router.post("/deleteRole", deleteRoles);
router.get("/getRoleByCompany/:id", getRolesByCompany);
router.get("/getRoleById/:id", getRoleById);
router.put("/updateRole/:id", updateRole);

export default router;
