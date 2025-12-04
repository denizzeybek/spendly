/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Loan } from '../models/Loan';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LoansService {
    /**
     * List user's loans
     * @returns any Loan list
     * @throws ApiError
     */
    public static getApiLoans(): CancelablePromise<{
        success?: boolean;
        data?: Array<Loan>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/loans',
        });
    }
    /**
     * Create loan
     * @param requestBody
     * @returns any Loan created
     * @throws ApiError
     */
    public static postApiLoans(
        requestBody: {
            /**
             * Loan name (e.g., "Car Loan", "Home Mortgage")
             */
            name: string;
            /**
             * Total amount to be paid (principal + interest)
             */
            totalAmount: number;
            /**
             * Original borrowed amount
             */
            principalAmount: number;
            /**
             * Monthly installment amount
             */
            monthlyPayment: number;
            /**
             * Total number of installments
             */
            totalInstallments: number;
            /**
             * Number of already paid installments (default 0)
             */
            paidInstallments?: number;
            /**
             * First payment date
             */
            startDate: string;
            /**
             * Last payment date
             */
            endDate: string;
            /**
             * Annual interest rate (optional)
             */
            interestRate?: number;
            /**
             * Optional notes
             */
            notes?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/loans',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get loan by ID
     * @param id
     * @returns any Loan details
     * @throws ApiError
     */
    public static getApiLoans1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/loans/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Loan not found`,
            },
        });
    }
    /**
     * Update loan
     * @param id
     * @param requestBody
     * @returns any Loan updated
     * @throws ApiError
     */
    public static patchApiLoans(
        id: string,
        requestBody: {
            name?: string;
            totalAmount?: number;
            principalAmount?: number;
            monthlyPayment?: number;
            totalInstallments?: number;
            paidInstallments?: number;
            startDate?: string;
            interestRate?: number;
            notes?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/loans/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete loan
     * @param id
     * @returns any Loan deleted
     * @throws ApiError
     */
    public static deleteApiLoans(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/loans/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mark installment(s) as paid
     * @param id
     * @param requestBody
     * @returns any Installment marked as paid
     * @throws ApiError
     */
    public static postApiLoansPay(
        id: string,
        requestBody?: {
            /**
             * Number of installments to mark as paid (default 1)
             */
            count?: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/loans/{id}/pay',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
