import { expect } from 'chai';
import { isRight } from 'fp-ts/lib/These';
import * as userRepo from '../../src/user/repo';
import * as F from '../env/factories';
import { getTestEnv } from '../env/testEnvironment';

describe('Spam', async () => {
    let testEnv;
    let data;
    let user;
    let userId;

    beforeEach(async () => {
        testEnv = await getTestEnv();
        await testEnv.resetDB();
        user = data = F.fakeUser({});
        const userIdResponse = await userRepo.saveUser(user);
        if (isRight(userIdResponse)) {
            userId = userIdResponse.right;
        }
    });

    it('unregistered user should not be able to mark a number spam', async () => {
        const response = await testEnv.server.inject({
            method: 'post',
            url: '/phonebook/number/markspam',
            payload: {
                phoneNumber: data.phoneNumber,
                spam: true,
            },
        });
        expect(response.statusCode).to.eql(401);
    });

    it.only('registered user should be able to mark a number spam', async () => {

        const loginResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: user.password,
            },
        });
        expect(loginResponse.statusCode).to.eql(200);
        expect(loginResponse.result).to.be.an('object').that.has.all.keys('authToken', 'userId');

        const authToken = loginResponse.result.authToken;

        const response = await testEnv.server.inject({
            method: 'post',
            url: '/phonebook/number/markspam',
            headers: {
                authorization: authToken,
            },
            payload: {
                phoneNumber: data.phoneNumber,
                spam: true,
            },
        });
        expect(response.statusCode).to.eql(200);
    });
});
