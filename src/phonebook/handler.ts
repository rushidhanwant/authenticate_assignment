import { Either, isLeft, right, left } from 'fp-ts/lib/Either';
import { markSpamFailed } from '../logEvents';
import * as _ from 'ramda';
import * as repo from './repo';
import {
    SpamData,
    SpamCount,
    Error,
    SpamDetails,
    PhoneNumberSchema,
    Ids,
    searchQuery,
    SearchResponse,
    ContactIds,
    contactInfo,
    ContactInfoWithEmail,
} from './types';

export const checkIfNumberExists = async (number: string): Promise<boolean> => {
    const numberDetails = await repo.getNumberDetails(number);
    if (_.isNil(numberDetails)) {
        return false;
    }
    return true;
};

export const getOrAddPhoneNumber = async (
    number: string,
): Promise<PhoneNumberSchema> => {
    const numberExist = await checkIfNumberExists(number);

    let newPhoneNumber: PhoneNumberSchema;
    if (!numberExist) {
        newPhoneNumber = await repo.addPhoneNumber(number);
    } else {
        newPhoneNumber = await repo.getNumberDetails(number);
    }
    return newPhoneNumber;
};

export const incrementSpamCount = async (
    spamData: SpamData,
): Promise<number> => {
    const numberDetails = await repo.getNumberDetails(spamData.phoneNumber);
    if (spamData.spam) {
        return numberDetails.spam_count + 1;
    }
    return numberDetails.spam_count;
};

export const checkIfNumberisAlreadyMarkedByUser = async (
    info: Ids,
): Promise<boolean> => {
    const resp = await repo.checkIfNumberMarkedSpam(info);
    if (_.isNil(resp)) {
        return false;
    }
    return true;
};

export const checkIfNumberIsOfRegisteredUser = async (
    info: Ids,
): Promise<boolean> => {
    const resp = await repo.checkIfNumberMarkedSpam(info);
    if (_.isNil(resp)) {
        return false;
    }
    return true;
};

export const markNumberSpam = async (
    spamData: SpamData,
): Promise<Either<Error, SpamCount>> => {
    try {
        const numberDetails = await getOrAddPhoneNumber(spamData.phoneNumber);
        const isNumberMarkedSpam = await checkIfNumberisAlreadyMarkedByUser({
            userId: spamData.userId,
            phoneId: numberDetails.id,
        });

        if (isNumberMarkedSpam) {
            return left('alreadyMarkedSpam');
        }

        const spamCount = await incrementSpamCount(spamData);

        const spamDetails: SpamDetails = {
            phoneId: numberDetails.id,
            phoneNumber: spamData.phoneNumber,
            userId: spamData.userId,
            spamCount: spamCount,
        };

        const spamResponse = await repo.markNumberSpam(spamDetails);

        if (isLeft(spamResponse)) {
            return spamResponse;
        }

        return right(spamResponse.right);
    } catch (err: any) {
        markSpamFailed(err);
        return left('unExpectedError');
    }
};

export const searchContact = async (
    serchQuery: searchQuery,
): Promise<Either<Error, SearchResponse>> => {
    const regexp = new RegExp('^[0-9]+$');
    const ifValidNumber =
        serchQuery.query.length == 10 &&
        regexp.test(serchQuery.query as string);
        
    if (ifValidNumber) {
        const user = await repo.checkIfNumberisOfRegisteredUser(
            serchQuery.query as string,
        );
        
        if (!isLeft(user)) {
            const { email, ...restData } = user.right;
            return right([restData]);
        }
    }
    const contacts = await repo.fetchContacts(serchQuery);
    if (isLeft(contacts)) {
        return contacts;
    }
    return contacts;
};

export const getContactDetails = async (
    contactDetails: ContactIds,
    userId: number,
): Promise<Either<Error, ContactInfoWithEmail>> => {
    const contactResp = await repo.fetchContactDetails(contactDetails);

    if (isLeft(contactResp)) {
        return contactResp;
    }

    const user = await repo.checkIfNumberisOfRegisteredUser(
        contactResp.right.number as string,
    );

    if (isLeft(user)) {
        return contactResp;
    }
    const { registered_contact_user_id, number } = user.right;

    const data = await repo.checkIfNumberInContactList(
        registered_contact_user_id as number,
        number,
    );

    if (isLeft(data)) {
        return contactResp;
    }
    return data;
};
