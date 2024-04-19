import * as Faker from 'faker';
import * as _ from 'ramda';

export function fakeUser(options) {
    const user = {
        firstName: Faker.name.firstName(),
        lastName: Faker.name.lastName(),
        email: Faker.internet.email(),
        password: Faker.internet.password(),
    };
    return _.mergeRight(user, options);
}
