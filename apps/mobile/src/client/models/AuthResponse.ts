/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Home } from './Home';
import type { User } from './User';
export type AuthResponse = {
    success?: boolean;
    data?: {
        user?: User;
        home?: Home;
        accessToken?: string;
        refreshToken?: string;
    };
    message?: string;
};

