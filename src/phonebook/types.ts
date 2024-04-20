import * as Joi from 'joi';

export const spamSchema = Joi.object({
    phoneNumber: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required(),
    spam: Joi.boolean().required(),
});

export interface SpamData {
    phoneNumber: string;
    spam: string;
    userId: number;
}

export interface SpamDetails {
    phoneNumber: string;
    spamCount: number;
    userId: number;
    phoneId: number;
}

export type SpamError = 
| 'unExpectedError'
| 'errorInSavingPhoneNumber'
| 'errorInAddingSpamInfo'
| 'alreadyMarkedSpam'
;

export type Response = String;
export type SpamCount = {
    spam_count: number;
};

export interface PhoneNumberSchema {
    id: number;
    created_at: string;
    updated_at: string;
    number: number;
    spam_count: number;
}

export type Contact = {
    contactName: string;
    phoneNumber: string;
}
export interface ContactDetails{
    contact : Contact;
    userId: Number;
}

export interface Ids{
    userId: Number;
    phoneId: Number;
}