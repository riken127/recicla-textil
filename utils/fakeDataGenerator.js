const { faker} = require('@faker-js/faker');

async function returnUserData(numUsers) {
    try {
        const users = [];
        for (let i = 0; i < numUsers; i++) {
            const fakeUserData = {
                lastName: faker.person.lastName(),
                firstName: faker.person.firstName(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                roles: [faker.helpers.arrayElement(['administrator', 'employee', 'user', 'moderator'])],
                address: {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    postalCode: faker.location.zipCode(),
                    country: faker.location.country()
                },
                phone: faker.phone.number('+351#########'),
                leafs: faker.datatype.number({min: 1, max: 100000000}),
                language: faker.helpers.arrayElement(['English', 'Spanish', 'French', 'German']),
                title: [faker.helpers.arrayElement(['rookie', 'novice', 'master', 'king', 'caregiver'])],
                notify: faker.datatype.boolean()
            };
            users.push(fakeUserData);
        }
        return users;
    } catch (error) {
        throw new Error('Failed to generate fake users: ' + error.message);
    }
}

module.exports = {
    returnUserData
};
