import * as Joi from 'joi';

export const loginSchema = Joi.object({
    phoneNumber: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required(),
    password: Joi.string().min(8).required(),
});

export const loginWithGoogleSchema = Joi.object({
    accessToken: Joi.string().required(),
});

export interface LoginDetails {
    phoneNumber: string;
    password: string;
}

export interface LoginResponse {
    authToken: string;
}

export type LoginError = 'Invalid-credentials';
