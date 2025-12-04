/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Loan = {
    id?: string;
    name?: string;
    userId?: string;
    /**
     * Total amount to be paid (principal + interest)
     */
    totalAmount?: number;
    /**
     * Original borrowed amount
     */
    principalAmount?: number;
    /**
     * Monthly installment amount
     */
    monthlyPayment?: number;
    /**
     * Total number of installments
     */
    totalInstallments?: number;
    /**
     * Number of paid installments
     */
    paidInstallments?: number;
    /**
     * First payment date
     */
    startDate?: string;
    /**
     * Last payment date
     */
    endDate?: string;
    /**
     * Annual interest rate
     */
    interestRate?: number;
    notes?: string;
    /**
     * Remaining installments (virtual)
     */
    remainingInstallments?: number;
    /**
     * Remaining amount to pay (virtual)
     */
    remainingAmount?: number;
    /**
     * Total paid amount (virtual)
     */
    paidAmount?: number;
    /**
     * Payment progress percentage (virtual)
     */
    progressPercentage?: number;
    /**
     * Next payment date (virtual)
     */
    nextPaymentDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

