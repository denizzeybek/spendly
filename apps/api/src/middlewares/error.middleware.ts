import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'VALIDATION_ERROR', messages.join(', '), 400);
  }

  if (err instanceof AppError) {
    return sendError(res, err.name, err.message, err.statusCode);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'INVALID_TOKEN', 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'TOKEN_EXPIRED', 'Token expired', 401);
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return sendError(res, 'DUPLICATE_ERROR', 'Resource already exists', 409);
  }

  return sendError(
    res,
    'INTERNAL_ERROR',
    'An unexpected error occurred',
    500
  );
}
