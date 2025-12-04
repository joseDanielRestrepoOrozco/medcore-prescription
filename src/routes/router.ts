import { Router } from 'express';
import prescriptionsRouter from './prescriptions.routes.js';
import allergiesRouter from './allergies.routes.js';
import medicationTemplatesRouter from './medication-templates.routes.js';

const router = Router();

router.use('/prescriptions', prescriptionsRouter);
router.use('/allergies', allergiesRouter);
router.use('/medication-templates', medicationTemplatesRouter);

export default router;
