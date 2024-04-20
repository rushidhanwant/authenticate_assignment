import _ from 'ramda';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';
import db from '../db';
import {
    ContactDetails,
    ContactIds,
    ContactInfoWithEmail,
    Ids,
    PhoneNumberSchema,
    SearchResponse,
    SpamCount,
    SpamDetails,
    SpamError,
    UserSchema,
    contactInfo,
    searchQuery,
} from './types';
import { markSpamFailed, searchContactFailed } from '../logEvents';
import { getUserByPhoneNumber } from '../user/repo';

const phoneNumberTableName = 'phone_numbers';
const spamDetailsTableName = 'spam_details';
const contactsTableName = 'contacts';
const userTableName = 'users';

export const markNumberSpam = async (
    spamData: SpamDetails,
): Promise<Either<SpamError, SpamCount>> => {
    try {
        const trx = await db.transaction();

        const phoneResp = await trx(phoneNumberTableName)
            .update({ spam_count: spamData.spamCount })
            .where({ number: spamData.phoneNumber })
            .returning('spam_count')
            .then((rows) => rows[0]);

        if (_.isNil(phoneResp)) {
            trx.rollback();
            return left('errorInSavingPhoneNumber');
        }

        const spamResp = await trx(spamDetailsTableName)
            .insert({
                user_id: spamData.userId,
                phone_id: spamData.phoneId,
            })
            .returning('id');

        if (_.isNil(spamResp)) {
            trx.rollback();
            return left('errorInAddingSpamInfo');
        }

        trx.commit();
        return right({ spam_count: phoneResp });
    } catch (err) {
        markSpamFailed(err);
        return left('unExpectedError');
    }
};

export const getNumberDetails = async (
    phoneNumber: string,
): Promise<PhoneNumberSchema> => {
    return await db(phoneNumberTableName)
        .select('*')
        .where({ number: phoneNumber })
        .first();
};

export const checkIfNumberExists = async (
    phoneNumber: string,
): Promise<boolean> => {
    const number = await db(phoneNumberTableName)
        .select('*')
        .where({ number: phoneNumber })
        .first();
    if (_.isNil(number)) {
        return false;
    }
    return true;
};

export const addPhoneNumber = async (phoneNumber: string) => {
    return db(phoneNumberTableName)
        .insert({ number: phoneNumber })
        .returning('*')
        .then((rows) => rows[0]);
};

export const checkIfNumberMarkedSpam = async (ids: Ids) => {
    return db(spamDetailsTableName)
        .select('*')
        .where({ user_id: ids.userId, phone_id: ids.phoneId })
        .first();
};

export const checkIfNumberisOfRegisteredUser = async (
    phoneNumber: string,
): Promise<Either<SpamError, UserSchema>> => {
    try {
        const user = await getUserByPhoneNumber(phoneNumber);
        if (_.isNil(user)) {
            return left('numberIsNotOfRegisteredUser');
        }
        const respObj: UserSchema = {
            phone_id: user.phone_id,
            email: user.email,
            name: user.name,
            number: user.number,
            spam_count: user.spam_count,
            registered_contact_user_id: user.id,
        };
        return right(respObj);
    } catch (err) {
        return left('unExpectedError');
    }
};

export const fetchContactBy = async (
    phoneNumber: string,
): Promise<Either<SpamError, UserSchema>> => {
    try {
        const user = await getUserByPhoneNumber(phoneNumber);
        if (_.isNil(user)) {
            return left('numberIsNotOfRegisteredUser');
        }
        const respObj: UserSchema = {
            phone_id: user.phone_id,
            email: user.email,
            name: user.name,
            number: user.number,
            spam_count: user.spam_count,
            registered_contact_user_id: user.id,
        };
        return right(respObj);
    } catch (err) {
        return left('unExpectedError');
    }
};

export const addContacts = async (contactDetails: ContactDetails) => {
    try {
        const userId = contactDetails.userId;
        const contact = contactDetails.contact;
        const numberExist = await checkIfNumberExists(contact.phoneNumber);
        let phoneRespId: number = 0;

        if (numberExist) {
            phoneRespId = (await getNumberDetails(contact.phoneNumber)).id;
        } else {
            phoneRespId = await db(phoneNumberTableName)
                .insert({
                    number: contact.phoneNumber,
                })
                .returning('id')
                .then((rows) => rows[0]);
            if (_.isNil(phoneRespId)) {
                return left('errorInSavingPhoneNumber');
            }
        }

        const contactResp = await db(contactsTableName)
            .insert({
                user_id: userId,
                phone_id: phoneRespId,
                contact_name: contact.contactName,
            })
            .returning('id')
            .then((rows) => rows[0]);

        if (_.isNil(contactResp)) {
            return left('errorInAddingContactInfo');
        }

        return right({ contactId: contactResp });
    } catch (err) {
        markSpamFailed(err);
        return left('unExpectedError');
    }
};

export const fetchContacts = async (
    serchQuery: searchQuery,
): Promise<Either<SpamError, SearchResponse>> => {
    const { query, userId } = serchQuery;
    const lowerCaseQuery = query.toLowerCase();
    try {
        const resp = await db
            .select('*')
            .from(phoneNumberTableName)
            .rightJoin(
                contactsTableName,
                `${phoneNumberTableName}.id`,
                '=',
                `${contactsTableName}.phone_id`,
            )
            .whereRaw('lower("number") like ?', [`%${lowerCaseQuery}%`])
            .orWhereRaw('lower("contact_name") like ?', [`%${lowerCaseQuery}%`])
            .orderByRaw(
                `
            CASE 
            WHEN lower("number") LIKE '${lowerCaseQuery}%' THEN 1
            WHEN lower("contact_name") LIKE '${lowerCaseQuery}%' THEN 1
            ELSE 2
            END
        `,
            )
            .orderByRaw('lower("number")')
            .orderByRaw('lower("contact_name")')
            .then((rows) =>
                rows.map((row) => {
                    return {
                        number: row.number,
                        spam_count: row.spam_count,
                        phone_id: row.phone_id,
                        registered_contact_user_id: row.user_id, // registered contact user id
                        name: row.contact_name,
                    };
                }),
            );
        return right(resp);
    } catch (err) {
        searchContactFailed(err);
        return left('unExpectedError');
    }
};

export const fetchContactDetails = async (
    contactId: ContactIds,
): Promise<Either<SpamError, contactInfo>> => {
    try {
        const contactResp = await db(phoneNumberTableName)
            .join(
                contactsTableName,
                `${phoneNumberTableName}.id`,
                '=',
                `${contactsTableName}.phone_id`,
            )
            .select('*')
            .where({
                user_id: contactId.registeredContactUserId,
                phone_id: contactId.phoneId,
            })
            .first();
        const respObj = {
            number: contactResp.number,
            spam_count: contactResp.spam_count,
            name: contactResp.contact_name,
        };
        return right(respObj);
    } catch (err) {
        return left('unExpectedError');
    }
};

export const checkIfNumberInContactList = async (
    registeredUserId: number,
    contactNumber: String,
): Promise<Either<SpamError, ContactInfoWithEmail>> => {
    try {
        const contactResp = await db(phoneNumberTableName)
            .join(
                contactsTableName,
                `${phoneNumberTableName}.id`,
                '=',
                `${contactsTableName}.phone_id`,
            )
            .join(
                userTableName,
                `${contactsTableName}.user_id`,
                '=',
                `${userTableName}.id`,
            )
            .select('*')
            .where({ user_id: registeredUserId, number: contactNumber })
            .first();

        const respObj = {
            number: contactResp.number,
            spam_count: contactResp.spam_count,
            name: contactResp.contact_name,
            email: contactResp.email,
        };
        if (_.isEmpty(contactResp)) {
            return left('numberIsNotInContactList');
        }
        return right(respObj);
    } catch (err) {
        return left('unExpectedError');
    }
};
