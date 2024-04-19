import * as Joi from 'joi';

export const signUpSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

export interface NewUser {
    firstName: string;
    lastName: String;
    email: string;
    password: string;
}

export type UserRegistrationError =
    | 'userAlreadyExist'
    | 'passwordHashingFailed'
    | 'stripeError';

export type UserID = Number;
