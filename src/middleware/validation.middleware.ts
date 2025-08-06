// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './error';

/**
 * Middleware to validate request body, query, and params against provided schema
 * @param schema - Zod validation schema
 */
export const validateRequest = (schema: { body?: z.ZodTypeAny; query?: z.ZodTypeAny; params?: z.ZodTypeAny }) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('Incoming request body:', JSON.stringify(req.body, null, 2));
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.query) {
                await schema.query.parseAsync(req.query);
            }
            if (schema.params) {
                await schema.params.parseAsync(req.params);
            }
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Change 'error.errors' to 'error.issues'
                console.log('Validation errors:', JSON.stringify(error.issues, null, 2));

                const errorDetails: Record<string, string> = {};

                // Change 'error.errors' to 'error.issues'
                error.issues.forEach((err) => {
                    const key = err.path.join('.');
                    errorDetails[key] = err.message;
                });

                return next(new AppError('Validation error', 400, true, errorDetails));
            }
            next(error);
        }
    };
};