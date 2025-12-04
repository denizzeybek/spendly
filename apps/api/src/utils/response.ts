import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  error: string,
  message?: string,
  statusCode: number = 400
): Response {
  const response: ApiResponse = {
    success: false,
    error,
    message,
  };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  message?: string
): Response {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    message,
  };
  return res.status(200).json(response);
}
