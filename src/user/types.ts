import * as Joi from 'joi';

export const signUpSchema = Joi.object({
    name: Joi.string().required(),
    phoneNumber: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required(),
    email: Joi.string().email(),
    password: Joi.string().min(8).required(),
});

export interface NewUser {
    name: string;
    phoneNumber: string;
    email?: string;
    password: string;
}

export type UserRegistrationError =
    | 'userAlreadyExist'
    | 'passwordHashingFailed'
    | 'errorInSavingPhoneNumber'
    | 'errorInCreatingUser'
    | 'unExpectedError'
    | 'errorInAddingContactInfo';

export type ResponseUser = {
    name: String;
    email: String;
    userId: Number;
};
