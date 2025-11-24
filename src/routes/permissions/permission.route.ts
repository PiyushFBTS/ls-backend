import express from 'express';
import { getUserPermissions } from '../../controllers/permissions/getUserPermissionsById.controller';
import { getUserSessionDataById } from '../../controllers/permissions/getUserSessionDataById.controller';
import { setUserPermissions } from '../../controllers/permissions/setUserPermissions.controller';
import { updateUserPermission } from '../../controllers/permissions/updateUserPermissions.controller';

const router = express.Router();

router.get('/user/:id', getUserPermissions);
router.get('/session/user/:id', getUserSessionDataById);
router.post('/set', setUserPermissions);
router.put('/update', updateUserPermission);

export default router;
