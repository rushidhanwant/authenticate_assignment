import Bcrypt from 'bcrypt';
import { Either, left, right } from 'fp-ts/lib/Either';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import _ from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import * as userRepo from '../user/repo';
import * as repo from './repo';
import { LoginDetails, LoginError, LoginResponse } from './types';

const getUserToken = async (jwtSecret, user) => {
    const sessionId = uuidv4();
    await repo.saveSession(sessionId);

    const jwtToken = jwt.sign(
        { userId: user.id, scope: 'user', sessionId: sessionId },
        jwtSecret,
    );
    return jwtToken;
};

export default function authenticationHandler(env) {
    return {
        login: async (
            loginDetails: LoginDetails,
        ): Promise<Either<LoginError, LoginResponse>> => {
            const user = await userRepo.getUserByEmail(loginDetails.email);
            if (_.isNil(user)) {
                return left('Invalid-credentials');
            }

            const match = await Bcrypt.compare(
                loginDetails.password,
                user.password,
            );
            if (!match) {
                return left('Invalid-credentials');
            }

            const jwtToken = await getUserToken(env.config.JWT_SECRET, user);

            return right({ authToken: jwtToken, userId: user.id });
        },


        getUserToken: (user) => getUserToken(env.config.JWT_SECRET, user),

        validateJWTToken: async (credentials, request, h) => {
            const currentSession = await repo.getSessionById(
                credentials.sessionId,
            );
            if (_.isNil(currentSession)) {
                return { isValid: false };
            }
            return { isValid: true };
        },

        logout: async (sessionId) => {
            await repo.deleteSession(sessionId);
        },
    };
}
