import { Either, isLeft, right } from 'fp-ts/lib/Either';
import { userAccountCreated, userAccountCreationFailed } from '../logEvents';
import * as repo from './repo';
import { NewUser, ResponseUser, UserRegistrationError } from './types';

export default function userHandler(env) {
    return {
        signUpUser: async (
            signUpDetails: NewUser,
        ): Promise<Either<UserRegistrationError, ResponseUser>> => {
            const result = await repo.saveUser(signUpDetails);
            if (isLeft(result)) {
                userAccountCreationFailed({
                    phoneNumber: signUpDetails.phoneNumber,
                    reason: result.left,
                });
                return result;
            }

            userAccountCreated({
                id: result.right,
                phoneNumber: signUpDetails.phoneNumber,
            });
            return right(result.right);
        },
    };
}
