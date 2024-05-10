const User = require("../models/user/User");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const Donation = require("../models/user/UserActivity");

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
    const page = req.body.page || 1;

    User.find()
        .skip((page - 1) * 10)
        .limit(10)
        .exec()
        .then((users) => {
            
            res.render("users/table", {
                currentRoute: "/users/all",
                username: req.user.username,
                pfp: req.user.image,
            });
        })
        .catch((err) => {
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
 * router.post('/all-users', userController.getAllUsers);
 */
async function getAllUsers(req, res, next) {
    const query = { active: true };
    const totalRecords = await getTotalCount(query);
    let { draw, start, length } = req.body;
    const search = req.body["search[value]"];
    var search_value = search;

    if (search_value) {
        query["$or"] = [
            { firstName: { $regex: search_value, $options: "i" } },
            { lastName: { $regex: search_value, $options: "i" } },
            { username: { $regex: search_value, $options: "i" } },
        ];
    }

    length = length !== undefined ? parseInt(length) : 10;

    User.find(query)
        .skip(parseInt(start))
        .limit(length)
        .exec()
        .then((users) => {

            res.json({
                draw: parseInt(draw),
                recordsTotal: totalRecords,
                recordsFiltered: totalRecords,
                data: users,
            });
        })
        .catch((err) => {
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
        const count = await User.countDocuments(query);

        return count;
    } catch (err) {
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
    const userId = req.params.id;

    User.findById(userId)
        .then((user) => {

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(user);
        })
        .catch((err) => {
            console.error("Error retrieving user:", err);
            res.status(500).json({ message: "Internal Server Error" });
        });
}

/**
 * Adds a new user to the database.
 *
 * This function adds a new user to the database based on the data
 * provided in the request body. It creates a new user object with
 * default values for optional fields if they are not provided, then
 * saves the user to the database. If an error occurs, it responds with a
 * JSON error message.
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
    const userData = req.body;

    User.findOne({
        $or: [
            { username: userData.username },
            { email: userData.email },
            { phone: userData.phone },
        ],
    })
        .then((existingUser) => {

            if (existingUser) {
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
                let user = new User({
                    lastName: userData.lastName,
                    firstName: userData.firstName,
                    username: userData.username || "",
                    email: userData.email || "",
                    password: bcrypt.hashSync(userData.password, 10) || "",
                    image: "",
                    roles: userData.roles || ["user"],
                    address: userData.address || {},
                    phone: userData.phone || "",
                    language: userData.language || "",
                    notify: userData.notify || false,
                    active: userData.active || true,
                });

                user.save()
                    .then((savedUser) => {

                        if (
                            req.body.image &&
                            !fs.existsSync("./uploads/users/" + savedUser._id)
                        ) {
                            fs.mkdirSync("./uploads/users/" + savedUser._id, {
                                recursive: true,
                            });
                        }

                        res.status(200).json({
                            type: "success",
                            result: savedUser._id,
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            message: err.message,
                            type: "danger",
                        });
                    });
            }
        })
        .catch((err) => {
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
    const userId = req.body.userId;
    const updateData = {};
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

    for (const prop of editableProperties) {
        if (req.body.hasOwnProperty(prop) && req.body[prop] !== undefined) {
            updateData[prop] = req.body[prop];
        }
    }

    if (updateData.password) {
        updateData.password = bcrypt.hashSync(updateData.password, 10);
    }

    if (req.body.hasOwnProperty("leafs") && req.body["leafs"] !== undefined) {
        User.findById(userId)
            .then((user) => {
                user.leafs += req.body["leafs"];
                updateData.leafs = user.leafs;
            })
            .catch((err) => {
                res.json({ message: err.message, type: "danger" });
            });
    }

    User.findOne({
        $and: [
            { _id: { $ne: userId } },
            { $or: [{ email: updateData.email }, { phone: updateData.phone }] },
        ],
    })
        .then((existingUser) => {

            if (existingUser) {
                let errorMessage = "";

                if (existingUser.email === updateData.email) {
                    errorMessage = "Email already registered in another user.";
                } else if (existingUser.phone === updateData.phone) {
                    errorMessage =
                        "Phone number already linked to another user account.";
                }

                return res
                    .status(400)
                    .json({ message: errorMessage, type: "danger" });                    
            } else {
                if (req.body.address) {
                    const addressUpdates = {};

                    for (const addressProp in req.body.address) {
                        if (req.body.address.hasOwnProperty(addressProp)) {
                            addressUpdates[addressProp] =
                                req.body.address[addressProp];
                        }
                    }
                    updateData.address = addressUpdates;
                }

                User.findByIdAndUpdate(userId, updateData, { new: true })
                    .then((updatedUser) => {

                        if (
                            req.body.image &&
                            !fs.existsSync("./uploads/users/" + updatedUser._id)
                        ) {
                            fs.mkdirSync("./uploads/users/" + updatedUser._id, {
                                recursive: true,
                            });
                        }

                        if (!updatedUser) {
                            return res.json({
                                message: "User not found",
                                type: "danger",
                            });
                        }

                        res.json({
                            type: "success",
                            message:
                                updatedUser.firstName +
                                " was updated successfully.",
                        });
                    })
                    .catch((err) => {
                        res.json({ message: err.message, type: "danger" });
                    });
            }
        })
        .catch((err) => {
            res.json({ message: err.message, type: "danger" });
        });
}

/**
 * Deletes a user or sets the user to inactive if they have donations.
 *
 * This function extracts the user ID from the request body and finds any donations made by the user.
 * If no donations are found, it deletes the user from the database and removes their image from the file system.
 * If donations are found, it sets the user to inactive.
 * If an error occurs during the deletion or update process, it responds with a 500 error.
 *
 * @param {Object} req - The request object, containing the user ID in the body.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/delete/', userController.deleteUser)
 */
async function deleteUser(req, res, next) {
    try {
        const id = req.body.id;
        const donationQuery = {
            activityType: "donation",
            userId: id,
        };
        const donations = await Donation.find(donationQuery);

        if (donations.length == 0) {
            const result = await User.findByIdAndDelete(id);

            if (result && result.image) {
                try {
                    fs.unlinkSync("./uploads/" + result.image);
                } catch (err) {
                    console.error(err);
                }
            }

            res.status(200).json({
                message: "User deleted successfully",
                type: "success",
            });
        } else {
            inactiveData = { active: false };

            User.findByIdAndUpdate(id, inactiveData)
                .then((user) => {

                    if (!user) {
                        return res.status(404).json({
                            message: "User not found",
                            type: "danger",
                        });
                    }

                    res.status(200).json({
                        message: "User deleted successfully",
                        type: "success",
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        message: err.message,
                        type: "danger",
                    });
                });
        }
    } catch (err) {
        res.status(500).json({
            message: err.message,
            type: "danger",
        });
    }
}

/**
 * Uploads an image for a user and updates the user's image field in the database.
 *
 * This function extracts the file name from the request and constructs the image URL.
 * It then finds the user in the database by their ID and updates their image field with the new image URL.
 * If an error occurs during the update process, it responds with a 500 error.
 *
 * @param {Object} req - The request object, containing the file name in the file object and the user ID in the body.entityId.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 */
function uploadImage(req, res, next) {
    try {
        const originalFilename = req.file.originalname;
        const imageUrl = path.join(
            "./uploads/users/",
            req.body.entityId + "/",
            originalFilename
        );
        User.findByIdAndUpdate(req.body.entityId, {
            image: imageUrl,
        })
            .then((updatedUser) => {
                res.json({
                    message: "Image uploaded successfully.",
                    type: "success",
                });
            })
            .catch((error) => {
                res.status(500).json({ error: "Failed to upload image" });
            });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: "Failed to upload image" });
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
