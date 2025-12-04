/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonthlySummary = {
    month?: number;
    year?: number;
    totalIncome?: number;
    totalExpense?: number;
    balance?: number;
    byCategory?: Array<{
        categoryId?: string;
        categoryName?: string;
        categoryIcon?: string;
        categoryColor?: string;
        total?: number;
        percentage?: number;
    }>;
};

