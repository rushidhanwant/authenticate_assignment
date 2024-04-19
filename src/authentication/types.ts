import * as Joi from 'joi';

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

export const loginWithGoogleSchema = Joi.object({
    accessToken: Joi.string().required(),
});

export interface LoginDetails {
    email: string;
    password: string;
}

export interface LoginResponse {
    authToken: string;
}

export type LoginError = 'Invalid-credentials';
