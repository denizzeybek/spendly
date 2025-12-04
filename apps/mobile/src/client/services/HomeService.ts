/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HomeService {
    /**
     * Get current user's home
     * @returns any Home details
     * @throws ApiError
     */
    public static getApiHome(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/home',
        });
    }
    /**
     * Update home (owner only)
     * @param requestBody
     * @returns any Home updated
     * @throws ApiError
     */
    public static patchApiHome(
        requestBody?: {
            name?: string;
            currency?: 'TRY' | 'USD' | 'EUR';
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/home',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get home users
     * @returns any List of home users
     * @throws ApiError
     */
    public static getApiHomeUsers(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/home/users',
        });
    }
    /**
     * Get monthly summary for home
     * @param month
     * @param year
     * @returns any Monthly summary
     * @throws ApiError
     */
    public static getApiHomeSummary(
        month?: number,
        year?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/home/summary',
            query: {
                'month': month,
                'year': year,
            },
        });
    }
}
