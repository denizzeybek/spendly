/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Transaction } from '../models/Transaction';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransactionsService {
    /**
     * List transactions
     * @param type
     * @param categoryId
     * @param month
     * @param year
     * @param page
     * @param limit
     * @returns any Transaction list
     * @throws ApiError
     */
    public static getApiTransactions(
        type?: 'INCOME' | 'EXPENSE',
        categoryId?: string,
        month?: number,
        year?: number,
        page: number = 1,
        limit: number = 20,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transactions',
            query: {
                'type': type,
                'categoryId': categoryId,
                'month': month,
                'year': year,
                'page': page,
                'limit': limit,
            },
        });
    }
    /**
     * Create transaction
     * @param requestBody
     * @returns any Transaction created
     * @throws ApiError
     */
    public static postApiTransactions(
        requestBody: {
            type: 'INCOME' | 'EXPENSE';
            title: string;
            amount: number;
            date: string;
            categoryId: string;
            assignedCardId?: string;
            isShared?: boolean;
            isRecurring?: boolean;
            recurringDay?: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transactions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get transaction by ID
     * @param id
     * @returns any Transaction details
     * @throws ApiError
     */
    public static getApiTransactions1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transactions/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Transaction not found`,
            },
        });
    }
    /**
     * Update transaction
     * @param id
     * @param requestBody
     * @returns any Transaction updated
     * @throws ApiError
     */
    public static patchApiTransactions(
        id: string,
        requestBody?: Transaction,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/transactions/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Transaction not found`,
            },
        });
    }
    /**
     * Delete transaction
     * @param id
     * @returns any Transaction deleted
     * @throws ApiError
     */
    public static deleteApiTransactions(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/transactions/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Transaction not found`,
            },
        });
    }
}
