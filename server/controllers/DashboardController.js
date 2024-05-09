const User = require("../models/user/User");
const Benefactor = require("../models/benefactor/Benefactor");
const UserActivity = require("../models/user/UserActivity");

/**
 * Fetches and returns user dashboard data.
 *
 * This function fetches data for the user dashboard by calling several other functions concurrently using Promise.all.
 * These functions are expected to return Promises that resolve with the required data. The data fetched includes:
 * - User creation dates in order of month
 * - Percentage of users per country
 * - Percentage of users per language
 * - Role distribution of users
 * - Title distribution of users
 * - Number of 'leafs' per country
 * - Total number of users
 * - Total points calculated
 *
 * Once all the data is fetched, it is passed to the 'dashboards/users' view to be rendered and sent to the client.
 * If any error occurs during this process, an error message is logged to the console and a 500 status code is sent to the client.
 *
 * @param {Object} req - The HTTP request object, containing user information.
 * @param {Object} res - The HTTP response object, used to send the response back to the client.
 * @param {Function} next - The next middleware function in the Express.js routing process.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/users', dashboardController.returnUsersDashboard);
 */
async function returnUsersDashboard(req, res, next) {
    try {
        // Fetch all the data needed for the users dashboard
        Promise.all([
            createdAtInOrderOfMonth(),
            percentagePerCountry(),
            percentagePerLanguage(),
            roleDistribution(),
            titleDistribution(),
            leafsPerCountry(),
            countTotalUsers(),
            calculateTotalPoints(),
        ]).then((values) => {
            // Render the users dashboard with the fetched data
            res.render("dashboards/users", {
                data: values,
                currentRoute: "/dashboard/users",
                username: req.user.username,
                pfp: req.user.image,
            });
        });
    } catch (error) {
        console.error("Error fetching aggregation data:", error);
        res.status(500).send("Error fetching aggregation data");
    }
}

/**
 * Fetches the number of users created in each of the last 12 months.
 *
 * This function creates a start date exactly one year from the current date, then uses MongoDB's aggregation pipeline
 * to fetch the number of users created in each month from the start date to the current date. The users are grouped by
 * the month of their creation date, and the total number of users created in each month is calculated.
 *
 * The result is an array of objects, each containing the month number (1-12) and the total number of users created in that month.
 * The array is sorted in ascending order by month number.
 *
 * @returns {Promise<Array>} - A promise that resolves with an array of objects, each containing a month number and the total number of users created in that month.
 */
const createdAtInOrderOfMonth = async () => {
    // Get the start date for the query
    const startDate = new Date();
    // Subtract 1 year from the current date
    startDate.setFullYear(startDate.getFullYear() - 1);
    // Set the day to the first day of the month
    startDate.setDate(1);
    // Set the time to 00:00:00
    startDate.setHours(0, 0, 0, 0);
    // Aggregate users by month
    return User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate, // Start of the month 12 months ago
                    $lte: new Date(), // Up to now
                },
            },
        },
        {
            $group: {
                _id: { $month: "$createdAt" }, // Group by month
                totalUsers: { $sum: 1 }, // Count users for each month
            },
        },
        {
            $project: {
                _id: 0,
                month: "$_id",
                totalUsers: 1,
            },
        },
        {
            $sort: {
                month: 1, // Sort by month ascending
            },
        },
    ]);
};

/**
 * Fetches the percentage of users per country.
 *
 * This function uses MongoDB's aggregation pipeline to group users by their country and count the number of users per country.
 * It then calculates the total number of users and the percentage of users per country.
 *
 * The result is an array of objects, each containing a country name and the percentage of users from that country.
 * The array is sorted in descending order by the percentage of users, and only the top 10 countries are included.
 *
 * If an error occurs during this process, it is logged to the console and rethrown.
 *
 * @returns {Promise<Array>} - A promise that resolves with an array of objects, each containing a country name and the percentage of users from that country.
 * @throws {Error} - If an error occurs during the aggregation process.
 */
const percentagePerCountry = async () => {
    try {
        // Group users by country and count the number of users per country
        const result = await User.aggregate([
            {
                $group: {
                    _id: "$address.country",
                    count: { $sum: 1 },
                },
            },
            {
                // Calculate the total number of users
                $group: {
                    _id: null,
                    totalUsers: { $sum: "$count" },
                    countries: { $push: { country: "$_id", count: "$count" } },
                },
            },
            {
                // Calculate the percentage of users per country
                $project: {
                    _id: 0,
                    countries: {
                        $map: {
                            input: "$countries",
                            as: "country",
                            in: {
                                country: "$$country.country",
                                percentage: {
                                    $multiply: [
                                        {
                                            $divide: [
                                                "$$country.count",
                                                "$totalUsers",
                                            ],
                                        },
                                        100,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            { $unwind: "$countries" },
            { $sort: { "countries.percentage": -1 } },
            { $limit: 10 },
            {
                $group: {
                    _id: null,
                    countries: { $push: "$countries" },
                },
            },
        ]);
        return result[0].countries;
    } catch (error) {
        // Log and throw the error
        console.error("Error calculating percentage per country:", error);
        throw error;
    }
};

/**
 * Fetches the percentage of users per language.
 *
 * This function uses MongoDB's aggregation pipeline to group users by their language and count the number of users per language.
 * It then calculates the total number of users and the percentage of users per language.
 *
 * The result is an array of objects, each containing a language and the percentage of users that speak that language.
 * The array is sorted in descending order by the percentage of users, and only the top 10 languages are included.
 *
 * If an error occurs during this process, it is logged to the console and rethrown.
 *
 * @returns {Promise<Array>} - A promise that resolves with an array of objects, each containing a language and the percentage of users that speak that language.
 * @throws {Error} - If an error occurs during the aggregation process.
 */
const percentagePerLanguage = async () => {
    try {
        // Group users by language and count the number of users per language
        const result = await User.aggregate([
            {
                $group: {
                    _id: "$language",
                    count: { $sum: 1 },
                },
            },
            {
                // Calculate the total number of users
                $group: {
                    _id: null,
                    totalUsers: { $sum: "$count" },
                    languages: { $push: { language: "$_id", count: "$count" } },
                },
            },
            {
                // Calculate the percentage of users per language
                $project: {
                    _id: 0,
                    languages: {
                        $map: {
                            input: "$languages",
                            as: "language",
                            in: {
                                language: "$$language.language",
                                percentage: {
                                    $multiply: [
                                        {
                                            $divide: [
                                                "$$language.count",
                                                "$totalUsers",
                                            ],
                                        },
                                        100,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            { $unwind: "$languages" },
            { $sort: { "languages.percentage": -1 } },
            { $limit: 10 },
            {
                $group: {
                    _id: null,
                    languages: { $push: "$languages" },
                },
            },
        ]);
        return result[0].languages;
    } catch (error) {
        // Log and throw the error
        console.error("Error calculating percentage per language:", error);
        throw error;
    }
};

/**
 * Fetches the distribution of users per role.
 *
 * This function uses MongoDB's aggregation pipeline to group users by their role and count the number of users per role.
 * The result is an array of objects, each containing a role and the number of users with that role.
 * The array is sorted in ascending order by role.
 *
 * If an error occurs during this process, it is logged to the console and rethrown.
 *
 * @returns {Promise<Array>} - A promise that resolves with an array of objects, each containing a role and the number of users with that role.
 * @throws {Error} - If an error occurs during the aggregation process.
 */
const roleDistribution = async () => {
    try {
        // Group users by role and count the number of users per role
        const result = await User.aggregate([
            {
                $group: {
                    _id: "$roles",
                    count: { $sum: 1 },
                },
            },
            {
                // Optionally, sort the result by role name
                $sort: { _id: 1 },
            },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error calculating role distribution:", error);
        throw error;
    }
};

/**
 * Fetches the distribution of users per title.
 *
 * This function uses MongoDB's aggregation pipeline to group users by their title and count the number of users per title.
 * The result is an array of objects, each containing a title and the number of users with that title.
 * The array is sorted in ascending order by title.
 *
 * If an error occurs during this process, it is logged to the console and rethrown.
 *
 * @returns {Promise<Array>} - A promise that resolves with an array of objects, each containing a title and the number of users with that title.
 * @throws {Error} - If an error occurs during the aggregation process.
 */
const titleDistribution = async () => {
    try {
        // Group users by title and count the number of users per title
        const result = await User.aggregate([
            {
                $group: {
                    _id: "$title",
                    count: { $sum: 1 },
                },
            },
            {
                // Optionally, sort the result by title name
                $sort: { _id: 1 },
            },
        ]);

        return result;
    } catch (error) {
        console.error("Error calculating title distribution:", error);
        throw error;
    }
};

/**
 * Fetches the sum of leafs per country.
 *
 * This function uses MongoDB's aggregation pipeline to group users by their country and sum the number of leafs per country.
 * The result is an array of objects, each containing a country and the sum of leafs for that country.
 * The array is sorted in descending order by the sum of leafs, and only the top 10 countries are included.
 *
 * If an error occurs during this process, it is logged to the console and rethrown.
 *
 * @returns {Promise<Array>} - A promise that resolves with an array of objects, each containing a country and the sum of leafs for that country.
 * @throws {Error} - If an error occurs during the aggregation process.
 */
const leafsPerCountry = async () => {
    try {
        // Group users by country and sum the number of leafs per country
        const result = await User.aggregate([
            {
                $group: {
                    _id: "$address.country",
                    count: { $sum: "$leafs" },
                },
            },
            {
                $group: {
                    _id: null,
                    countries: {
                        $push: { country: "$_id", leafs: "$count" },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    countries: {
                        $map: {
                            input: "$countries",
                            as: "country",
                            in: {
                                country: "$$country.country",
                                points: "$$country.leafs",
                            },
                        },
                    },
                },
            },
            { $unwind: "$countries" },
            { $sort: { "countries.points": -1 } },
            { $limit: 10 },
            {
                $group: {
                    _id: null,
                    countries: {
                        $push: "$countries",
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    countries: 1,
                },
            },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting leafs per country:", error);
        throw error;
    }
};

/**
 * Counts the total number of users.
 *
 * This function uses MongoDB's countDocuments function to count the total number of users.
 *
 * If an error occurs during this process, it is logged to the console and rethrown.
 *
 * @returns {Promise<Number>} - A promise that resolves with the total number of users.
 * @throws {Error} - If an error occurs during the counting process.
 */
async function countTotalUsers() {
    try {
        // Count the total number of users
        return await User.countDocuments();
    } catch (error) {
        // Log and throw the error
        console.error("Error counting total users:", error);
        throw error;
    }
}

/**
 * Calculates the total number of leafs.
 *
 * This function uses MongoDB's aggregation pipeline to calculate the total number of leafs.
 *
 * If an error occurs during this process, it is logged to the console and rethrown.
 *
 * @returns {Promise<Number>} - A promise that resolves with the total number of leafs.
 * @throws {Error} - If an error occurs during the aggregation process.
 */
async function calculateTotalPoints() {
    try {
        // Calculate the total number of leafs
        return await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalPoints: { $sum: "$leafs" },
                },
            },
        ]);
    } catch (error) {
        // Log and throw the error
        console.error("Error calculating total points:", error);
        throw error;
    }
}

/**
 * Fetches all the data needed for the benefactors dashboard and renders the dashboard.
 *
 * This function uses Promise.all to fetch all the data needed for the benefactors dashboard in parallel.
 * The data includes points per city, points per country, benefactors per month, benefactors per country, benefactors per city, benefactors creations vs updates, total number of benefactors, total pickpoints, and points per city.
 * Once all the data is fetched, it renders the benefactors dashboard with the fetched data, the current route, the username of the logged in user, and the image of the logged in user.
 *
 * If an error occurs during this process, it is logged to the console, the response status is set to 500, and an error message is sent.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} - If an error occurs during the data fetching process.
 * @example
 * // Usage:
 * app.get('/benefactors', returnBenefactorsDashboard);
 */
async function returnBenefactorsDashboard(req, res, next) {
    try {
        // Fetch all the data needed for the benefactors dashboard
        Promise.all([
            pickPointsPerCity(),
            pickPointsPerCountry(),
            benefactorsPerMonth(),
            benefactorsPerCountry(),
            benefactorsPerCity(),
            benefactorsCreationsVsUpdates(),
            Benefactor.countDocuments(),
            totalPickpoints(),
            pickPointsPerCity(),
        ]).then((values) => {
            res.render("dashboards/benefactors", {
                data: values,
                currentRoute: "/dashboard/benefactors",
                username: req.user.username,
                pfp: req.user.image,
            });
        });
    } catch (error) {
        // Log and throw the error
        console.error("Error fetching aggregation data:", error);
        res.status(500).send("Error fetching aggregation data");
    }
}

/**
 * totalPickpoints
 *
 * This asynchronous function counts the total number of pickpoints in the `Benefactor` collection.
 * It uses MongoDB's aggregation framework, specifically the `$unwind` operator to deconstruct an array field from the input documents and output one document for each element.
 * Each output document replaces the array with an element value. Then it groups all documents and sums them up.
 *
 * @returns {Promise<Array>} An array containing a single object with the total number of pickpoints.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const totalPickpoints = async () => {
    try {
        // Count the total number of pickpoints
        return await Benefactor.aggregate([
            {
                $unwind: "$pickpoints",
            },
            {
                $group: {
                    _id: null,
                    totalPickpoints: { $sum: 1 },
                },
            },
        ]);
    } catch (error) {
        // Log and throw the error
        console.error("Error counting total pickpoints:", error);
        throw error;
    }
};

/**
 * pickPointsPerCountry
 *
 * This asynchronous function groups benefactors by country and counts the number of pickpoints per country.
 * It uses MongoDB's aggregation framework, specifically the `$unwind` operator to deconstruct an array field from the input documents and output one document for each element.
 * Then it groups by the `pickpoints.country` field and sums them up. The result is sorted in descending order and limited to the top 10.
 *
 * @returns {Promise<Array>} An array of objects, each representing a country and the total number of pickpoints in that country.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const pickPointsPerCountry = async () => {
    try {
        // Group benefactors by country and count the number of pickpoints per country
        const result = await Benefactor.aggregate([
            {
                $unwind: "$pickpoints",
            },
            {
                $group: {
                    _id: "$pickpoints.country",
                    totalPickpoints: { $sum: 1 },
                },
            },
            {
                $sort: { totalPickpoints: -1 },
            },
            { $limit: 10 },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting pickpoints per country:", error);
        throw error;
    }
};

/**
 * pickPointsPerCity
 *
 * This asynchronous function groups benefactors by city and counts the number of pickpoints per city.
 * It uses MongoDB's aggregation framework, specifically the `$unwind` operator to deconstruct an array field from the input documents and output one document for each element.
 * Then it groups by the `pickpoints.city` field and sums them up. The result is sorted in descending order and limited to the top 10.
 *
 * @returns {Promise<Array>} An array of objects, each representing a city and the total number of pickpoints in that city.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const pickPointsPerCity = async () => {
    try {
        // Group benefactors by city and count the number of pickpoints per city
        const result = await Benefactor.aggregate([
            {
                $unwind: "$pickpoints",
            },
            {
                $group: {
                    _id: "$pickpoints.city",
                    totalPickpoints: { $sum: 1 },
                },
            },
            {
                $sort: { totalPickpoints: -1 },
            },
            { $limit: 10 },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting pickpoints per city:", error);
        throw error;
    }
};
/**
 * benefactorsPerMonth
 *
 * This asynchronous function aggregates benefactors by month.
 * It filters documents where `createdAt` is greater than or equal to one year ago, groups by the month of `createdAt`, and counts the number of documents in each group.
 * The result is sorted in ascending order and limited to the last 12 months.
 *
 * @returns {Promise<Array>} An array of objects, each representing a month and the number of benefactors in that month.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const benefactorsPerMonth = async () => {
    try {
        // Aggregate benefactors by month
        const result = await Benefactor.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(
                            new Date().setFullYear(new Date().getFullYear() - 1)
                        ),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%m", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
            { $limit: 12 },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting benefactors per month:", error);
        throw error;
    }
};

/**
 * benefactorsPerCountry
 *
 * This asynchronous function groups and counts benefactors by country.
 * It groups by the `address.country` field and counts the number of documents in each group.
 * The result is sorted in descending order and limited to the top 10.
 *
 * @returns {Promise<Array>} An array of objects, each representing a country and the number of benefactors in that country.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const benefactorsPerCountry = async () => {
    try {
        // Group and count benefactors by country
        const result = await Benefactor.aggregate([
            {
                $group: {
                    _id: "$address.country",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            { $limit: 10 },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting benefactors per country:", error);
        throw error;
    }
};

/**
 * benefactorsPerCity
 *
 * This asynchronous function groups and counts benefactors by city.
 * It groups by the `address.city` field and counts the number of documents in each group.
 * The result is sorted in descending order and limited to the top 10.
 *
 * @returns {Promise<Array>} An array of objects, each representing a city and the number of benefactors in that city.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const benefactorsPerCity = async () => {
    try {
        // Group and count benefactors by city
        const result = await Benefactor.aggregate([
            {
                $group: {
                    _id: "$address.city",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            { $limit: 10 },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting benefactors per city:", error);
        throw error;
    }
};

/**
 * benefactorsCreationsVsUpdates
 *
 * This asynchronous function aggregates benefactors by month and counts the number of creations and updates.
 * It filters documents where `createdAt` or `lastUpdateAt` is greater than or equal to one year ago, groups by the month of `lastUpdateAt` or `createdAt` (if `lastUpdateAt` is null), and counts the number of creations and updates in each group.
 * The result is sorted in ascending order.
 *
 * @returns {Promise<Array>} An array of objects, each representing a month and the number of creations and updates in that month.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const benefactorsCreationsVsUpdates = async () => {
    try {
        // Aggregate benefactors by month and count the number of creations and updates
        const result = await Benefactor.aggregate([
            {
                $match: {
                    $or: [
                        {
                            createdAt: {
                                $gte: new Date(
                                    new Date().setMonth(
                                        new Date().getMonth() - 12
                                    )
                                ),
                            },
                        },
                        {
                            lastUpdateAt: {
                                $gte: new Date(
                                    new Date().setMonth(
                                        new Date().getMonth() - 12
                                    )
                                ),
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    yearMonth: {
                        $dateToString: {
                            format: "%m",
                            date: { $ifNull: ["$lastUpdateAt", "$createdAt"] },
                        },
                    },
                    isUpdate: { $ne: ["$createdAt", "$lastUpdateAt"] },
                },
            },
            {
                $group: {
                    _id: "$yearMonth",
                    creations: {
                        $sum: { $cond: [{ $not: "$isUpdate" }, 1, 0] },
                    },
                    updates: { $sum: { $cond: ["$isUpdate", 1, 0] } },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting benefactors creations vs updates:", error);
        throw error;
    }
};

/**
 * usersWithMostDonations
 *
 * This asynchronous function gets the users with the most donations.
 * It groups by the `userId` field and counts the number of documents in each group. The result is sorted in descending order and limited to the top 10.
 * It then performs a lookup to get user details from the `users` collection and projects only the necessary fields.
 *
 * @returns {Promise<Array>} An array of objects, each representing a user and their total number of donations.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const usersWithMostDonations = async () => {
    try {
        // Get the users with the most donations
        const result = await UserActivity.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalDonations: { $sum: 1 },
                },
            },
            {
                $sort: { totalDonations: -1 },
            },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $project: {
                    _id: 1,
                    totalDonations: 1,
                    firstName: "$user.firstName",
                    lastName: "$user.lastName",
                    username: "$user.username",
                },
            },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting users with most donations", error);
        throw error;
    }
};

/**
 * getTotalDonations
 *
 * This asynchronous function gets the total number of donations.
 * It groups by the `activityType` field and counts the number of documents in each group. The result is sorted in descending order and limited to the top 10.
 *
 * @returns {Promise<Array>} An array of objects, each representing an activity type and the total number of donations for that type.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const getTotalDonations = async () => {
    try {
        // Get the total number of donations
        const result = await UserActivity.aggregate([
            {
                $group: {
                    _id: "$activityType",
                    totalDonations: { $sum: 1 },
                },
            },
            {
                $sort: { totalDonations: -1 },
            },
            { $limit: 10 },
        ]);
        return result;
    } catch (error) {
        console.error("Error getting total donations", error);
        throw error;
    }
};

/**
 * getDonationsPerMonth
 *
 * This asynchronous function aggregates user activities by month and counts the number of donations.
 * It groups by the month of `timestamp`, counts the number of documents in each group, sorts the result in ascending order of month, and limits the result to the last 12 months.
 *
 * @returns {Promise<Array>} An array of objects, each representing a month and the number of donations in that month.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const getDonationsPerMonth = async () => {
    try {
        // Get the number of donations per month
        const result = await UserActivity.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%m", date: "$timestamp" },
                    },
                    totalDonations: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
            { $limit: 12 },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting donations per month", error);
        throw error;
    }
};

/**
 * getTotalWeightDonated
 *
 * This asynchronous function calculates the total weight of all donations.
 * It groups all documents into a single group and sums the `totalWeight` field of the `details` subdocument.
 *
 * @returns {Promise<Array>} An array of objects, each representing the total weight of all donations.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const getTotalWeightDonated = async () => {
    try {
        // Get the total weight donated
        const result = await UserActivity.aggregate([
            {
                $group: {
                    _id: null,
                    totalWeight: { $sum: "$details.totalWeight" },
                },
            },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting total weight donated", error);
        throw error;
    }
};

/**
 * getAverageWeightPerDonation
 *
 * This asynchronous function calculates the average weight per donation.
 * It groups all documents into a single group and averages the `totalWeight` field of the `details` subdocument.
 *
 * @returns {Promise<Array>} An array of objects, each representing the average weight per donation.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const getAverageWeightPerDonation = async () => {
    try {
        // Get the average weight per donation
        const result = await UserActivity.aggregate([
            {
                $group: {
                    _id: null,
                    averageWeight: { $avg: "$details.totalWeight" },
                },
            },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting average weight per donation", error);
        throw error;
    }
};

/**
 * getMostDonatedItems
 *
 * This asynchronous function finds the most donated items.
 * It unwinds the `items` array in the `details` subdocument, groups by the `type` field of the `items` subdocument, counts the number of documents in each group, sorts the result in descending order of count, and limits the result to the top 10.
 *
 * @returns {Promise<Array>} An array of objects, each representing an item type and the number of donations of that type.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const getMostDonatedItems = async () => {
    try {
        // Get the most donated items
        const result = await UserActivity.aggregate([
            { $unwind: "$details.items" },
            {
                $group: {
                    _id: "$details.items.type",
                    totalDonations: { $sum: 1 },
                },
            },
            {
                $sort: { totalDonations: -1 },
            },
            { $limit: 10 },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting most donated items", error);
        throw error;
    }
};

/**
 * getDonationsPerBeneficiary
 *
 * This asynchronous function gets the number of donations per beneficiary.
 * It groups by the `benefactorId` field of the `details` subdocument, counts the number of documents in each group, sorts the result in descending order of count, limits the result to the top 10, and performs a lookup to get benefactor details from the `benefactors` collection.
 *
 * @returns {Promise<Array>} An array of objects, each representing a benefactor and the number of donations they have received.
 * @throws {Error} If an error occurs during the execution of the aggregation pipeline.
 */
const getDonationsPerBeneficiary = async () => {
    try {
        // Get the donations per beneficiary
        const result = await UserActivity.aggregate([
            {
                $group: {
                    _id: "$details.benefactorId",
                    totalDonations: { $sum: 1 },
                },
            },
            {
                $sort: { totalDonations: -1 },
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: "benefactors",
                    let: { benefactorId: { $toObjectId: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$benefactorId"],
                                },
                            },
                        },
                    ],
                    as: "benefactor",
                },
            },
        ]);
        return result;
    } catch (error) {
        // Log and throw the error
        console.error("Error getting donations per beneficiary", error);
        throw error;
    }
};

/**
 * returnDonationsDashboard
 *
 * This asynchronous function fetches all the data needed for the donations dashboard.
 * It calls multiple functions concurrently using Promise.all, waits for all of them to complete, and then sends the results to the client by rendering the "dashboards/donations" view.
 *
 * @param {Object} req - The request object. It contains information about the HTTP request that raised the event. In response to req.user, it provides user details.
 * @param {Object} res - The response object. It is used to send back the prepared HTTP response.
 * @param {Function} next - The next middleware function.
 * @example
 * // Usage:
 * router.get('/donations',dashboardController.returnDonationsDashboard);
 */
async function returnDonationsDashboard(req, res, next) {
    try {
        // Fetch all the data needed for the donations dashboard
        Promise.all([
            usersWithMostDonations(),
            getTotalDonations(),
            getDonationsPerMonth(),
            getTotalWeightDonated(),
            getAverageWeightPerDonation(),
            getMostDonatedItems(),
            getDonationsPerBeneficiary(),
        ]).then((values) => {
            res.render("dashboards/donations", {
                data: values,
                currentRoute: "/dashboard/donations",
                username: req.user.username,
                pfp: req.user.image,
            });
        });
    } catch (error) {
        // Log and throw the error
        console.error("Error fetching aggregation data:", error);
        res.status(500).send("Error fetching aggregation data");
    }
}

module.exports = {
    returnUsersDashboard,
    returnBenefactorsDashboard,
    returnDonationsDashboard,
};
