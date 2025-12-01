import { type Request, type Response } from 'express';

export default function unknownEndpoint(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Unknown endpoint' });
}
