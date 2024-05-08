const {faker} = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

async function returnUserData(numUsers) {
    try {
        const users = [];
        for (let i = 0; i < numUsers; i++) {
            const fakeUserData = {
                lastName: faker.person.lastName(),
                firstName: faker.person.firstName(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: bcrypt.hashSync(faker.internet.password(), 10),
                image: "",
                roles: [faker.helpers.arrayElement(['administrator', 'employee', 'user', 'moderator'])],
                address: {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    postalCode: faker.location.zipCode(),
                    country: faker.location.country()
                },
                phone: faker.phone.number('+351#########'),
                leafs: faker.datatype.number({min: 1, max: 9000}),
                language: "Portuguese", // Assuming you want all users to have the same language
                title: [faker.helpers.arrayElement(['rookie', 'novice', 'master', 'king', 'caregiver'])],
                notify: true,
            };
            users.push(fakeUserData);
        }
        return users;
    } catch (error) {
        throw new Error('Failed to generate fake users: ' + error.message);
    }
}

async function returnBenefactorsData(numBenefactors) {
    try {
        const benefactors = [];
        for (let i = 0; i < numBenefactors; i++) {
            const numPickpoints = faker.datatype.number({min: 1, max: 9}); // Random number of pickpoints between 1 and 5
            const pickpoints = [];
            for (let j = 0; j < numPickpoints; j++) {
                const pickpoint = {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    postalCode: faker.location.zipCode(),
                    country: faker.location.country()
                };
                pickpoints.push(pickpoint);
            }

            const fakeBenefactorData = {
                name: faker.company.name(),
                address: {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    postalCode: faker.location.zipCode(),
                    country: faker.location.country()
                },
                username: faker.internet.userName(),
                password: faker.internet.password(),
                email: faker.internet.email(),
                phone: faker.phone.number('+351#########'),
                pickpoints: pickpoints
            };

            benefactors.push(fakeBenefactorData);
        }
        return benefactors;
    } catch (error) {
        console.error('Error generating benefactor data:', error);
        throw error;
    }
}

module.exports = {
    returnUserData,
    returnBenefactorsData
};
