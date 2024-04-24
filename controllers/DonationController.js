const multer = require("../middleware/multerMiddleware");
const Donation = require("../models/user/UserActivity");
const User = require("../models/user/User");
const Benefactor = require("../models/benefactor/Benefactor");
const Address = require("../models/Address");
const fs = require("fs");
const objectMapper = require("../utils/objectMapper");
const {json} = require("express");

/**
 * Renders the table of users.
 *
 * This function queries the database to retrieve a page of users,
 * then renders a table view using the retrieved users data.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/all', userController.renderUsersTable);
 */
function renderDonationsTable(req, res, next) {
    // Extracts the page number from the request body or defaults to 1
    const page = req.body.page || 1;
    // Query the database for donations, skipping the appropriate number of documents based on the page number,
    // and limiting the results to 10 donations per page
    Donation.find({activityType: "donation"})
        .skip((page - 1) * 10)
        .limit(10)
        .exec()
        .then(async (donations) => {
            // Fetch all users
            const users = await User.find();
            const benefactors = await Benefactor.find();
            // Renders the "donations/table" view with the retrieved donations data and users
            res.render("donations/table", {
                donations: donations,
                users: users,
                benefactors: benefactors
            });
        })
        .catch((err) => {
            // If an error occurs during the database query or rendering, respond with a JSON error message
            res.json({
                message: err.message,
                type: "danger",
            });
        });
}

/**
 * Retrieves all users with DataTables parameters.
 *
 * This function retrieves all users from the database while considering DataTables parameters
 * such as pagination, sorting, and searching. It constructs MongoDB queries based on the parameters
 * and returns the users data in a format suitable for DataTables.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/add', userController.addUser)
 */
async function getAllDonations(req, res, next) {
    // Retrieve the total number of records in the database
    const totalRecords = await getTotalCount({});

    // Retrieve DataTables parameters from the request
    const {draw, start, length, order, columns} = req.body;
    const search = req.body['search[value]'];

    // Determine the sorting parameters
    if (typeof order === "undefined") {
        var attribute_name = 'userId'; // Default sorting column
        var column_sort_order = 'desc'; // Default sorting order
    } else {
        var column_index = req.query.order?.[0]?.['column'];
        var column_name = req.query.columns?.[column_index]?.['data'];
        var column_sort_order = req.query.order?.[0]?.['dir'];
    }

    // Determine the search value
    var search_value = search;

    // Construct the MongoDB query based on the search value
    const query = {activityType: "donation"};

    if (search_value) {
        query['$text'] = {$search: search_value};
    }

    // Construct sorting options
    const sortOptions = {};
    if (column_name) {
        sortOptions[column_name] = column_sort_order === 'asc' ? 1 : -1;
    } else {
        sortOptions['userId'] = column_sort_order === 'asc' ? 1 : -1;
    }

    // Query the database for users
    Donation.find(query)
        .sort(sortOptions)
        .skip(parseInt(start))
        .limit(parseInt(length))
        .exec()
        .then((donations) => {
            // Respond with DataTables formatted data
            res.json({
                draw: parseInt(draw),
                recordsTotal: totalRecords,
                recordsFiltered: totalRecords,
                data: donations,
            });
        })
        .catch((err) => {
            // Handle errors
            res.status(500).json({
                error: err.message,
            });
        });
}

/**
 * Retrieves the total count of users based on a query.
 *
 * This function retrieves the total count of users from the database
 * based on the provided MongoDB query.
 *
 * @param {Object} query - The MongoDB query object.
 * @returns {Promise<number>} The total count of users.
 */
async function getTotalCount(query) {
    try {
        // Count the documents in the 'User' collection that match the provided query
        const count = await Donation.countDocuments(query);
        return count;
    } catch (err) {
        // If an error occurs during the counting process, throw the error
        throw err;
    }
}

/**
 * Retrieves a user by ID.
 *
 * This function retrieves a user from the database by their ID,
 * which is typically passed as a route parameter. It then sends
 * the user data as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/:id', userController.getUser);
 */
function getDonation(req, res, next) {
    // Extract the user ID from the route parameters
    const donationId = req.params.userId; // Assuming the user ID is passed as a route parameter

    // Find the user in the database by their ID
    Donation.findById(donationId)
        .then((donation) => {
            // If the user is not found, respond with a 404 error
            if (!donation) {
                return res.status(404).json({message: "Donation not found"});
            }

            // Send the user data as JSON response
            res.json(donation);
        })
        .catch((err) => {
            // If an error occurs during the retrieval process, log the error
            console.error("Error retrieving donation:", err);
            // Respond with a 500 error
            res.status(500).json({message: "Internal Server Error"});
        });
}

/**
 * Adds a new user to the database.
 *
 * This function adds a new user to the database based on the data
 * provided in the request body. It creates a new user object with
 * default values for optional fields if they are not provided, then
 * saves the user to the database. If successful, it redirects to the
 * "/all" route. If an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/add', userController.addUser);
 */
function addDonation(req, res, next) {
    // Extract user data from the request body
    const donationData = req.body;
    // Create a new user object with default values for optional fields
    let donation = new Donation({
        userId: donationData.userId,
        activityType: donationData.activityType,
        timestamp: donationData.timestamp,
        details: donationData.details,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    });

    // Save the new user to the database
    donation.save()
        .then((savedDonation) => {
            // Set a success message in the session
            req.session.message = {
                type: "success",
                message: "Donation added successfully",
            };
            // Redirect to the "/all" route
            res.redirect("/all");
        })
        .catch((err) => {
            // If an error occurs during the save process, respond with a JSON error message
            res.json({
                message: err.message,
                type: "danger"
            });
        });
}


/**
 * Deletes a donation from the database.
 *
 * This function deletes a donation from the database based on the donation ID
 * provided in the request body. It uses `Donation.findByIdAndDelete()` to
 * delete the donation document. If the donation document contains an image, it
 * assumes that it's stored in the file system and deletes the image file
 * using the 'fs' module. If successful, it responds with a JSON success
 * message. If an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/delete', donationController.deleteDonation);
 */
async function deleteDonation(req, res, next) {
    try {
        // Extract the donation ID from the request body.
        const id = req.body.id;

        // Delete the donation from the database using the donation ID.
        const result = await Donation.findByIdAndDelete(id);

        // If the deletion is successful and donation document contains an image
        if (result && result.image) {
            // Delete the image file from the file system.
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                // Log any errors that occur during file deletion.
                console.error(err);
            }
        }

        // Respond with a JSON success message.
        res.status(200).json({
            message: "Donation deleted successfully",
            type: "success",
        });
    } catch (err) {
        // If an error occurs during the deletion process, respond with a JSON error message.
        res.status(500).json({
            message: err.message,
            type: "danger",
        });
    }
}

module.exports = {
    renderDonationsTable: renderDonationsTable,
    getDonation: getDonation,
    getAllDonations: getAllDonations,
    addDonation: addDonation,
    deleteDonation: deleteDonation
};
