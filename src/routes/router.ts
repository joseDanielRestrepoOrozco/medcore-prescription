import { Router } from 'express';
import prescriptionsRouter from './prescriptions.routes.js';
import allergiesRouter from './allergies.routes.js';

const router = Router();

router.use('/prescriptions', prescriptionsRouter);
router.use('/allergies', allergiesRouter);

export default router;
