/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CreditCardsService {
    /**
     * List user's credit cards
     * @returns any Credit card list
     * @throws ApiError
     */
    public static getApiCreditCards(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/credit-cards',
        });
    }
    /**
     * Create credit card
     * @param requestBody
     * @returns any Credit card created
     * @throws ApiError
     */
    public static postApiCreditCards(
        requestBody: {
            name: string;
            /**
             * Billing/statement date (defaults to first of current month)
             */
            billingDate?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/credit-cards',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update credit card
     * @param id
     * @param requestBody
     * @returns any Credit card updated
     * @throws ApiError
     */
    public static patchApiCreditCards(
        id: string,
        requestBody: {
            name?: string;
            /**
             * Billing/statement date
             */
            billingDate?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/credit-cards/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete credit card
     * @param id
     * @returns any Credit card deleted
     * @throws ApiError
     */
    public static deleteApiCreditCards(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/credit-cards/{id}',
            path: {
                'id': id,
            },
        });
    }
}
