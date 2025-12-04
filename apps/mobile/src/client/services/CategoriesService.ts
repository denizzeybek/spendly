/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CategoriesService {
    /**
     * List categories
     * @param type
     * @returns any Category list
     * @throws ApiError
     */
    public static getApiCategories(
        type?: 'INCOME' | 'EXPENSE' | 'BOTH',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/categories',
            query: {
                'type': type,
            },
        });
    }
    /**
     * Create custom category
     * @param requestBody
     * @returns any Category created
     * @throws ApiError
     */
    public static postApiCategories(
        requestBody: {
            name: string;
            icon: string;
            color: string;
            type: 'INCOME' | 'EXPENSE' | 'BOTH';
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/categories',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update category
     * @param id
     * @param requestBody
     * @returns any Category updated
     * @throws ApiError
     */
    public static patchApiCategories(
        id: string,
        requestBody: {
            name?: string;
            icon?: string;
            color?: string;
            type?: 'INCOME' | 'EXPENSE' | 'BOTH';
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete custom category
     * @param id
     * @returns any Category deleted
     * @throws ApiError
     */
    public static deleteApiCategories(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
        });
    }
}
