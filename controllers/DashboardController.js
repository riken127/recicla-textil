const express = require("express");
const router = express.Router();
const generator = require("../utils/fakeDataGenerator");
const User = require("../models/user/User");
const Benefactor = require("../models/benefactor/Benefactor");
async function returnUsersDashboard(req, res, next) {
  try {
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
      res.render("dashboards/users", { data: values });
    });
  } catch (error) {
    console.error("Error fetching aggregation data:", error);
    res.status(500).send("Error fetching aggregation data");
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
                    { $divide: ["$$country.count", "$totalUsers"] },
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
                    { $divide: ["$$language.count", "$totalUsers"] },
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

const leafsPerCountry = async () => {
  try {
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
    console.error("Error getting leafs per country:", error);
    throw error;
  }
};

async function countTotalUsers() {
  try {
    return await User.countDocuments();
  } catch (error) {
    console.error("Error counting total users:", error);
    throw error;
  }
}

async function calculateTotalPoints() {
  try {
    return await User.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: "$leafs" },
        },
      },
    ]);
  } catch (error) {
    console.error("Error calculating total points:", error);
    throw error;
  }
}


async function returnBenefactorsDashboard(req, res, next) {
  try {
    Promise.all([
      pickPointsPerCity(),
      pickPointsPerCountry(),
      benefactorsPerMonth(),
      benefactorsPerCountry(),
      benefactorsPerCity(),
      benefactorsCreationsVsUpdates(),
      Benefactor.countDocuments(),
      totalPickpoints(),
      pickPointsPerCity()
    ]).then((values) => {
      res.render("dashboards/benefactors", { data: values });
    });
  } catch (error) {
    console.error("Error fetching aggregation data:", error);
    res.status(500).send("Error fetching aggregation data");
  }
}
const totalPickpoints = async () => {
  try {
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
    console.error("Error counting total pickpoints:", error);
    throw error;
  }

}
const pickPointsPerCountry = async () => {
  try {
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
    console.error("Error getting pickpoints per country:", error);
    throw error;
  }
};
const pickPointsPerCity = async () => {
  try {
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
    console.error("Error getting pickpoints per city:", error);
    throw error;
  }
};


const benefactorsPerMonth = async () => {
  try {
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
    console.error("Error getting benefactors per month:", error);
    throw error;
  }
};

const benefactorsPerCountry = async () => {
  try{
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
      { $limit: 10 }
    ]);

    return result;
  } catch (error) {
    console.error("Error getting benefactors per country:", error);
    throw error;
  }
}

const benefactorsPerCity = async () => {
  try {
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
      { $limit: 10 }
    ]);

    return result;
  } catch (error) {
    console.error("Error getting benefactors per city:", error);
    throw error;
  }

}

const benefactorsCreationsVsUpdates = async () => {
  try {
    const result = await Benefactor.aggregate([
      {
        $match: {
          $or: [
            { "createdAt": { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) } },
            { "lastUpdateAt": { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) } }
          ]
        }
      },
      {
        $project: {
          yearMonth: { $dateToString: { format: "%m", date: { $ifNull: ["$lastUpdateAt", "$createdAt"] } } },
          isUpdate: { $ne: ["$createdAt", "$lastUpdateAt"] }
        }
      },
      {
        $group: {
          _id: "$yearMonth",
          creations: { $sum: { $cond: [{ $not: "$isUpdate" }, 1, 0] } },
          updates: { $sum: { $cond: ["$isUpdate", 1, 0] } }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    return result;
  } catch(error) {
    console.error("Error getting benefactors creations vs updates:", error);
    throw error;
  }
}

module.exports = {
  returnUsersDashboard,
  returnBenefactorsDashboard,
};
