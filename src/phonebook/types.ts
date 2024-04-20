import * as Joi from 'joi';

export const spamSchema = Joi.object({
    phoneNumber: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required(),
    spam: Joi.boolean().required(),
});

export const contactDetailsSchema = Joi.object({
    registeredContactUserId: Joi.number().required(),
    phoneId: Joi.number().required(),
});

export const searchQuerySchema = Joi.object({
    query: Joi.string().required(),
});

export interface ContactIds {
    registeredContactUserId: number;
    phoneId: number;
}
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
    | 'numberIsNotOfRegisteredUser'
    | 'numberIsNotInContactList';

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
};
export interface ContactDetails {
    contact: Contact;
    userId: Number;
}

export interface Ids {
    userId: Number;
    phoneId: Number;
}

export interface searchQuery {
    query: string;
    userId: Number;
}

export interface SearchData {
    number: String;
    spam_count: Number;
    phone_id: Number;
    name: String;
    registered_contact_user_id: Number;
}

export interface UserSchema extends SearchData {
    email: String;
}

export type SearchResponse = SearchData[];

export interface contactInfo {
    number: String;
    spam_count: Number;
    name: String;
}

export interface ContactInfoWithEmail extends contactInfo {
    email?: String;
}
