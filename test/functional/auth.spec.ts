import { expect } from 'chai';
import { isRight } from 'fp-ts/lib/These';
import * as userRepo from '../../src/user/repo';
import * as F from '../env/factories';
import { getTestEnv } from '../env/testEnvironment';

describe('Auth', async () => {
    let testEnv;
    let user;
    let userId;

    beforeEach(async () => {
        testEnv = await getTestEnv();
        await testEnv.resetDB();
        user = F.fakeUser({});
        const userIdResponse = await userRepo.saveUser(user);
        if (isRight(userIdResponse)) {
            userId = userIdResponse.right;
        }
    });

    it('login should return 401 if invalid credentials', async () => {
        const response = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: 'a' + user.phoneNumber,
                password: user.password,
            },
        });
        expect(response.statusCode).to.eql(400);

        const invalidPasswordResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: 'a' + user.password,
            },
        });
        expect(invalidPasswordResponse.statusCode).to.eql(401);
    });

    it('login should return 200', async () => {
        const response = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: user.password,
            },
        });
        expect(response.statusCode).to.eql(200);
    });

    it('logout expires the session', async () => {
        const noAuthTokenResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/logout',
        });
        expect(noAuthTokenResponse.statusCode).to.eql(401);

        const invalidAuthTokenResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/logout',
            headers: { Authorization: 'invalidToken' },
        });
        expect(invalidAuthTokenResponse.statusCode).to.eql(401);

        const response = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: user.password,
            },
        });
        expect(response.statusCode).to.eql(200);

        const authToken = response.result.authToken;

        const logOutResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/logout',
            headers: { Authorization: authToken },
        });

        expect(logOutResponse.statusCode).to.eql(200);

        const afterLogOutResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/logout',
            headers: { Authorization: authToken },
        });

        expect(afterLogOutResponse.statusCode).to.eql(401);
    });
});
