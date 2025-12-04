/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Category = {
    id?: string;
    name?: string;
    icon?: string;
    color?: string;
    type?: Category.type;
    isDefault?: boolean;
    homeId?: string | null;
    createdAt?: string;
};
export namespace Category {
    export enum type {
        INCOME = 'INCOME',
        EXPENSE = 'EXPENSE',
        BOTH = 'BOTH',
    }
}

