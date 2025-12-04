/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Transaction = {
    id?: string;
    type?: Transaction.type;
    title?: string;
    amount?: number;
    date?: string;
    categoryId?: {
        _id?: string;
        name?: string;
        icon?: string;
        color?: string;
    };
    assignedCardId?: string | null;
    isShared?: boolean;
    isRecurring?: boolean;
    recurringDay?: number | null;
    createdById?: {
        _id?: string;
        name?: string;
    };
    homeId?: string;
    createdAt?: string;
    updatedAt?: string;
};
export namespace Transaction {
    export enum type {
        INCOME = 'INCOME',
        EXPENSE = 'EXPENSE',
    }
}

