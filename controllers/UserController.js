const multer = require("../middleware/multerMiddleware");
const User = require("../models/user/User");
const Address = require("../models/Address");
const fs = require("fs");
const objectMapper = require("../utils/objectMapper");
const {json} = require("express");
const path = require("path");
const bcrypt = require('bcrypt');
const faker = require('../utils/fakeDataGenerator');
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
function renderUsersTable(req, res, next) {
    // Extracts the page number from the request body or defaults to 1
    const page = req.body.page || 1;
    // Query the database for users, skipping the appropriate number of documents based on the page number,
    // and limiting the results to 10 users per page
    User.find()
        .skip((page - 1) * 10)
        .limit(10)
        .exec()
        .then((users) => {
            // Renders the "users/table" view with the retrieved users data
            res.render("users/table", { currentRoute: '/users/all', username: req.user.username, pfp: req.user.image });
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
async function getAllUsers(req, res, next) {
    // Retrieve the total number of records in the database
    const totalRecords = await getTotalCount({});
    // Retrieve DataTables parameters from the request
    let {draw, start, length, order, columns} = req.body;
    const search = req.body["search[value]"];
    // Determine the sorting parameters
    if (typeof order === "undefined") {
        var attribute_name = "firstName"; // Default sorting column
        var column_sort_order = "desc"; // Default sorting order
    } else {
        var column_index = req.query.order?.[0]?.["column"];
        var column_name = req.query.columns?.[column_index]?.["data"];
        var column_sort_order = req.query.order?.[0]?.["dir"];
    }

    // Determine the search value
    var search_value = search;
    // Construct the MongoDB query based on the search value
    const query = {};

    if (search_value) {
        query["$or"] = [
            {"firstName": {$regex: search_value, $options: "i"}},
            {"lastName": {$regex: search_value, $options: "i"}},
            {"username": {$regex: search_value, $options: "i"}}
        ];
    }
    console.log(query);
    // Construct sorting options
    const sortOptions = {};
    if (column_name) {
        sortOptions[column_name] = column_sort_order === "asc" ? 1 : -1;
    } else {
        sortOptions["firstName"] = column_sort_order === "asc" ? 1 : -1;
    }

    length = length !== undefined ? parseInt(length) : 10;

    User.find(query)
        .sort(sortOptions)
        .skip(parseInt(start))
        .limit(length) // No need to parse it here, as it's already an integer
        .exec()
        .then((users) => {
            // Respond with DataTables formatted data
            res.json({
                draw: parseInt(draw),
                recordsTotal: totalRecords,
                recordsFiltered: totalRecords,
                data: users,
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
        const count = await User.countDocuments(query);
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
function getUser(req, res, next) {
    // Extract the user ID from the route parameters
    const userId = req.params.id; // Assuming the user ID is passed as a route parameter

    // Find the user in the database by their ID
    User.findById(userId)
        .then((user) => {
            // If the user is not found, respond with a 404 error
            if (!user) {
                return res.status(404).json({message: "User not found"});
            }

            // Send the user data as JSON response
            res.json(user);
        })
        .catch((err) => {
            // If an error occurs during the retrieval process, log the error
            console.error("Error retrieving user:", err);
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
function addUser(req, res, next) {
    // Extract user data from the request body
    const userData = req.body;

    // Check if the provided username, email, or phone number already exist in the database
    User.findOne({ $or: [{ username: userData.username }, { email: userData.email }, { phone: userData.phone }] })
        .then((existingUser) => {
            if (existingUser) {
                // If a user with the same username, email, or phone number already exists, return an error response
                let errorMessage = "";
                if (existingUser.username === userData.username) {
                    errorMessage = "Username already exists.";
                } else if (existingUser.email === userData.email) {
                    errorMessage = "E-mail already exists.";
                } else if (existingUser.phone === userData.phone) {
                    errorMessage = "Phone number already exists.";
                }
                res.status(400).json({ message: errorMessage, type: "danger" });
            } else {
                // If no duplicate user found, proceed to save the new user
                let user = new User({
                    lastName: userData.lastName,
                    firstName: userData.firstName,
                    username: userData.username || "", // Default to empty string if not provided
                    email: userData.email || "", // Default to empty string if not provided
                    password: bcrypt.hashSync(userData.password, 10) || "", // Default to empty string if not provided
                    image: "",
                    roles: userData.roles || ["user"], // Default to "user" if roles are not provided
                    address: userData.address || {}, // Default to empty object if address is not provided
                    phone: userData.phone || "", // Default to empty string if not provided
                    language: userData.language || "", // Default to empty string if not provided
                    notify: userData.notify || false, // Default to false if notify is not provided
                });

                // Save the new user to the database
                user.save()
                    .then((savedUser) => {
                        if (req.body.image && !fs.existsSync('./uploads/users/' + savedUser._id)) {
                            fs.mkdirSync('./uploads/users/' + savedUser._id, { recursive: true });
                        }
                        res.status(200).json({
                            type: "success",
                            result: savedUser._id,
                        });
                    })
                    .catch((err) => {
                        // If an error occurs during the save process, respond with a JSON error message
                        res.status(500).json({ message: err.message, type: "danger" });
                    });
            }
        })
        .catch((err) => {
            // If an error occurs during the search process, respond with a JSON error message
            res.status(500).json({ message: err.message, type: "danger" });
        });
}



/**
 * Updates a user in the database.
 *
 * This function updates an existing user in the database based on the data
 * provided in the request body. It extracts the user ID and the update data
 * from the request, then constructs an object containing the changes. It then
 * updates the user in the database using `User.findByIdAndUpdate()`. If successful,
 * it sets a success message in the session and redirects to the "/all" route. If
 * an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/update', userController.updateUser);
 */
function updateUser(req, res, next) {
    // Extract the user ID from the request body.
    const userId = req.body.userId;

    // Object to hold the changes to be updated.
    const updateData = {};

    // Define editable user properties (excluding userId)
    const editableProperties = [
        "firstName",
        "lastName",
        "username",
        "email",
        "password",
        "roles",
        "phone",
        "language",
        "leafs",
    ];
    //updateData.password = bcrypt.hash(updateData.password, 10);
    // Loop through editable user properties
    for (const prop of editableProperties) {
        // Check if property exists in the request body and is not undefined.
        if (req.body.hasOwnProperty(prop) && req.body[prop] !== undefined) {
            // Include only properties present in request body for update.
            updateData[prop] = req.body[prop];
        }
    }
    if (updateData.password) {
        updateData.password = bcrypt.hashSync(updateData.password, 10);
    }
        // Check if leafs exists in the request body and is not undefined.
    if (req.body.hasOwnProperty("leafs") && req.body["leafs"] !== undefined) {
        // Fetch the user
        User.findById(userId)
            .then(user => {
                // Add the new points to the current leafs
                user.leafs += req.body["leafs"];

                // Add the updated leafs to updateData
                updateData.leafs = user.leafs;

                // Continue with the rest of the update logic...
            })
            .catch(err => {
                // Handle error
                res.json({ message: err.message, type: "danger" });
            });
    }

    // Check for existing user with the same email or phone number excluding the current user.
    User.findOne({
        $and: [
            { _id: { $ne: userId } }, // Exclude current user
            { $or: [
                    { email: updateData.email },
                    { phone: updateData.phone }
                ]}
        ]
    })
        .then(existingUser => {
            if (existingUser) {
                let errorMessage = "";
                if (existingUser.email === updateData.email) {
                    errorMessage = "Email already registered in another user.";
                } else if (existingUser.phone === updateData.phone) {
                    errorMessage = "Phone number already linked to another user account.";
                }
                return res.status(400).json({ message: errorMessage, type: "danger" });
            } else {
                // Handle nested properties like address
                if (req.body.address) {
                    const addressUpdates = {};
                    // Loop through address properties.
                    for (const addressProp in req.body.address) {
                        if (req.body.address.hasOwnProperty(addressProp)) {
                            addressUpdates[addressProp] = req.body.address[addressProp];
                        }
                    }
                    // Update address field in the update data.
                    updateData.address = addressUpdates;
                }

                // Update the user in the database
                User.findByIdAndUpdate(userId, updateData, { new: true }) // Return updated document
                    .then((updatedUser) => {
                        if (req.body.image && !fs.existsSync('./uploads/users/' + updatedUser._id)) {
                            fs.mkdirSync('./uploads/users/' + updatedUser._id, { recursive: true });
                        }
                        // If the user is not found, respond with a JSON error message.
                        if (!updatedUser) {
                            return res.json({ message: "User not found", type: "danger" });
                        }
                        // Set a success message in the session.
                        res.json({
                            type: "success",
                            message: updatedUser.firstName + " was updated successfully.",
                        });
                        // Redirect to the '/all' route.
                    })
                    .catch((err) => {
                        // If an error occurs during the update process, respond with a JSON error message.
                        res.json({ message: err.message, type: "danger" });
                    });
            }
        })
        .catch(err => {
            // If an error occurs during the database query, respond with a JSON error message.
            res.json({ message: err.message, type: "danger" });
        });
}



/**
 * Deletes a user from the database.
 *
 * This function deletes a user from the database based on the user ID
 * provided in the request body. It uses `User.findByIdAndDelete()` to
 * delete the user document. If the user document contains an image, it
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
 * router.post('/delete', userController.deleteUser);
 */
async function deleteUser(req, res, next) {
    try {
        // Extract the user ID from the request body.
        const id = req.body.id;

        // Delete the user from the database using the user ID.
        const result = await User.findByIdAndDelete(id);

        // If the deletion is successful and user document contains an image
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
            message: "User deleted successfully",
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

function uploadImage(req, res, next) {
    try {
        const originalFilename = req.file.originalname; // Original filename

        // Build the image URL based on storage strategy
        const imageUrl = path.join('./uploads/users/',req.body.entityId + '/', originalFilename);

        User.findByIdAndUpdate(req.body.entityId, {
            image: imageUrl, // Update user's image field with the URL
        })
            .then((updatedUser) => {
                res.json({ message: 'Image uploaded successfully.', type: "success" });
            })
            .catch((error) => {
                res.status(500).json({ error: 'Failed to upload image' });
            });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
}



module.exports = {
    renderUsersTable: renderUsersTable,
    addUser: addUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    getUser: getUser,
    getAllUsers: getAllUsers,
    uploadImage: uploadImage,
};
