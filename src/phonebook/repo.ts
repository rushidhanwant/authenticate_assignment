import _ from 'ramda';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';
import db from '../db';
import {  ContactDetails, Ids, PhoneNumberSchema, SpamCount, SpamDetails, SpamError } from './types';
import { markSpamFailed } from '../logEvents';

const phoneNumberTableName = 'phone_numbers';
const spamDetailsTableName = 'spam_details';
const contactsTableName = 'contacts';



export  const markNumberSpam = async (spamData: SpamDetails): Promise<Either<SpamError,SpamCount>> => {
    try{
        const trx = await db.transaction();

        const phoneResp = await trx(phoneNumberTableName)
            .update({ spam_count: spamData.spamCount})
            .where({ number: spamData.phoneNumber})
            .returning('spam_count')
            .then(rows => rows[0])

        if (_.isNil(phoneResp)) {
            trx.rollback();
            return left('errorInSavingPhoneNumber');
        }

        const spamResp = await trx(spamDetailsTableName)
            .insert({
                user_id: spamData.userId,
                phone_id: spamData.phoneId
            })
            .returning('id');

        if (_.isNil(spamResp)) {
            trx.rollback();
            return left('errorInAddingSpamInfo');
        }

        trx.commit();
        return right({"spam_count":phoneResp});
    }
    catch(err) {
        markSpamFailed(err)
        return left('unExpectedError')
    }
}

export const getNumberDetails = async (phoneNumber: string) : Promise<PhoneNumberSchema> => {
    return await db(phoneNumberTableName).select('*').where({number: phoneNumber}).first();
}

export const checkIfNumberExists = async (phoneNumber: string) : Promise<boolean> => {
    const number = await db(phoneNumberTableName).select('*').where({number: phoneNumber}).first();
    if(_.isNil(number)) {
        return false;
    }
    return true;
}

export const addPhoneNumber = async (phoneNumber: string) => {
    return db(phoneNumberTableName).insert({number: phoneNumber}).returning('*').then((rows) => rows[0]);
}

export const checkIfNumberMarkedSpam = async (ids: Ids) => { 
    return db(spamDetailsTableName).select('*').where({user_id: ids.userId, phone_id: ids.phoneId}).first();
}

export const addContacts = async (contactDetails: ContactDetails) => {
    try{
        const userId = contactDetails.userId;
        const contact = contactDetails.contact;
            const numberExist = await checkIfNumberExists(contact.phoneNumber);
            let phoneRespId: number = 0;

            console.log(numberExist)

            if(numberExist){
                phoneRespId = (await getNumberDetails(contact.phoneNumber)).id;
            }
            else {
                phoneRespId = await db(phoneNumberTableName)
                    .insert({
                        number: contact.phoneNumber
                    })
                    .returning('id')
                    .then((rows) => rows[0]);
                if (_.isNil(phoneRespId)) {
                    return left('errorInSavingPhoneNumber');
                }
            }

            const contactResp =  await db(contactsTableName)
                .insert({
                    user_id: userId,
                    phone_id: phoneRespId,
                    contact_name: contact.contactName
                })
                .returning('id')
                .then((rows) => rows[0]);

            if (_.isNil(contactResp)) {
                return left('errorInAddingContactInfo');
            }

            return right({"contactId":contactResp});
    }
    catch(err) {
        markSpamFailed(err)
        return left('unExpectedError')
    }

}