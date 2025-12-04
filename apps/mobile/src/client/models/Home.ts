/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Home = {
    id?: string;
    code?: string;
    name?: string;
    currency?: Home.currency;
    ownerId?: string;
    createdAt?: string;
    updatedAt?: string;
};
export namespace Home {
    export enum currency {
        TRY = 'TRY',
        USD = 'USD',
        EUR = 'EUR',
    }
}

