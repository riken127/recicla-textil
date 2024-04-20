const express = require('express');
const router = express.Router();
const generator = require('../utils/fakeDataGenerator');
const User = require('../models/user/User');

async function returnUsersDashboard(req, res, next) {
    try {
        Promise.all([createdAtInOrderOfMonth(),
                            percentagePerCountry(),
                            percentagePerLanguage(),
                            roleDistribution(),
                            titleDistribution(),
                            leafsPerCountry()]).then((values => {
                                res.render("dashboards/users", {data : values});
        }));
    } catch (error) {
        console.error('Error fetching aggregation data:', error);
        res.status(500).send('Error fetching aggregation data');
    }
}
const createdAtInOrderOfMonth = async () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate, // Start of the month 12 months ago
                    $lte: new Date() // Up to now
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" }, // Group by month
                totalUsers: { $sum: 1 } // Count users for each month
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id",
                totalUsers: 1
            }
        },
        {
            $sort: {
                month: 1 // Sort by month ascending
            }
        }
    ]);
}
    const percentagePerCountry = async () => {
        try {
            // Group users by country and count the number of users per country
            const result = await User.aggregate([
                {
                    $group: {
                        _id: "$address.country",
                        count: { $sum: 1 }
                    }
                },
                {
                    // Calculate the total number of users
                    $group: {
                        _id: null,
                        totalUsers: { $sum: "$count" },
                        countries: { $push: { country: "$_id", count: "$count" } }
                    }
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
                                            { $divide: ["$$country.count", "$totalUsers"] },
                                            100
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            ]);

            return result[0].countries;
        } catch (error) {
            console.error("Error calculating percentage per country:", error);
            throw error;
        }
    };


const percentagePerLanguage = async () => {
    try {
        // Group users by language and count the number of users per language
        const result = await User.aggregate([
            {
                $group: {
                    _id: "$language",
                    count: { $sum: 1 }
                }
            },
            {
                // Calculate the total number of users
                $group: {
                    _id: null,
                    totalUsers: { $sum: "$count" },
                    languages: { $push: { language: "$_id", count: "$count" } }
                }
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
                                        { $divide: ["$$language.count", "$totalUsers"] },
                                        100
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        ]);

        return result[0].languages;
    } catch (error) {
        console.error("Error calculating percentage per language:", error);
        throw error;
    }
};


const roleDistribution = async () => {
    try {
        // Group users by role and count the number of users per role
        const result = await User.aggregate([
            {
                $group: {
                    _id: "$roles",
                    count: { $sum: 1 }
                }
            },
            {
                // Optionally, sort the result by role name
                $sort: { "_id": 1 }
            }
        ]);

        return result;
    } catch (error) {
        console.error("Error calculating role distribution:", error);
        throw error;
    }
};

    const titleDistribution = async () => {
        try {
            // Group users by title and count the number of users per title
            const result = await User.aggregate([
                {
                    $group: {
                        _id: "$title",
                        count: { $sum: 1 }
                    }
                },
                {
                    // Optionally, sort the result by title name
                    $sort: { "_id": 1 }
                }
            ]);

            return result;
        } catch (error) {
            console.error("Error calculating title distribution:", error);
            throw error;
        }
    };


    const leafsPerCountry = async()  => {
        try {
            const result = await User.aggregate([
                {
                    $group: {
                        _id: "$address.country",
                        count: { $sum : "$leafs"}
                    }
                },
                {
                    $group: {
                        _id: null,
                        countries: {
                            $push: { country: "$_id", leafs: "$count"}
                        }
                    }
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
                                    points: "$$country.leafs"
                                }
                            }
                        }
                    }
                }
            ]);

            return result;
        } catch(error) {
            console.error("Error getting leafs per country:", error);
            throw error;
        }
    }

function returnBenefactorsDashboard(req, res, next) {}

module.exports = {
    returnUsersDashboard,
    returnBenefactorsDashboard,
};