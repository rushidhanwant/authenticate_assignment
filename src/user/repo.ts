import _ from 'ramda';
import { Either, left, right, isLeft } from 'fp-ts/lib/Either';

const crypto = require('crypto');

const userTableName = 'users';
const tokensTableName = 'verification_token';
import { v4 as uuidv4 } from 'uuid';

import db from '../db';

import { NewUser, UserID, UserRegistrationError } from './types';

import addMinutes from 'date-fns/addMinutes';

import Bcrypt from 'bcrypt';

import getPath from '../files/fullPath';

function updateImagePath(user) {
    return {
        ...user,
        ...{ profilePicture: getPath(user.profilePicture) },
    };
}

export async function getUserByEmail(email: string) {
    return db(userTableName).select('*').where({ email }).first();
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
    const existingUser = await getUserByEmail(user.email);
    if (!_.isNil(existingUser)) {
        return left('userAlreadyExist');
    }

    const hashedPassword = await Bcrypt.hash(user.password, 10);

    if (!hashedPassword) {
        return left('passwordHashingFailed');
    }
    const row = await db(userTableName)
        .insert({ ...user, password: hashedPassword })
        .returning('id');
    return right(row[0]);
}
