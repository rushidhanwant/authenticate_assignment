import _ from 'ramda';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';
import db from '../db';
import {  PhoneNumberSchema, SpamCount, SpamDetails, SpamError } from './types';
import { markSpamFailed } from '../logEvents';

const phoneNumberTableName = 'phone_numbers';
const spamDetailsTableName = 'spam_details';



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

export const getNumberDetails = async (number: string) : Promise<PhoneNumberSchema> => {
    return db(phoneNumberTableName).select('*').where({number: number}).first();
}

export const addPhoneNumber = async (number: string) => {
    return db(phoneNumberTableName).insert({number: number}).returning('*').then((rows) => rows[0]);
}
