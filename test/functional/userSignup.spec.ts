import { expect } from 'chai';
import 'mocha';
import sinon from 'sinon';
import { getTestEnv } from '../env/testEnvironment';

describe('User API', async () => {
    let testEnv;

    beforeEach(async () => {
        testEnv = await getTestEnv();
        await testEnv.resetDB();
        sinon.restore();
    });

    it('sign up handles bad request', async () => {
        const newUser = {
            firstName: 'John',
            lastName: 'Watson',
        };

        const response = await testEnv.server.inject({
            method: 'post',
            url: '/user/signup',
            payload: newUser,
        });
        expect(response.statusCode).to.eql(400);
    });

    it('user should able to sign up', async () => {
        const newUser = {
            firstName: 'John',
            lastName: 'Watson',
            email: 'john.watson@gmail.com',
            password: '12345678',
        };
        const response = await testEnv.server.inject({
            method: 'post',
            url: '/user/signup',
            payload: newUser,
        });
        expect(response.statusCode).to.eql(200);
    });
});
