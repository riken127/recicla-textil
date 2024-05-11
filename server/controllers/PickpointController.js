const Benefactor = require("../models/benefactor/Benefactor");
const Donation = require("../models/user/UserActivity");

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

            const pickpoints = benefactor.pickpoints.filter(
                (pickpoint) => pickpoint.active === true
            );

            res.json(pickpoints);
        })
        .catch((err) => {
            res.status(500).json({
                message: err.message,
                type: "danger",
            });
        });
}

/**
 * Retrieves all active pickpoints for a benefactor.
 *
 * This function finds the benefactor in the database by their ID and filters their pickpoints based on the search value provided in the request body.
 * If no search value is provided, it returns all active pickpoints.
 * If a search value is provided, it filters the active pickpoints based on whether the country, city, street, or postal code includes the search value.
 * If an error occurs during the retrieval process, it responds with a 500 error.
 *
 * @param {Object} req - The request object, containing the benefactor ID in the params and the search value in the body.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/:id/pickpoints/all-pickpoints', pickpointController.getAllPickpoints);
 */
async function getAllPickpoints(req, res, next) {
    const benefactorId = req.params.id;
    const orderBy = req.body["order[0][dir]"];
    const columnIndex = req.body["order[0][column]"];
    const order = orderBy === "asc" ? 1 : -1;
    const columnMapping = {
        0: "country",
        1: "city",
        2: "street",
        3: "postalCode",
    };
    const column = columnMapping[columnIndex];

    Benefactor.findById(benefactorId)
        .sort({ [column]: order })
        .then((benefactor) => {

            if (!benefactor) {
                return res
                    .status(404)
                    .json({ message: "Benefactor not found" });
            }

            const { draw } = req.body;
            const search = req.body["search[value]"];
            var pickpoints;

            if (!search) {
                pickpoints = benefactor.pickpoints.filter(
                    (pickpoint) => pickpoint.active == true
                );
            } else {
                pickpoints = benefactor.pickpoints.filter(
                    (pickpoint) =>
                        (pickpoint.country
                            .toLowerCase()
                            .includes(search.toLowerCase()) ||
                            pickpoint.city
                                .toLowerCase()
                                .includes(search.toLowerCase()) ||
                            pickpoint.street
                                .toLowerCase()
                                .includes(search.toLowerCase()) ||
                            pickpoint.postalCode
                                .toLowerCase()
                                .includes(search.toLowerCase())) &&
                        pickpoint.active == true
                );
            }

            if (!pickpoints) {
                return res
                    .status(404)
                    .json({ message: "Pickpoints not found" });
            }

            res.json({
                draw: parseInt(draw),
                recordsTotal: pickpoints.length,
                recordsFiltered: pickpoints.length,
                data: pickpoints,
            });
        })
        .catch((err) => {
            console.error("Error retrieving benefactor:", err);
            res.status(500).json({ message: "Internal Server Error" });
        });
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
    const benefactorId = req.params.id;
    const pickPointId = req.params.idpp;

    Benefactor.findById(benefactorId)
        .then((benefactor) => {

            if (!benefactor) {
                return res
                    .status(404)
                    .json({ message: "Benefactor not found" });
            }

            const pickPoint = benefactor.pickpoints.find(
                (pp) => pp._id.toString() === pickPointId
            );

            if (!pickPoint) {
                return res.status(404).json({ message: "Pickpoint not found" });
            }

            res.json(pickPoint);
        })
        .catch((err) => {
            console.error("Error retrieving benefactor:", err);
            res.status(500).json({ message: "Internal Server Error" });
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
    pickpointData.active = true;

    Benefactor.findByIdAndUpdate(
        benefactorId,
        { $push: { pickpoints: pickpointData } },
        { new: true, runValidators: true }
    )
        .then((updatedBenefactor) => {
            res.json({
                message: "Pickpoint added successfully",
                benefactor: updatedBenefactor,
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
    const pickpointId = req.params.idpp;
    const pickpointData = req.body;

    Benefactor.findById(benefactorId)
        .then((benefactor) => {
            if (!benefactor) {
                return res
                    .status(404)
                    .json({ message: "Benefactor not found" });
            }

            const pickpoint = benefactor.pickpoints.id(pickpointId);

            if (!pickpoint) {
                return res.status(404).json({ message: "Pickpoint not found" });
            }

            pickpoint.set(pickpointData);

            return benefactor.save();
        })
        .then((savedBenefactor) => {
            res.json({
                message: "Pickpoint updated successfully",
                benefactor: savedBenefactor,
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
 * router.delete('/:id/pickpoints/:idpp/', pickpointController.deletePickpoint);;
 */
async function deletePickpoint(req, res, next) {
    try {
        const benefactorId = req.params.id;
        const pickPointId = req.params.idpp;
        const benefactor = await Benefactor.findById(benefactorId);

        if (!benefactor) {
            return res
                .status(404)
                .json({ message: "Benefactor not found", type: "danger" });
        }

        const pickpointToRemove = pickPointId;

        if (!pickpointToRemove) {
            return res
                .status(404)
                .json({ message: "Pickpoint not found", type: "danger" });
        }

        const donationQuery = {
            activityType: "donation",
            "details.pickpointId": pickPointId,
        };
        const donations = await Donation.find(donationQuery);

        for (let i = 0; i < benefactor.pickpoints.length; i++) {
            if (benefactor.pickpoints[i]._id.toString() === pickpointToRemove) {
                if (donations.length == 0) {
                    benefactor.pickpoints.splice(i, 1);
                    break;
                } else {
                    benefactor.pickpoints[i].active = false;
                    break;
                }
            }
        }

        await benefactor.save();

        res.status(200).json({
            message: "Pickpoint deleted successfully",
            type: "success",
        });
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
    getAllPickpoints: getAllPickpoints,
};
