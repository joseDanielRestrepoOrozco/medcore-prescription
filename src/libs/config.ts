import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3005;
export const SECRET = process.env.SECRET || 'DOTTED5';
export const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
export const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3002/api/v1';
export const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || '';
export const NODE_ENV = process.env.NODE_ENV || 'development';