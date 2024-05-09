const Benefactor = require("../models/benefactor/Benefactor");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const Donation = require("../models/user/UserActivity");

/**
 * Renders the table of benefactors.
 *
 * This function queries the database to retrieve a page of benefactors,
 * then renders a table view using the retrieved benefactors data.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/all', benefactorController.renderBenefactorsTable);
 */
function renderBenefactorsTable(req, res, next) {
    // Extracts the page number from the request body or defaults to 1
    const page = req.body.page || 1;
    // Query the database for benefactors, skipping the appropriate number of documents based on the page number,
    // and limiting the results to 10 benefactors per page
    Benefactor.find()
        .skip((page - 1) * 10)
        .limit(10)
        .exec()
        .then((benefactors) => {
            // Renders the "benefactors/table" view with the retrieved benefactors data
            res.render("benefactors/table", {
                benefactors: benefactors,
                currentRoute: "/benefactors/all",
                username: req.user.username,
                pfp: req.user.image,
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
 * Retrieves all benefactors with DataTables parameters.
 *
 * This function retrieves all benefactors from the database while considering DataTables parameters
 * such as pagination and searching. It constructs MongoDB queries based on the parameters
 * and returns the benefactors data in a format suitable for DataTables.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/all-benefactors', benefactorController.getAllBenefactors);
 */
async function getAllBenefactors(req, res, next) {
    // Only active benefactors
    const query = { active: true };
    // Total number of benefactors
    const totalRecords = await getTotalCount(query);
    // DataTables parameters from the request
    const { draw, start, length } = req.body;
    // Search value from the request
    const search_value = req.body["search[value]"];
    // Change query to match the search value with benefactor name, username, or email
    if (search_value) {
        query["$or"] = [
            { name: { $regex: search_value, $options: "i" } },
            { username: { $regex: search_value, $options: "i" } },
            { email: { $regex: search_value, $options: "i" } },
        ];
    }
    // Query the database for benefactors
    Benefactor.find(query)
        .skip(parseInt(start))
        .limit(parseInt(length))
        .exec()
        .then((benefactors) => {
            // Respond with DataTables formatted data
            res.json({
                draw: parseInt(draw),
                recordsTotal: totalRecords,
                recordsFiltered: totalRecords,
                data: benefactors,
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
 * Retrieves the total count of benefactors based on a query.
 *
 * This function retrieves the total count of benefactors from the database
 * based on the provided MongoDB query.
 *
 * @param {Object} query - The MongoDB query object.
 * @returns {Promise<number>} The total count of benefactors.
 */
async function getTotalCount(query) {
    try {
        // Count the documents in the 'Benefactor' collection that match the provided query
        const count = await Benefactor.countDocuments(query);
        return count;
    } catch (err) {
        // If an error occurs during the counting process, throw the error
        throw err;
    }
}

/**
 * Retrieves a benefactor by ID.
 *
 * This function retrieves a benefactor from the database by their ID,
 * which is typically passed as a route parameter. It then sends
 * the benefactor data as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/:id', benefactorController.getBenefactor);
 */
function getBenefactor(req, res, next) {
    // Benefactor ID from the request parameters
    const benefactorId = req.params.id;
    // Find the benefactor in the database by their ID
    Benefactor.findById(benefactorId)
        .then((benefactor) => {
            // If the benefactor is not found, respond with a 404 error
            if (!benefactor) {
                return res
                    .status(404)
                    .json({ message: "Benefactor not found" });
            }
            // Send the benefactor data as JSON response
            res.json(benefactor);
        })
        .catch((err) => {
            // If an error occurs during the retrieval process, log the error
            console.error("Error retrieving benefactor:", err);
            // Respond with a 500 error
            res.status(500).json({ message: "Internal Server Error" });
        });
}

/**
 * Adds a new benefactor to the database.
 *
 * This function adds a new benefactor to the database based on the data
 * provided in the request body. It creates a new benefactor object with
 * default values for optional fields if they are not provided, then
 * saves the benefactor to the database. If successful, it redirects to the
 * "/all" route. If an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/add', benefactorController.addBenefactor);
 */
function addBenefactor(req, res, next) {
    // Extract benefactor data from the request body
    const benefactorData = req.body;
    // Check if the provided username, email, or phone number exists in the database
    Benefactor.findOne({
        $or: [
            { username: benefactorData.username },
            { email: benefactorData.email },
            { phone: benefactorData.phone },
        ],
    })
        .then((existingBenefactor) => {
            // If existing benefactor is found, check which field is a duplicate
            if (existingBenefactor) {
                let errorMessage = "";
                if (existingBenefactor.username === benefactorData.username) {
                    errorMessage = "Username already exists";
                } else if (existingBenefactor.email === benefactorData.email) {
                    errorMessage = "Email already exists.";
                } else if (existingBenefactor.phone === benefactorData.phone) {
                    errorMessage = "Phone number already exists.";
                }
                res.status(400).json({ message: errorMessage, type: "danger" });
            } else {
                // If no existing benefactor is found, create a new benefactor object
                let benefactor = new Benefactor({
                    // If fields are not provided, set them default values
                    name: benefactorData.name || "",
                    address: benefactorData.address || {},
                    username: benefactorData.username || "",
                    password:
                        bcrypt.hashSync(benefactorData.password, 10) || "",
                    email: benefactorData.email || "",
                    description: benefactorData.description || "",
                    phone: benefactorData.phone || "",
                    logo: benefactorData.logo || "",
                    banner: benefactorData.banner || "",
                    pickpoints: benefactorData.pickpoints || [],
                    convertationRatio: benefactorData.convertationRatio || {},
                    active: benefactorData.active || false,
                });
                // Save the new benefactor to the database
                benefactor
                    .save()
                    .then((savedBenefactor) => {
                        if (
                            // Check if the benefactor has a logo or banner and the directory does not exist
                            (benefactorData.banner || benefactorData.logo) &&
                            !fs.existsSync(
                                "./uploads/benefactors/" + savedBenefactor._id
                            )
                        ) {
                            fs.mkdirSync(
                                "./uploads/benefactors/" +
                                    savedBenefactor._id +
                                    "/profile/",
                                { recursive: true }
                            );
                        }
                        // Set a success message in the session
                        res.status(200).json({
                            type: "success",
                            result: savedBenefactor._id,
                        });
                    })
                    .catch((err) => {
                        // If an error occurs during the save process, respond with a JSON error message
                        res.status(500).json({
                            message: err.message,
                            type: "danger",
                        });
                    });
            }
        })
        .catch((err) => {
            // If an error occurs during the search process, respond with a JSON error message.
            res.status(500).json({ message: err.message, type: "danger" });
        });
}

/**
 * Updates a benefactor in the database.
 *
 * This function updates an existing benefactor in the database based on the data
 * provided in the request body. It extracts the benefactor ID and the update data
 * from the request, then constructs an object containing the changes. It then
 * updates the benefactor in the database using `Benefactor.findByIdAndUpdate()`. If successful,
 * it sets a success message in the session and redirects to the "/all" route. If
 * an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/update', benefactorController.updateBenefactor);
 */
function updateBenefactor(req, res, next) {
    // Extract the benefactor ID from the request body.
    const benefactorId = req.body.benefactorId;
    // Object to hold the changes to be updated.
    const updateData = {};
    // Define benefactor properties that can be updated.
    const editableProperties = [
        "name",
        "username",
        "email",
        "password",
        "logo",
        "banner",
        "description",
        "address",
        "phone",
        "pickpoints",
        "convertationRatio",
    ];
    // Check if the request body contains any of the editable properties.
    for (const prop of editableProperties) {
        if (req.body.hasOwnProperty(prop) && req.body[prop] !== undefined) {
            // Add the property to the updateData object.
            updateData[prop] = req.body[prop];
        }
    }
    // Check if password field is not undefined before hashing
    if (updateData.password !== undefined) {
        updateData.password = bcrypt.hashSync(updateData.password, 10);
    } else {
        // If password field is undefined, remove it from the updateData object
        delete updateData.password;
    }
    // Check if the email or phone number is already in use by another benefactor
    Benefactor.findOne({
        $and: [
            { _id: { $ne: benefactorId } },
            { $or: [{ email: updateData.email }, { phone: updateData.phone }] },
        ],
    })
        .then((existingBenefactor) => {
            if (existingBenefactor) {
                let errorMessage = "";
                if (existingBenefactor.username === updateData.username) {
                    errorMessage = "Username already exists.";
                } else if (existingBenefactor.email === updateData.email) {
                    errorMessage = "E-mail already exists.";
                } else if (existingBenefactor.phone === updateData.phone) {
                    errorMessage = "Phone number already exists.";
                }
                // If the email or phone number is already in use, respond with a JSON error message.
                res.status(400).json({ message: errorMessage, type: "danger" });
            } else {
                // Handle nested properties like address
                if (req.body.address) {
                    const addressUpdates = {};
                    // Loop through address properties.
                    for (const addressProp in req.body.address) {
                        if (req.body.address.hasOwnProperty(addressProp)) {
                            addressUpdates[addressProp] =
                                req.body.address[addressProp];
                        }
                    }
                    // Update address field in the update data.
                    updateData.address = addressUpdates;
                }
                // Update the benefactor in the database
                Benefactor.findByIdAndUpdate(benefactorId, updateData, {
                    new: true,
                }) // Return updated document
                    .then((updatedBenefactor) => {
                        if (
                            req.body.image &&
                            !fs.existsSync(
                                "./uploads/benefactors/" +
                                    benefactorId +
                                    "/profile"
                            )
                        ) {
                            fs.mkdirSync(
                                "./uploads/benefactors/" +
                                    benefactorId +
                                    "/profile/",
                                { recursive: true }
                            );
                        }
                        // If the benefactor is not found, respond with a JSON error message.
                        if (!updatedBenefactor) {
                            return res.json({
                                message: "Benefactor not found",
                                type: "danger",
                            });
                        }
                        // Respond with a JSON success message.
                        res.json({
                            type: "success",
                            message:
                                updateBenefactor.name +
                                " was updated successfully.",
                        });
                    })
                    .catch((err) => {
                        // If an error occurs during the update process, respond with a JSON error message.
                        res.json({ message: err.message, type: "danger" });
                    });
            }
        })
        .catch((err) => {
            res.json({ message: err.message, type: "danger" });
        });
}

/**
 * Deletes a benefactor.
 *
 * This function handles the deletion of a benefactor. It first extracts the benefactor ID from the request body,
 * then checks if the benefactor has any associated donations. If no donations are found, it deletes the benefactor
 * from the database and removes any associated logo and banner files from the file system.
 * If the benefactor has associated donations, it updates the benefactor's status to inactive instead of deleting it.
 * If the deletion or update is successful, it sends a JSON response with a success message. If an error occurs during
 * the process, it logs the error and sends a JSON response with an error message.
 *
 * @param {Object} req - The request object, which should include the ID of the benefactor to be deleted.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
  * @returns {void}
 * @example
 * // Usage:
 * router.post('/delete/', benefactorController.deleteBenefactor);
 */
async function deleteBenefactor(req, res, next) {
    try {
        // Extract the benefactor ID from the request body.
        const id = req.body.id;
        // Check if the benefactor has any associated donations
        const donationQuery = {
            activityType: "donation",
            "details.benefactorId": id,
        };
        const donations = await Donation.find(donationQuery);
        // If no donations are found for the benefactor
        if (donations.length == 0) {
            // Delete the benefactor from the database using the benefactor ID.
            const result = await Benefactor.findByIdAndDelete(id);
            const { logo, banner } = result;
            // If the deletion is successful and benefactor document contains a logo
            if (logo) {
                // Delete the logo file from the file system.
                try {
                    fs.unlinkSync("./uploads/" + logo);
                } catch (err) {
                    // Log any errors that occur during file deletion.
                    console.error(err);
                }
            }
            // If the deletion is successful and benefactor document contains a banner
            if (banner) {
                // Delete the banner file from the file system.
                try {
                    fs.unlinkSync("./uploads/" + banner);
                } catch (err) {
                    // Log any errors that occur during file deletion.
                    console.error(err);
                }
            }
            // Respond with a JSON success message.
            res.status(200).json({
                message: "Benefactor deleted successfully",
                type: "success",
            });
        } else {
            inactiveData = {};
            inactiveData.active = false;
            // update the benefactor to inactive
            Benefactor.findByIdAndUpdate(id, inactiveData)
                .then((benefactor) => {
                    if (!benefactor) {
                        return res.status(404).json({
                            message: "Benefactor not found",
                            type: "danger",
                        });
                    }
                    res.status(200).json({
                        message: "Benefactor deleted successfully",
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
        // If an error occurs during the deletion process, respond with a JSON error message.
        res.status(500).json({
            message: err.message,
            type: "danger",
        });
    }
}

/**
 * Uploads a banner image for a benefactor.
 *
 * This function handles the upload of a banner image for a benefactor. It first extracts the original filename
 * from the uploaded file, then constructs a URL for the image based on a predefined storage strategy.
 * It then updates the benefactor's document in the database with the new banner URL.
 *
 * If the upload is successful, it sends a JSON response with a success message. If an error occurs during the
 * upload or the database update, it logs the error and sends a JSON response with an error message.
 *
 * @param {Object} req - The request object, which should include the file to be uploaded and the ID of the benefactor.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
function uploadBanner(req, res, next) {
    try {
        const originalFilename = req.file.originalname;
        // Build the image URL based on storage strategy
        const bannerUrl = path.join(
            "./uploads/benefactors",
            "/" + req.body.entityId,
            "/profile/",
            originalFilename
        );
        // Update the benefactor document with the new banner URL
        Benefactor.findByIdAndUpdate(req.body.entityId, {
            banner: bannerUrl,
        })
            .then((updatedBenefactor) => {
                res.json({
                    message: "Banner uploaded successfully.",
                    type: "success",
                });
            })
            .catch((error) => {
                res.status(500).json({ error: "Failed to upload banner." });
            });
    } catch (error) {
        // If an error occurs during the upload process, respond with a JSON error message.
        console.error("Error uploading image", error);
        res.status(500).json({ error: "Failed to upload banner." });
    }
}

/**
 * Uploads a logo image for a benefactor.
 *
 * This function handles the upload of a logo image for a benefactor. It first extracts the original filename
 * from the uploaded file, then constructs a URL for the image based on a predefined storage strategy.
 * It then updates the benefactor's document in the database with the new logo URL.
 *
 * If the upload is successful, it sends a JSON response with a success message. If an error occurs during the
 * upload or the database update, it logs the error and sends a JSON response with an error message.
 *
 * @param {Object} req - The request object, which should include the file to be uploaded and the ID of the benefactor.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */
function uploadLogo(req, res, next) {
    try {
        const originalFilename = req.file.originalname;
        // Build the image URL based on storage strategy.
        const logoUrl = path.join(
            "./uploads/benefactors",
            "/" + req.body.entityId,
            "/profile/",
            originalFilename
        );
        // Update the benefactor document with the new logo URL.
        Benefactor.findByIdAndUpdate(req.body.entityId, {
            logo: logoUrl,
        })
            .then((updatedBenefactor) => {
                res.json({
                    message: "Logo uploaded successfully.",
                    type: "success",
                });
            })
            .catch((error) => {
                res.status(500).json({ error: "Failed to upload logo." });
            });
    } catch (error) {
        // If an error occurs during the upload process, respond with a JSON error message.
        console.error("Error uploading image", error);
        res.status(500).json({ error: "Failed to upload logo." });
    }
}

module.exports = {
    renderBenefactorsTable: renderBenefactorsTable,
    addBenefactor: addBenefactor,
    updateBenefactor: updateBenefactor,
    deleteBenefactor: deleteBenefactor,
    getBenefactor: getBenefactor,
    getAllBenefactors: getAllBenefactors,
    uploadBanner: uploadBanner,
    uploadLogo: uploadLogo,
};
