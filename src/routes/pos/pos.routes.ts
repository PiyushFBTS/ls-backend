import express from 'express';
import { getPOSItemSales } from '../../controllers/pos/getSearchItemById.controller';

const router = express.Router();

router.get("/getPOSItemSales/:id", getPOSItemSales);


export default router;
