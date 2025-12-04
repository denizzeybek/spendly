/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterRequest = {
    email: string;
    password: string;
    name: string;
    /**
     * Name for new home
     */
    homeName?: string;
    /**
     * Code to join existing home
     */
    homeCode?: string;
};

