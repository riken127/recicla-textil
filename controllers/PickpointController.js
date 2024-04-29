const multer = require("../middleware/multerMiddleware");
const Address = require("../models/Address");
const fs = require("fs");
const objectMapper = require("../utils/objectMapper");
const {json} = require("express");
const Benefactor = require("../models/benefactor/Benefactor");

/**
 * Renders the table of pickpoints.
 *
 * This function queries the database to retrieve a page of pickpoints,
 * then renders a table view using the retrieved pickpoints data.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/all', pickpointController.renderPickpointsTable);
 */
function renderPickpointsTable(req, res, next) {
    const benefactorId = req.params.id;

    Benefactor.findById(benefactorId)
    .exec()
    .then((benefactor) => {
        if (!benefactor) {
            return res.status(404).json({
                message: "Benefactor not found",
                type: "danger",
            });
        }

        // Return the pickpoints of the benefactor as JSON
        res.json(benefactor.pickpoints);
    })
    .catch((err) => {
        res.status(500).json({
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
async function getAllPickpoints(req, res, next) {
    // Retrieve the benefactor ID from the request
    const benefactorId = req.body.benefactorId;
    // Retrieve DataTables parameters from the request
    const {draw, start, length, order, columns} = req.body;
    const search = req.body['search[value]'];

    // Determine the sorting parameters
    if (typeof order === "undefined") {
        var attribute_name = 'pickpoints.country'; // Default sorting column
        var column_sort_order = 'desc'; // Default sorting order
    } else {
        var column_index = req.query.order?.[0]?.['column'];
        var column_name = req.query.columns?.[column_index]?.['data'];
        var column_sort_order = req.query.order?.[0]?.['dir'];
    }

    // Determine the search value
    var search_value = search;

    // Construct the MongoDB query based on the search value
    const query = {_id: benefactorId};

    if (search_value) {
        query['pickpoints.$text'] = {$search: search_value};
    }

    // Construct sorting options
    const sortOptions = {};
    if (column_name) {
        sortOptions[column_name] = column_sort_order === 'asc' ? 1 : -1;
    } else {
        sortOptions['pickpoints.country'] = column_sort_order === 'asc' ? 1 : -1;
    }

// Query the database for the benefactor
Benefactor.findOne(query)
    .exec()
    .then((benefactor) => {
        // Respond with DataTables formatted data
        res.json({
            draw: parseInt(draw),
            recordsTotal: benefactor.pickpoints.length,
            recordsFiltered: benefactor.pickpoints.length,
            data: benefactor.pickpoints, // Return only the pickpoints
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
 * Retrieves a pickpoint by ID.
 *
 * This function retrieves a pickpoint from the database by their ID,
 * which is typically passed as a route parameter. It then sends
 * the pickpoint data as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
router.get('/:id/pickpoints/:idpp', benefactorController.getBenefactor);
 */
function getPickpoint(req, res, next) {
    // Extract the benefactor ID from the route parameters
    const benefactorId = req.params.id; // Assuming the benefactor ID is passed as a route parameter
    const pickPointId = req.params.idpp;

    // Find the benefactor in the database by their ID
    Benefactor.findById(benefactorId)
        .then((benefactor) => {
            // If the benefactor is not found, respond with a 404 error
        
            if (!benefactor) {
                return res.status(404).json({message: "Benefactor not found"});
            }
            const pickPoint = benefactor.pickpoints.find(pp => pp._id.toString() === pickPointId);
            console.log("id: "+pickPointId.toString);

            if (!pickPoint) {
                return res.status(404).json({message: "Pickpoint not found"});
            }

            // Send the pickpoint data as JSON response
            res.json(pickPoint);
        })
        .catch((err) => {
            // If an error occurs during the retrieval process, log the error
            console.error("Error retrieving benefactor:", err);
            // Respond with a 500 error
            res.status(500).json({message: "Internal Server Error"});
        });
}

/**
 * Adds a new pickpoint to an existing benefactor in the database.
 *
 * This function adds a new pickpoint to an existing benefactor in the database
 * based on the data provided in the request body. It retrieves the benefactor
 * by ID, then creates a new pickpoint object with the provided data. It adds
 * the pickpoint to the benefactor's pickpoints array and saves the benefactor
 * back to the database. If successful, it responds with a JSON success message.
 * If an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/:id/addPickPoint', benefactorController.addPickPoint);
 */
function addPickpoint(req, res) {
    const benefactorId = req.params.id;
    const pickpointData = req.body;

    Benefactor.findByIdAndUpdate(
        benefactorId,
        { $push: { pickpoints: pickpointData } },
        { new: true, runValidators: true }
    )
    .then((updatedBenefactor) => {
        res.json({
            message: "Pickpoint added successfully",
            benefactor: updatedBenefactor
        });
    })
    .catch((err) => {
        res.status(500).json({ message: err.message });
    });
}

/**
 * Atualiza um pickpoint de um benefactor no banco de dados.
 *
 * Esta função atualiza um único pickpoint de um benefactor existente no banco de dados
 * com base nos dados fornecidos no corpo da solicitação. Ela extrai o ID do benefactor
 * e o ID do pickpoint dos parâmetros da rota e do corpo da solicitação, respectivamente.
 * Em seguida, encontra o benefactor pelo ID, localiza e atualiza o pickpoint desejado e,
 * finalmente, salva o benefactor de volta ao banco de dados. Se bem-sucedido, responde com
 * uma mensagem JSON de sucesso. Se ocorrer um erro, responde com uma mensagem de erro JSON.
 *
 * @param {Object} req - O objeto de solicitação.
 * @param {Object} res - O objeto de resposta.
 * @param {Function} next - A próxima função middleware no ciclo de solicitação-resposta.
 * @returns {void}
 * @example
 * // Uso:
 * router.put('/:id/benefactor/:idpp/pickpoint', benefactorController.updatePickPoint);
 */
function updatePickpoint(req, res, next) {
    const benefactorId = req.params.id;
    const pickpointId = req.params.idpp; // get the pickpoint id from the route parameters
    const pickpointData = req.body;

    Benefactor.findById(benefactorId)
        .then((benefactor) => {
            if (!benefactor) {
                return res.status(404).json({ message: "Benefactor not found" });
            }

            // Find the pickpoint in the benefactor's pickpoints array
            const pickpoint = benefactor.pickpoints.id(pickpointId);

            if (!pickpoint) {
                return res.status(404).json({ message: "Pickpoint not found" });
            }

            // Update the pickpoint with the new data
            pickpoint.set(pickpointData);

            // Save the benefactor back to the database
            return benefactor.save();
        })
        .then((savedBenefactor) => {
            res.json({
                message: "Pickpoint updated successfully",
                benefactor: savedBenefactor
            });
        })
        .catch((err) => {
            res.status(500).json({ message: err.message });
        });
}


/**
 * Deletes a pickpoint from a benefactor in the database.
 *
 * This function deletes a pickpoint from a benefactor in the database based on the
 * benefactor ID and pickpoint ID provided in the request parameters. It first finds
 * the benefactor by ID, then removes the pickpoint with the specified ID from the
 * benefactor's pickpoints array. If successful, it responds with a JSON success
 * message. If an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.delete('/:id/benefactor/:idpp/pickpoint', benefactorController.deletePickPoint);
 */
async function deletePickpoint(req, res, next) {
    try {
        console.log(req.parms);
        const benefactorId = req.params.id;
        const pickPointId = req.params.idpp;

        console.log(`Benefactor ID: ${benefactorId}`);
        console.log(`PickPoint ID: ${pickPointId}`);

        const benefactor = await Benefactor.findById(benefactorId);

        if (!benefactor) {
            return res.status(404).json({ message: "Benefactor not found", type: "danger" });
        }

        const pickpointToRemove = pickPointId;

        if (!pickpointToRemove) {
            return res.status(404).json({ message: "Pickpoint not found", type: "danger" });
        }

        // Remove the pickpoint from the benefactor's pickpoints array.
        for (let i = 0; i < benefactor.pickpoints.length; i++) {
            console.log(benefactor.pickpoints[i]._id.toString());
            if (benefactor.pickpoints[i]._id.toString() === pickpointToRemove) {
                benefactor.pickpoints.splice(i, 1);
                console.log("Pickpoint found and removed");
                break;
            }
        }
        
        // Save the benefactor back to the database.
        await benefactor.save();

        console.log(benefactor.pickpoints)
        res.status(200).json({ message: "Pickpoint deleted successfully", type: "success" });
    } catch (err) {
        console.error(`Error: ${err}`);
        res.status(500).json({ message: err.message, type: "danger" });
    }
}


module.exports = {
    renderPickpointsTable: renderPickpointsTable,
    addPickpoint: addPickpoint,
    updatePickpoint: updatePickpoint,
    deletePickpoint: deletePickpoint,
    getPickpoint: getPickpoint,
    getAllPickpoints: getAllPickpoints
};
