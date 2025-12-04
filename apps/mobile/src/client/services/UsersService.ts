/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get current user
     * @returns any User details
     * @throws ApiError
     */
    public static getApiUsersMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me',
        });
    }
    /**
     * Update current user
     * @param requestBody
     * @returns any User updated
     * @throws ApiError
     */
    public static patchApiUsersMe(
        requestBody?: {
            name?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/users/me',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get current user's monthly summary
     * @param month
     * @param year
     * @returns any User monthly summary
     * @throws ApiError
     */
    public static getApiUsersMeSummary(
        month?: number,
        year?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me/summary',
            query: {
                'month': month,
                'year': year,
            },
        });
    }
}
