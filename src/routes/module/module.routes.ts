import express from 'express';
import { getAllModules } from '../../controllers/module/module.controller';

const router = express.Router();

router.get('/getAllModules', getAllModules);

export default router;
