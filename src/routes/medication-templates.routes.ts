import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.js';
import * as controller from '../controllers/medication-templates.controller.js';

const router = Router();

/**
 * @openapi
 * /medication-templates:
 *   get:
 *     tags: [Medication Templates]
 *     summary: Obtener templates de medicamentos
 *     description: Lista todos los templates de medicamentos predefinidos con diagnósticos comunes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (Analgésico, Antibiótico, etc.)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o nombre genérico
 *     responses:
 *       200:
 *         description: Lista de templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 */
router.get('/', authenticateUser(), controller.getAllTemplates);

/**
 * @openapi
 * /medication-templates/categories:
 *   get:
 *     tags: [Medication Templates]
 *     summary: Obtener categorías de medicamentos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/categories', authenticateUser(), controller.getCategories);

/**
 * @openapi
 * /medication-templates/{code}:
 *   get:
 *     tags: [Medication Templates]
 *     summary: Obtener template por código
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template encontrado
 *       404:
 *         description: Template no encontrado
 */
router.get('/:code', authenticateUser(), controller.getTemplateByCode);

export default router;
