const Benefactor = require("../models/benefactor/Benefactor");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const Donation = require("../models/user/UserActivity");
const mailController = require("../controllers/MailController");

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
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.search || '';
    const limit = 10;

    const query = searchTerm
        ? { name: { $regex: searchTerm, $options: 'i' } }
        : {};

    Benefactor.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec()
        .then(benefactors => {
            res.json({
                benefactors: benefactors,
                currentPage: page
            });
        })
        .catch(err => {
            res.status(500).json({
                message: err.message,
                type: 'danger'
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
 * router.post('/', benefactorController.getAllBenefactors);
 */
async function getAllBenefactors(req, res, next) {
    const query = {};

    if (req.body.status) {
        query["status"] = req.body.status;
    } else {
        query["status"] = "active";
    }

    const totalRecords = await getTotalCount(query);
    const {draw, start, length} = req.body;
    const search_value = req.body["search[value]"];
    const orderBy = req.body["order[0][dir]"];
    const columnIndex = req.body["order[0][column]"];
    const order = orderBy === "asc" ? 1 : -1;
    const columnMapping = {
        0: "name",
        2: "address.street",
        3: "phone",
        4: "createdAt",
    };
    const column = columnMapping[columnIndex];

    if (search_value) {
        query["$or"] = [
            {name: {$regex: search_value, $options: "i"}},
            {username: {$regex: search_value, $options: "i"}},
            {email: {$regex: search_value, $options: "i"}},
        ];
    }

    Benefactor.find(query)
        .skip(parseInt(start))
        .limit(parseInt(length))
        .sort({[column]: order})
        .exec()
        .then((benefactors) => {
            return res.json({
                draw: parseInt(draw),
                recordsTotal: totalRecords,
                recordsFiltered: totalRecords,
                data: benefactors,
            });
        })
        .catch((err) => {
            return res.status(500).json({
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
        const count = await Benefactor.countDocuments(query);

        return count;
    } catch (err) {
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
    const benefactorId = req.params.id;

    Benefactor.findById(benefactorId)
        .then((benefactor) => {
            if (!benefactor) {
                return res.status(404).json({message: "Benefactor not found"});
            }

            res.json(benefactor);
        })
        .catch((err) => {
            console.error("Error retrieving benefactor:", err);
            res.status(500).json({message: "Internal Server Error"});
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
 * router.post('/', auth.isAuthenticated, benefactorController.addBenefactor);
 */
async function addBenefactor(req, res, next) {
    const benefactorData = req.body;

    Benefactor.findOne({
        $or: [
            {username: benefactorData.username},
            {email: benefactorData.email},
            {phone: benefactorData.phone},
        ],
    })
        .then((existingBenefactor) => {
            if (existingBenefactor) {
                let errorMessage = "";

                if (existingBenefactor.username === benefactorData.username) {
                    errorMessage = "Username already exists";
                } else if (existingBenefactor.email === benefactorData.email) {
                    errorMessage = "Email already exists.";
                } else if (existingBenefactor.phone === benefactorData.phone) {
                    errorMessage = "Phone number already exists.";
                }

                return res.status(400).json({message: errorMessage, type: "danger"});
            } else {
                let benefactor = new Benefactor({
                    name: benefactorData.name || "",
                    address: benefactorData.address || {},
                    username: benefactorData.username || "",
                    password: bcrypt.hashSync(benefactorData.password, 10) || "",
                    email: benefactorData.email || "",
                    description: benefactorData.description || "",
                    phone: benefactorData.phone || "",
                    logo: benefactorData.logo || "",
                    banner: benefactorData.banner || "",
                    pickpoints: benefactorData.pickpoints || [],
                    conversionRatio: benefactorData.conversionRatio || {},
                    status: benefactorData.status || "active",
                });

                benefactor
                    .save()
                    .then(async (savedBenefactor) => {
                        if (
                            (benefactorData.banner || benefactorData.logo) &&
                            !fs.existsSync("./uploads/benefactors/" + savedBenefactor._id)
                        ) {
                            fs.mkdirSync(
                                "./uploads/benefactors/" + savedBenefactor._id + "/profile/",
                                {recursive: true}
                            );
                        }

                        const email = mailController.createEmail("successEmail", {
                            to: savedBenefactor.email,
                            subject: "Benefactor Registration",
                            text:
                                "Dear " +
                                savedBenefactor.name +
                                ",\n\n" +
                                "We'd like to inform you that the account for the benefactor has been successfully created. Here are the details for the new account:\n\n" +
                                "- Username: " +
                                savedBenefactor.username +
                                "\n" +
                                "- Email: " +
                                savedBenefactor.email +
                                "\n\n" +
                                "This is an automated email. Please do not reply to this email as responses will not be received or read.\n\n" +
                                "If you need any further information, we are at your disposal.\n\n" +
                                "Best regards,\n\n" +
                                "Recicla-Textil Team",
                        });

                        await email.send();

                        return res.status(200).json({
                            type: "success",
                            result: savedBenefactor._id,
                        });
                    })
                    .catch(async (err) => {
                        const email = mailController.createEmail("errorEmail", {
                            to: req.body.email,
                            subject: "Benefactor Registration Error",
                            text:
                                "Dear " +
                                req.body.name +
                                ",\n\n" +
                                "An error occurred while creating the benefactor account. Please review and take necessary actions.\n\n" +
                                "Error Details:\n" +
                                "- Error Code: " +
                                err.code +
                                "\n" +
                                "- Error Message: " +
                                err.message +
                                "\n\n" +
                                "If you need any further assistance, please don't hesitate to contact us.\n\n" +
                                "Best regards,\n\n" +
                                "Recicla-Textil Team",
                        });

                        await email.send();

                        return res.status(500).json({
                            message: err.message,
                            type: "danger",
                        });
                    });
            }
        })
        .catch(async (err) => {
            const email = mailController.createEmail("errorEmail", {
                to: req.body.email,
                subject: "Benefactor Registration Error",
                text:
                    "Dear " +
                    req.body.name +
                    ",\n\n" +
                    "An error occurred while creating the benefactor account. Please review and take necessary actions.\n\n" +
                    "Error Details:\n" +
                    "- Error Code: " +
                    err.code +
                    "\n" +
                    "- Error Message: " +
                    err.message +
                    "\n\n" +
                    "If you need any further assistance, please don't hesitate to contact us.\n\n" +
                    "Best regards,\n\n" +
                    "Recicla-Textil Team",
            });

            await email.send();

            return res.status(500).json({message: err.message, type: "danger"});
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
 * router.put('/:id', auth.isAuthenticated, benefactorController.updateBenefactor);
 */
async function updateBenefactor(req, res, next) {
    const benefactorId = req.params.id;
    const updateData = {};
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
        "conversionRatio",
        "status",
    ];

    for (const prop of editableProperties) {
        if (req.body.hasOwnProperty(prop) && req.body[prop] !== undefined) {
            updateData[prop] = req.body[prop];
        }
    }

    if (updateData.password !== undefined) {
        updateData.password = bcrypt.hashSync(updateData.password, 10);
    } else {
        delete updateData.password;
    }

    Benefactor.findOne({
        $and: [
            {_id: {$ne: benefactorId}},
            {$or: [{email: updateData.email}, {phone: updateData.phone}]},
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

                res.status(400).json({message: errorMessage, type: "danger"});
            } else {
                if (req.body.address) {
                    const addressUpdates = {};

                    for (const addressProp in req.body.address) {
                        if (req.body.address.hasOwnProperty(addressProp)) {
                            addressUpdates[addressProp] = req.body.address[addressProp];
                        }
                    }

                    updateData.address = addressUpdates;
                }

                Benefactor.findByIdAndUpdate(benefactorId, updateData, {
                    new: true,
                })
                    .then(async (updatedBenefactor) => {
                        if (
                            req.body.image &&
                            !fs.existsSync(
                                "./uploads/benefactors/" + benefactorId + "/profile"
                            )
                        ) {
                            fs.mkdirSync(
                                "./uploads/benefactors/" + benefactorId + "/profile/",
                                {recursive: true}
                            );
                        }

                        if (!updatedBenefactor) {
                            return res.json({
                                message: "Benefactor not found",
                                type: "danger",
                            });
                        }

                        const email = mailController.createEmail("updateEmail", {
                            to: req.user.email,
                            subject: "Benefactor Update",
                            text:
                                "Dear " +
                                req.user.firstName +
                                ",\n\n" +
                                "We'd like to inform you that the account for the benefactor has been successfully updated. Here are the details for the updated account:\n\n" +
                                "- Username: " +
                                updatedBenefactor.username +
                                "\n" +
                                "- Email: " +
                                updatedBenefactor.email +
                                "\n\n" +
                                "This is an automated email. Please do not reply to this email as responses will not be received or read.\n\n" +
                                "If you need any further information, we are at your disposal.\n\n" +
                                "Best regards,\n\n" +
                                "Recicla-Textil Team",
                        });

                        await email.send();

                        res.json({
                            type: "success",
                            message: updateBenefactor.name + " was updated successfully.",
                        });
                    })
                    .catch(async (err) => {
                        const email = mailController.createEmail("errorEmail", {
                            to: req.user.email,
                            subject: "Benefactor Update Error",
                            text:
                                "Dear " +
                                req.user.firstName +
                                ",\n\n" +
                                "An error occurred while updating the benefactor account. Please review and take necessary actions.\n\n" +
                                "Error Details:\n" +
                                "- Error Code: " +
                                err.code +
                                "\n" +
                                "- Error Message: " +
                                err.message +
                                "\n\n" +
                                "If you need any further assistance, please don't hesitate to contact us.\n\n" +
                                "Best regards,\n\n" +
                                "Recicla-Textil Team",
                        });

                        await email.send();

                        res.json({message: err.message, type: "danger"});
                    });
            }
        })
        .catch(async (err) => {
            const email = mailController.createEmail("errorEmail", {
                to: req.user.email,
                subject: "Benefactor Update Error",
                text:
                    "Dear " +
                    req.user.firstName +
                    ",\n\n" +
                    "An error occurred while updating the benefactor account. Please review and take necessary actions.\n\n" +
                    "Error Details:\n" +
                    "- Error Code: " +
                    err.code +
                    "\n" +
                    "- Error Message: " +
                    err.message +
                    "\n\n" +
                    "If you need any further assistance, please don't hesitate to contact us.\n\n" +
                    "Best regards,\n\n" +
                    "Recicla-Textil Team",
            });

            await email.send();

            res.json({message: err.message, type: "danger"});
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
 * router.delete('/:id', auth.isAuthenticated, benefactorController.deleteBenefactor);
 */
async function deleteBenefactor(req, res, next) {
    try {
        const id = req.params.id;

        const donationQuery = {
            activityType: "donation",
            "details.benefactorId": id,
        };

        const donations = await Donation.find(donationQuery);

        if (donations.length == 0) {
            const result = await Benefactor.findByIdAndDelete(id, {new: true});
            const {logo, banner} = result;

            if (logo) {
                try {
                    fs.unlinkSync("./uploads/" + logo);
                } catch (err) {
                    console.error(err);
                }
            }

            if (banner) {
                try {
                    fs.unlinkSync("./uploads/" + banner);
                } catch (err) {
                    console.error(err);
                }
            }

            const email = mailController.createEmail("sucessEmail", {
                to: req.user.email,
                subject: "Benefactor deletion",
                text:
                    "Dear " +
                    req.user.firstName +
                    ",\n\n" +
                    "We'd like to inform you that the account for the benefactor has been successfully deleted. Here are the details for the deleted account:\n\n" +
                    "- Username: " +
                    req.user.username +
                    "\n" +
                    "- Email: " +
                    req.user.email +
                    "\n\n" +
                    "This is an automated email. Please do not reply to this email as responses will not be received or read.\n\n" +
                    "If you need any further information, we are at your disposal.\n\n" +
                    "Best regards,\n\n" +
                    "Recicla-Textil Team",
            });

            await email.send();

            return res.status(200).json({
                message: "Benefactor deleted successfully",
                type: "success",
            });
        } else {
            console.log("idkmakdkd: "+id);
            const inactiveData = {status: "inactive"};

            Benefactor.findByIdAndUpdate(id, inactiveData)
                .then(async (benefactor) => {
                    if (!benefactor) {
                        return res.status(404).json({
                            message: "Benefactor not found",
                            type: "danger",
                        });
                    }

                    const email = mailController.createEmail("sucessEmail", {
                        to: req.user.email,
                        subject: "Benefactor deletion",
                        text:
                            "Dear " +
                            req.user.firstName +
                            ",\n\n" +
                            "We'd like to inform you that the account for the benefactor has been successfully deleted. Here are the details for the deleted account:\n\n" +
                            "- Username: " +
                            req.user.username +
                            "\n" +
                            "- Email: " +
                            req.user.email +
                            "\n\n" +
                            "This is an automated email. Please do not reply to this email as responses will not be received or read.\n\n" +
                            "If you need any further information, we are at your disposal.\n\n" +
                            "Best regards,\n\n" +
                            "Recicla-Textil Team",
                    });

                    await email.send();

                    return res.status(200).json({
                        message: "Benefactor status updated to inactive",
                        type: "success",
                    });
                })
                .catch(async (err) => {
                    const email = mailController.createEmail("errorEmail", {
                        to: req.user.email,
                        subject: "Benefactor deletion",
                        text:
                            "Dear " +
                            req.user.firstName +
                            ",\n\n" +
                            "An error occurred while deleting the benefactor account. Please review and take necessary actions.\n\n" +
                            "Error Details:\n" +
                            "- Error Code: " +
                            err.code +
                            "\n" +
                            "- Error Message: " +
                            JSON.stringify(err) +
                            "\n\n" +
                            "If you need any further assistance, please don't hesitate to contact us.\n\n" +
                            "Best regards,\n\n" +
                            "Recicla-Textil Team",
                    });

                    await email.send();

                    return res.status(500).json({
                        message: err.message,
                        type: "danger",
                    });
                });
        }
    } catch (err) {
        const email = mailController.createEmail("errorEmail", {
            to: req.user.email,
            subject: "Benefactor deletion",
            text:
                "Dear " +
                req.user.firstName +
                ",\n\n" +
                "An error occurred while deleting the benefactor account. Please review and take necessary actions.\n\n" +
                "Error Details:\n" +
                "- Error Code: " +
                err.code +
                "\n" +
                "- Error Message: " +
                err.message +
                "\n\n" +
                "If you need any further assistance, please don't hesitate to contact us.\n\n" +
                "Best regards,\n\n" +
                "Recicla-Textil Team",
        });

        await email.send();

        return res.status(500).json({
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
        const bannerUrl = path.join(
            "./uploads/benefactors",
            "/" + req.body.entityId,
            "/profile/",
            originalFilename
        );
        console.log(bannerUrl)
        Benefactor.findByIdAndUpdate(req.body.entityId, {
            banner: bannerUrl,
        })
            .then((updatedBenefactor) => {
                console.log("banner:" + updatedBenefactor)
                return res.status(200).json({
                    message: "Banner uploaded successfully.",
                    type: "success",
                });
            })
            .catch((error) => {
                console.log(error)
                return res.status(500).json({error: "Failed to upload banner."});
            });
    } catch (error) {
        console.error("Error uploading image", error);
        return res.status(500).json({error: "Failed to upload banner."});
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
        console.log(req)
        const originalFilename = req.file.originalname;
        const logoUrl = path.join(
            "./uploads/benefactors",
            "/" + req.body.entityId,
            "/profile/",
            originalFilename
        );
        console.log(logoUrl)
        Benefactor.findByIdAndUpdate(req.body.entityId, {
            logo: logoUrl,
        })
            .then((updatedBenefactor) => {
                console.log("logo:" + updatedBenefactor)
                return res.status(200).json({
                    message: "Logo uploaded successfully.",
                    type: "success",
                });
            })
            .catch((error) => {
                console.log(error)
                return res.status(500).json({error: "Failed to upload logo."});
            });
    } catch (error) {
        console.error("Error uploading image", error);
        return res.status(500).json({error: "Failed to upload logo."});
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
