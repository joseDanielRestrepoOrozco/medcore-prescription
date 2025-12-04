import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/v1/medication-templates
 * Obtiene todos los templates de medicamentos
 */
export async function getAllTemplates(req: Request, res: Response) {
  try {
    const { category, search } = req.query;

    const where: any = { isActive: true };

    if (category && typeof category === 'string') {
      where.category = category;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.medicationTemplate.findMany({
      where,
      orderBy: { category: 'asc' },
    });

    return res.json({
      templates,
      total: templates.length,
    });
  } catch (err: any) {
    console.error('[medication-templates.getAll] error', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * GET /api/v1/medication-templates/:code
 * Obtiene un template específico por código
 */
export async function getTemplateByCode(req: Request, res: Response) {
  try {
    const { code } = req.params;

    const template = await prisma.medicationTemplate.findUnique({
      where: { code },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template no encontrado' });
    }

    return res.json(template);
  } catch (err: any) {
    console.error('[medication-templates.getByCode] error', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * GET /api/v1/medication-templates/categories
 * Obtiene lista de categorías únicas
 */
export async function getCategories(_req: Request, res: Response) {
  try {
    const templates = await prisma.medicationTemplate.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    const categories = templates.map((t) => t.category).sort();

    return res.json({ categories });
  } catch (err: any) {
    console.error('[medication-templates.getCategories] error', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
