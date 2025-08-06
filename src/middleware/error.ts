import { NextFunction, Request, Response } from "express";

import { HttpException } from "../exceptions/root";
import { ZodError } from "zod";

export const errorMiddleware = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.statusCode).json({
        message: err.message,
        //stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        ErrorCode: err.errorCode,
        errors: err.errors

    });
}



// src/utils/error.utils.ts

/**
 * Custom application error class that extends the built-in Error
 * Allows for consistent error handling with status codes
 */

// AppError.ts
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: Record<string, string>;

    /**
     * Creates a new AppError
     * @param message - Error message
     * @param statusCode - HTTP status code (defaults to 500)
     * @param isOperational - Whether this is an operational error (defaults to true)
     * @param errors - Optional error details object
     */
    constructor(message: string, statusCode = 500, isOperational = true, errors?: Record<string, string>) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        // Set the prototype explicitly
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Global error handler for Express applications
 */
export const globalErrorHandler = (err: any, req: any, res: any, next: any): void => {
    // Default error values
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';

    // Distinguish between operational errors (expected) and programming errors (unexpected)
    const isOperational = err instanceof AppError ? err.isOperational : false;

    // In production, don't expose error details for non-operational errors
    const isDevelopment = process.env.NODE_ENV === 'development';
    const responseBody = {
        status: 'error',
        message: isOperational || isDevelopment ? message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    };

    // Log error for debugging (you might want to use a proper logging service in production)
    console.error(`[Error] ${err.message}`, {
        stack: err.stack,
        statusCode,
        isOperational
    });

    res.status(statusCode).json(responseBody);
};

/**
 * Async error handler wrapper to avoid try-catch blocks in route handlers
 * @param fn - Async function to wrap
 */
export const catchAsync = (fn: Function) => {
    return (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            errors: err.errors
        });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: err.issues.map((error) => ({
                field: error.path.join('.'),
                message: error.message
            }))
        });
    }

    // Default error
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};