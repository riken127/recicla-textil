const multer = require("../middleware/multerMiddleware");
const Benefactor = require("../models/benefactor/Benefactor");
const Address = require("../models/Address");
const fs = require("fs");
const objectMapper = require("../utils/objectMapper");
const {json} = require("express");

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
 * such as pagination, sorting, and searching. It constructs MongoDB queries based on the parameters
 * and returns the benefactors data in a format suitable for DataTables.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/add', benefactorController.addBenefactor);
 */
async function getAllBenefactors(req, res, next) {
    // Retrieve the total number of records in the database
    const totalRecords = await getTotalCount({});

    // Retrieve DataTables parameters from the request
    const {draw, start, length, order, columns} = req.body;
    const search = req.body['search[value]'];

    // Determine the sorting parameters
    if (typeof order === "undefined") {
        var attribute_name = 'name'; // Default sorting column
        var column_sort_order = 'desc'; // Default sorting order
    } else {
        var column_index = req.query.order?.[0]?.['column'];
        var column_name = req.query.columns?.[column_index]?.['data'];
        var column_sort_order = req.query.order?.[0]?.['dir'];
    }

    // Determine the search value
    var search_value = search;

    // Construct the MongoDB query based on the search value
    const query = {};

    if (search_value) {
        query['$text'] = {$search: search_value};
    }

    // Construct sorting options
    const sortOptions = {};
    if (column_name) {
        sortOptions[column_name] = column_sort_order === 'asc' ? 1 : -1;
    } else {
        sortOptions['name'] = column_sort_order === 'asc' ? 1 : -1;
    }

    // Query the database for benefactors
    Benefactor.find(query)
        .sort(sortOptions)
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
    // Extract the benefactor ID from the route parameters
    const benefactorId = req.params.id; // Assuming the benefactor ID is passed as a route parameter

    // Find the benefactor in the database by their ID
    Benefactor.findById(benefactorId)
        .then((benefactor) => {
            // If the benefactor is not found, respond with a 404 error
            if (!benefactor) {
                return res.status(404).json({message: "Benefactor not found"});
            }

            // Send the benefactor data as JSON response
            res.json(benefactor);
        })
        .catch((err) => {
            // If an error occurs during the retrieval process, log the error
            console.error("Error retrieving benefactor:", err);
            // Respond with a 500 error
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
 * router.post('/add', benefactorController.addBenefactor);
 */
function addBenefactor(req, res, next) {
    // Extract benefactor data from the request body
    const benefactorData = req.body;
    console.log(req.body);
    // Create a new benefactor object with default values for optional fields
    let benefactor = new Benefactor({
        name: benefactorData.name || "", // Default to empty string if not provided
        address: benefactorData.address || {}, // Default to empty object if address is not provided
        username: benefactorData.username || "", // Default to empty string if not provided
        password: benefactorData.password || "", // Default to empty string if not provided
        email: benefactorData.email || "", // Default to empty string if not provided
        description: benefactorData.description || "", // Default to empty string if not provided
        phone: benefactorData.phone || "", // Default to empty string if not provided
        logo: benefactorData.logo || "", // Default to empty string if not provided
        banner: benefactorData.banner || "", // Default to empty string if not provided
        pickpoints: benefactorData.pickpoints || [] ,// Default to empty array if not provided
    });

    // Save the new benefactor to the database
    benefactor.save()
        .then((savedBenefactor) => {
            // Set a success message in the session
            req.session.message = {
                type: "success",
                message: savedBenefactor.name + " was added successfully.",
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

    console.log(req.body);

    // Object to hold the changes to be updated.
    const updateData = {};

    // Define editable benefactor properties (excluding benefactorId)
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
    ];

    // Loop through editable benefactor properties
    for (const prop of editableProperties) {
        // Check if property exists in the request body and is not undefined.
        if (req.body.hasOwnProperty(prop) && req.body[prop] !== undefined) {
            // Include only properties present in request body for update.
            updateData[prop] = req.body[prop];
        }
    }

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

    // Update the benefactor in the database
    Benefactor.findByIdAndUpdate(benefactorId, updateData, {new: true}) // Return updated document
        .then((updatedBenefactor) => {
            // If the benefactor is not found, respond with a JSON error message.
            if (!updatedBenefactor) {
                return res.json({message: "Benefactor not found", type: "danger"});
            }
            // Set a success message in the session.
            req.session.message = {
                type: "success",
                message: updatedBenefactor.name + " was updated successfully.",
            };
            // Redirect to the '/all' route.
            res.redirect("/all");
        })
        .catch((err) => {
            // If an error occurs during the update process, respond with a JSON error message.
            res.json({message: err.message, type: "danger"});
        });
}

/**
 * Deletes a benefactor from the database.
 *
 * This function deletes a benefactor from the database based on the benefactor ID
 * provided in the request body. It uses `Benefactor.findByIdAndDelete()` to
 * delete the benefactor document. If the benefactor document contains an image, it
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
 * router.post('/delete', benefactorController.deleteBenefactor);
 */
async function deleteBenefactor(req, res, next) {
    try {
        // Extract the benefactor ID from the request body.
        const id = req.body.id;

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
    } catch (err) {
        // If an error occurs during the deletion process, respond with a JSON error message.
        res.status(500).json({
            message: err.message,
            type: "danger",
        });
    }
}

/**
 * Retrieves all benefactors with DataTables parameters.
 *
 * This function retrieves all benefactors from the database while considering DataTables parameters
 * such as pagination, sorting, and searching. It constructs MongoDB queries based on the parameters
 * and returns the benefactors data in a format suitable for DataTables.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/add', benefactorController.addBenefactor);
 */
async function getAllBenefactors(req, res, next) {
    console.log("Hello, World!")
    // Retrieve the total number of records in the database
    const totalRecords = await getTotalCount({});

    // Retrieve DataTables parameters from the request
    const {draw, start, length, order, columns} = req.body;
    const search = req.body['search[value]'];

    // Determine the sorting parameters
    if (typeof order === "undefined") {
        var attribute_name = 'name'; // Default sorting column
        var column_sort_order = 'desc'; // Default sorting order
    } else {
        var column_index = req.query.order?.[0]?.['column'];
        var column_name = req.query.columns?.[column_index]?.['data'];
        var column_sort_order = req.query.order?.[0]?.['dir'];
    }

    // Determine the search value
    var search_value = search;

    // Construct the MongoDB query based on the search value
    const query = {};

    if (search_value) {
        query['$text'] = {$search: search_value};
    }

    // Construct sorting options
    const sortOptions = {};
    if (column_name) {
        sortOptions[column_name] = column_sort_order === 'asc' ? 1 : -1;
    } else {
        sortOptions['name'] = column_sort_order === 'asc' ? 1 : -1;
    }

    // Query the database for benefactors
    Benefactor.find(query)
        .sort(sortOptions)
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


module.exports = {
    renderBenefactorsTable: renderBenefactorsTable,
    addBenefactor: addBenefactor,
    updateBenefactor: updateBenefactor,
    deleteBenefactor: deleteBenefactor,
    getBenefactor: getBenefactor,
    getAllBenefactors: getAllBenefactors
}