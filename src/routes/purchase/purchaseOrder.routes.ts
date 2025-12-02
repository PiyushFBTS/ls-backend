import { Router } from 'express';
import { addPurchaseOrder } from '../../controllers/purchase/purchaseOrder/addPurchaseOrder.controller';
import { deletePurchaseOrder } from '../../controllers/purchase/purchaseOrder/deletePurchaseOrder.controller';
import { getPurchaseOrderById } from '../../controllers/purchase/purchaseOrder/getPurchaseOrderById.controller';
import { getPurchaseOrders } from '../../controllers/purchase/purchaseOrder/getPurchaseOrders.controller';
import { updatePurchaseOrder } from '../../controllers/purchase/purchaseOrder/updatePurchaseOrder.controller';

import { validate } from '../../middlewares/validate';
import { purchaseOrderSchema } from '../../schemas/purchase/purchaseorder.schema';

const router = Router();


router.post("/addPurchaseOrder", validate(purchaseOrderSchema), addPurchaseOrder);
router.get('/getPurchaseOrders', getPurchaseOrders);
router.get('/getPurchaseOrderById', getPurchaseOrderById);
router.put('/updatePurchaseOrder', updatePurchaseOrder);
router.post('/deletePurchaseOrder', deletePurchaseOrder);

export default router;
