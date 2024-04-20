import { expect } from 'chai';
import { isRight } from 'fp-ts/lib/These';
import * as userRepo from '../../src/user/repo';
import * as F from '../env/factories';
import { getTestEnv } from '../env/testEnvironment';
import { addContacts } from '../../src/phonebook/repo';

describe('Search contacts', async () => {
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
            userId = userIdResponse.right.userId;
        }
    });

    it('user should be able to search contacts', async () => {
        const loginResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: user.password,
            },
        });
        expect(loginResponse.statusCode).to.eql(200);
        expect(loginResponse.result)
            .to.be.an('object')
            .that.has.all.keys('authToken', 'userId');

        const authToken = loginResponse.result.authToken;

        const response = await testEnv.server.inject({
            method: 'get',
            url: `/phonebook/search/number?query=${user.phoneNumber}`,
            headers: {
                authorization: authToken,
            },
        });
        expect(response.statusCode).to.eql(200);
        expect(response.result.data[0].number).to.eql(user.phoneNumber);
    });

    it('user should be able to search contacts by name', async () => {
        const loginResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: user.password,
            },
        });
        expect(loginResponse.statusCode).to.eql(200);
        expect(loginResponse.result)
            .to.be.an('object')
            .that.has.all.keys('authToken', 'userId');

        const authToken = loginResponse.result.authToken;

        const response = await testEnv.server.inject({
            method: 'get',
            url: `/phonebook/search/number?query=${user.name}`,
            headers: {
                authorization: authToken,
            },
        });
        expect(response.statusCode).to.eql(200);
        expect(response.result.data[0].number).to.eql(user.phoneNumber);
    });

    it('user should be able to search contacts by partial name', async () => {
        const loginResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: user.password,
            },
        });
        expect(loginResponse.statusCode).to.eql(200);
        expect(loginResponse.result)
            .to.be.an('object')
            .that.has.all.keys('authToken', 'userId');

        const authToken = loginResponse.result.authToken;

        const partialNumber = user.name.slice(0, 3);
        const response = await testEnv.server.inject({
            method: 'get',
            url: `/phonebook/search/number?query=${partialNumber}`,
            headers: {
                authorization: authToken,
            },
        });
        expect(response.statusCode).to.eql(200);
        expect(response.result.data[0].number).to.eql(user.phoneNumber);
    });

    it('user should be able to search contacts by partial number', async () => {
        const loginResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: user.password,
            },
        });
        expect(loginResponse.statusCode).to.eql(200);
        expect(loginResponse.result)
            .to.be.an('object')
            .that.has.all.keys('authToken', 'userId');

        const authToken = loginResponse.result.authToken;

        const partialNumber = user.phoneNumber.slice(0, 3);
        const response = await testEnv.server.inject({
            method: 'get',
            url: `/phonebook/search/number?query=${partialNumber}`,
            headers: {
                authorization: authToken,
            },
        });
        expect(response.statusCode).to.eql(200);
        expect(response.result.data[0].number).to.eql(user.phoneNumber);
    });

    it('user should be able see contact details', async () => {
        const loginResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: user.password,
            },
        });
        expect(loginResponse.statusCode).to.eql(200);
        expect(loginResponse.result)
            .to.be.an('object')
            .that.has.all.keys('authToken', 'userId');

        const authToken = loginResponse.result.authToken;

        const partialNumber = user.phoneNumber.slice(0, 3);
        const searchResponse = await testEnv.server.inject({
            method: 'get',
            url: `/phonebook/search/number?query=${partialNumber}`,
            headers: {
                authorization: authToken,
            },
        });
        expect(searchResponse.statusCode).to.eql(200);
        expect(searchResponse.result.data[0].number).to.eql(user.phoneNumber);

        const { registered_contact_user_id, phone_id } =
            searchResponse.result.data[0];

        const response = await testEnv.server.inject({
            method: 'post',
            url: '/phonebook/contact-details',
            payload: {
                phoneId: phone_id,
                registeredContactUserId: registered_contact_user_id,
            },
            headers: {
                authorization: authToken,
            },
        });
        expect(response.statusCode).to.eql(200);
    });

    it('user should be able see email if registered user has user in his contact list', async () => {
        //register new user
        const user2 = F.fakeUser({});
        const userIdResponse2 = await userRepo.saveUser(user2);
        let userId2;

        if (isRight(userIdResponse2)) {
            userId2 = userIdResponse2.right.userId;
        }

        //login with old user credentials
        const loginResponse = await testEnv.server.inject({
            method: 'post',
            url: '/auth/login',
            payload: {
                phoneNumber: user.phoneNumber,
                password: user.password,
            },
        });
        expect(loginResponse.statusCode).to.eql(200);
        expect(loginResponse.result)
            .to.be.an('object')
            .that.has.all.keys('authToken', 'userId');

        const authToken = loginResponse.result.authToken;

        const contactDetails = {
            contact: {
                contactName: user.name,
                phoneNumber: user.phoneNumber,
            },
            userId: userId2,
        };

        // adding contact of new user into contact list of old user
        const contactResp = await addContacts(contactDetails);

        // search new user
        const searchResponse = await testEnv.server.inject({
            method: 'get',
            url: `/phonebook/search/number?query=${user2.phoneNumber}`,
            headers: {
                authorization: authToken,
            },
        });
        expect(searchResponse.statusCode).to.eql(200);
        expect(searchResponse.result.data[0].number).to.eql(user2.phoneNumber);

        const { registered_contact_user_id, phone_id } =
            searchResponse.result.data[0];

        // get new user details
        const response = await testEnv.server.inject({
            method: 'post',
            url: '/phonebook/contact-details',
            payload: {
                phoneId: phone_id,
                registeredContactUserId: registered_contact_user_id,
            },
            headers: {
                authorization: authToken,
            },
        });
        expect(response.statusCode).to.eql(200);
        expect(response.result.data.number).to.eql(user2.phoneNumber);
        expect(response.result.data.email).to.eql(user2.email);
    });
});
