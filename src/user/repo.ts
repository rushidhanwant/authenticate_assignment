import _ from 'ramda';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';

const userTableName = 'users';
const phoneNumberTableName = 'phone_numbers';

import db from '../db';

import { NewUser, UserID, UserRegistrationError } from './types';

import Bcrypt from 'bcrypt';

export async function getUserByEmail(email: string) {
    return db(userTableName).select('*').where({ email }).first();
}

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

export async function getUserPasswordByUserId(userId) {
    return db(userTableName).select('*').where({ id: userId }).first();
}

export async function updateUserDetails(userId, newDetails) {
    return db(userTableName)
        .update({ ...newDetails })
        .where({ id: userId });
}

export async function saveUser(
    user: NewUser,
): Promise<Either<UserRegistrationError, UserID>> {
    // check if user already exists by phone number
    try {
        const existingUser = await getUserByPhoneNumber(user.phoneNumber);
        if (!_.isNil(existingUser)) {
            return left('userAlreadyExist');
        }

        const trx = await db.transaction();

        const hashedPassword = await Bcrypt.hash(user.password, 10);

        if (!hashedPassword) {
            return left('passwordHashingFailed');
        }

        const phoneResp = await trx(phoneNumberTableName)
            .insert({ number: user.phoneNumber })
            .returning('id');

        if (_.isNil(phoneResp)) {
            trx.rollback();
            return left('errorInSavingPhoneNumber');
        }

        const userResp = await trx(userTableName)
            .insert({
                name: user.name,
                email: user.email,
                phone_id: phoneResp[0],
                password: hashedPassword,
            })
            .returning('name');

        if (_.isNil(userResp)) {
            trx.rollback();
            return left('errorInCreatingUser');
        }

        trx.commit();
        return right(userResp[0]);
    } catch (error) {
        return left('unExpectedError');
    }
}
