import * as Faker from 'faker';
import * as _ from 'ramda';

export function fakeUser(options) {
    const user = {
        name: Faker.name.firstName() + ' ' + Faker.name.lastName(),
        phoneNumber: Faker.phone
            .phoneNumberFormat()
            .replace('-', '')
            .replace('-', ''),
        email: Faker.internet.email(),
        password: Faker.internet.password(),
    };
    return _.mergeRight(user, options);
}
