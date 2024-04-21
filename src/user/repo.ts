import _ from 'ramda';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';

const userTableName = 'users';
const phoneNumberTableName = 'phone_numbers';
const contactsTableName = 'contacts';

import db from '../db';

import { NewUser, ResponseUser, UserRegistrationError } from './types';

import Bcrypt from 'bcrypt';

export async function getUserByPhoneNumber(number: string) {
    return db(phoneNumberTableName)
        .join(
            userTableName,
            `${phoneNumberTableName}.id`,
            '=',
            `${userTableName}.phone_id`,
        )
        .select('*')
        .where({ number: number })
        .first();
}

export async function getPhoneNumberDetails(number: string) {
    return db(phoneNumberTableName)
        .select('*')
        .where({ number: number })
        .first();
}

export async function saveUser(
    user: NewUser,
): Promise<Either<UserRegistrationError, ResponseUser>> {
    try {
        // check if user already exists by phone number
        const existingUser = await getUserByPhoneNumber(user.phoneNumber);
        if (!_.isNil(existingUser)) {
            return left('userAlreadyExist');
        }

        let phoneResp;

        // check if phone number already exists
        phoneResp = await getPhoneNumberDetails(user.phoneNumber);

        const trx = await db.transaction();

        const hashedPassword = await Bcrypt.hash(user.password, 10);

        if (!hashedPassword) {
            return left('passwordHashingFailed');
        }

        if (_.isNil(phoneResp)) {
            phoneResp = await trx(phoneNumberTableName)
                .insert({ number: user.phoneNumber })
                .returning('*')
                .then((rows) => rows[0]);

            if (_.isNil(phoneResp)) {
                trx.rollback();
                return left('errorInSavingPhoneNumber');
            }
        }

        const userResp = await trx(userTableName)
            .insert({
                name: user.name,
                email: user.email,
                phone_id: phoneResp.id,
                password: hashedPassword,
            })
            .returning('*')
            .then((rows) => rows[0]);

        if (_.isNil(userResp)) {
            trx.rollback();
            return left('errorInCreatingUser');
        }

        const contactResp = await trx(contactsTableName)
            .insert({
                user_id: userResp.id,
                phone_id: phoneResp.id,
                contact_name: user.name,
            })
            .returning('id')
            .then((rows) => rows[0]);

        if (_.isNil(contactResp)) {
            return left('errorInAddingContactInfo');
        }

        trx.commit();
        return right({
            name: userResp.name,
            email: userResp.email,
            userId: userResp.id,
        });
    } catch (error) {
        return left('unExpectedError');
    }
}
