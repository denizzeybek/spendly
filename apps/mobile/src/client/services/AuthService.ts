/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user
     * @param requestBody
     * @returns any Registration successful
     * @throws ApiError
     */
    public static postApiAuthRegister(
        requestBody: {
            email: string;
            password: string;
            name: string;
            /**
             * Name for new home (creates new home)
             */
            homeName?: string;
            /**
             * Code to join existing home
             */
            homeCode?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                409: `Email already registered`,
            },
        });
    }
    /**
     * Login user
     * @param requestBody
     * @returns any Login successful
     * @throws ApiError
     */
    public static postApiAuthLogin(
        requestBody: {
            email: string;
            password: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Refresh access token
     * @param requestBody
     * @returns any Token refreshed
     * @throws ApiError
     */
    public static postApiAuthRefresh(
        requestBody: {
            refreshToken: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid refresh token`,
            },
        });
    }
    /**
     * Get current user info
     * @returns any Current user info
     * @throws ApiError
     */
    public static getApiAuthMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/me',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
