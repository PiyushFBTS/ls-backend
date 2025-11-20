import { Router } from "express";
import { addUser } from "../../controllers/userAndRole/user/addUser.controller";
import { deleteUsers } from "../../controllers/userAndRole/user/deleteUser.controller";
import { getUsers } from "../../controllers/userAndRole/user/getUser.controller";
import { getUsersByCompany } from "../../controllers/userAndRole/user/getUserByCompanyCode.controller";
import { getUserById } from "../../controllers/userAndRole/user/getUserById.controller";
import { updateUser } from "../../controllers/userAndRole/user/updateUser.controller";
import { getUserRolesByCompany } from "../../controllers/userAndRole/user/getUserRolesByCompany.controller";
import { validate } from "../../middlewares/validate";
import { UserSchema } from "../../schemas/user/user.schema";

const router = Router();

router.post("/addUser", validate(UserSchema), addUser);
router.post("/deleteUser", deleteUsers);
router.get("/getUser", getUsers);
router.get("/getUserRolesByCompany/:id", getUserRolesByCompany);
router.get("/getUserByCompany/:id", getUsersByCompany);
router.get("/getUserById/:id", getUserById);
router.put("/updateUser/:id", updateUser);


export default router;
