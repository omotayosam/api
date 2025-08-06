import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const DEVELOPMENT = process.env.NODE_ENV === 'development';
export const TEST = process.env.NODE_ENV === 'test';

export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
export const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1440;
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/tilewa';

export const server = {
    SERVER_HOSTNAME,
    SERVER_PORT,
    POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
    POSTGRES_PORT: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    POSTGRES_USER: process.env.POSTGRES_USER || 'ayo',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
    POSTGRES_DB: process.env.POSTGRES_DB || 'latihan'
};
