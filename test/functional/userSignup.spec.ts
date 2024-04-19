import { expect } from 'chai';
import 'mocha';
import { getTestEnv } from '../env/testEnvironment';

describe('User API', async () => {
    let testEnv;

    beforeEach(async () => {
        testEnv = await getTestEnv();
        await testEnv.resetDB();
    });

    it('sign up handles bad request', async () => {
        const newUser = {
            name: 'John',
            phoneNumber: '7739485798',
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
            name: 'John',
            phoneNumber: '7739485798',
            email: 'john.watson@gmail.com',
            password: '12345678',
        };
        const response = await testEnv.server.inject({
            method: 'post',
            url: '/user/signup',
            payload: newUser,
        });
        expect(response.statusCode).to.eql(200);
        expect(response.result.user).to.eql('John');
    });
});
