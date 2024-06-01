const fs = require("fs");
const Donation = require("../models/user/UserActivity");
const mongoose = require("mongoose");
const path = require("path");

/**
 * Retrieves all items for a specific donation.
 *
 * This function queries the database to retrieve a donation by its ID,
 * then responds with a JSON object containing the items of the donation in a format suitable for DataTables.
 * If an error occurs during the retrieval process, it responds with a JSON error message.
 *
 * @param {Object} req - The request object, containing the donation ID and DataTables parameters in the body.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/:id/items/all', itemsController.getAllItems);
 */
async function getAllItems(req, res, next) {
    const donationId = req.params.id;
    const {draw} = req.body;
    const search_value = req.body["search[value]"];
    const query = {_id: donationId};
    const orderBy = req.body["order[0][dir]"];
    const columnIndex = req.body["order[0][column]"];
    const order = orderBy === "asc" ? 1 : -1;
    const columnMapping = {
        0: "details.items.brand",
        1: "details.items.type",
        2: "details.items.size",
        3: "details.items.weight.value",
    };
    const column = columnMapping[columnIndex];

    if (search_value) {
        query["details.items.$text"] = {$search: search_value};
    }

    Donation.findOne(query)
        .sort({[column]: order})
        .then((donation) => {
            res.json({
                draw: parseInt(draw),
                recordsTotal: donation.details.items.length,
                recordsFiltered: donation.details.items.length,
                data: donation.details.items,
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err.message,
            });
        });
}

/**
 * Adds an item to a specific donation.
 *
 * This function extracts the donation ID from the route parameters and the item data from the request body.
 * It then updates the donation in the database by adding the item to the items array and incrementing the total weight and number of items.
 * If the photo field is present in the request body, it creates a directory for the images of the donation if it does not exist.
 * If an error occurs during the update process, it responds with a JSON error message.
 *
 * @param {Object} req - The request object, containing the donation ID in the parameters and the item data in the body.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/:id/items/add', itemsController.addItem);
 */
function addItem(req, res, next) {
    const donationId = req.params.id;
    const itemData = req.body;
    const weight = parseInt(itemData.weight.value);
    itemData._id = new mongoose.Types.ObjectId();

    if (
        req.body.photo &&
        !fs.existsSync("./uploads/donations/" + donationId + "/images/")
    ) {
        fs.mkdirSync("./uploads/donations/" + donationId + "/images/", {
            recursive: true,
        });
    }

    Donation.findByIdAndUpdate(
        donationId,
        {
            $push: {"details.items": itemData},
            $inc: {"details.totalWeight": weight, "details.numberOfItems": 1},
        },
        {new: true, runValidators: true}
    )
        .then((updateDonation) => {
            res.json({
                message: "Item added successfully",
                donation: updateDonation,
                id: itemData._id,
            });
        })
        .catch((err) => {
            res.status(500).json({message: err.message});
        });
}

/**
 * Deletes an item from a specific donation.
 *
 * This function extracts the donation ID and the item ID from the route parameters.
 * It then finds the donation in the database by its ID and loops through the items in the donation.
 * If it finds the item, it subtracts the weight of the item from the total weight, subtracts 1 from the number of items, and removes the item from the items array.
 * It then saves the donation back to the database.
 * If the donation or the item is not found, it responds with a 404 error.
 * If an error occurs during the deletion process, it responds with a 500 error.
 *
 * @param {Object} req - The request object, containing the donation ID and the item ID in the parameters.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.delete('/:id/items/:idItem', itemsController.deleteItem);
 */
async function deleteItem(req, res, next) {
    try {
        const donationId = req.params.id;
        const itemId = req.params.idItem;
        const donation = await Donation.findById(donationId);

        if (!donation) {
            return res
                .status(404)
                .json({message: "Donation not found", type: "danger"});
        }

        const itemToRemove = itemId;

        if (!itemToRemove) {
            return res
                .status(404)
                .json({message: "Item not found", type: "danger"});
        }

        for (let i = 0; i < donation.details.items.length; i++) {
            if (donation.details.items[i]._id.toString() === itemToRemove) {
                const itemWeight = donation.details.items[i].weight.value;
                donation.details.totalWeight -= itemWeight;
                donation.details.numberOfItems -= 1;
                donation.details.items.splice(i, 1);
                break;
            }
        }

        await Donation.findByIdAndUpdate(donationId, donation, {new: true});

        res.status(200).json({
            message: "Item deleted successfully",
            type: "success",
        });
    } catch (err) {
        console.error(`Error: ${err}`);
        res.status(500).json({message: err.message, type: "danger"});
    }
}

/**
 * Retrieves an item from a specific donation.
 *
 * This function extracts the donation ID and the item ID from the route parameters.
 * It then finds the donation in the database by its ID and finds the item in the donation.
 * If the donation or the item is not found, it responds with a 404 error.
 * If an error occurs during the retrieval process, it responds with a 500 error.
 *
 * @param {Object} req - The request object, containing the donation ID and the item ID in the parameters.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/:id/items/:itemId', itemsController.getItem);
 */
function getItem(req, res, next) {
    const donationId = req.params.id;
    const itemId = req.params.itemId;

    Donation.findById(donationId)
        .then((donation) => {
            if (!donation) {
                return res.status(404).json({message: "Donation not found"});
            }

            const item = donation.details.items.find(
                (it) => it._id.toString() === itemId
            );

            if (!item) {
                return res.status(404).json({message: "Item not found"});
            }

            res.json(item);
        })
        .catch((err) => {
            console.error("Error retrieving donation:", err);
            res.status(500).json({message: "Internal Server Error"});
        });
}

/**
 * Updates an item in a specific donation.
 *
 * This function extracts the donation ID and the item ID from the route parameters and the item data from the request body.
 * It then finds the donation in the database by its ID and finds the item in the donation.
 * If the donation or the item is not found, it responds with a 404 error.
 * It then updates the item with the new data, informs Mongoose that the item and the totalWeight have been updated, and saves the updated donation.
 * If an error occurs during the update process, it responds with a 500 error.
 *
 * @param {Object} req - The request object, containing the donation ID, the item ID in the parameters, and the item data in the body.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.put('/:id/items/:itemId', itemsController.updateItem);
 */
function updateItem(req, res, next) {
    const donationId = req.params.id;
    const itemId = req.params.itemId;
    const itemData = req.body;

    if (
        req.body.photo &&
        !fs.existsSync("./uploads/donations/" + donationId + "/images/")
    ) {
        fs.mkdirSync("./uploads/donations/" + donationId + "/images/", {
            recursive: true,
        });
    }

    Donation.findById(donationId)
        .then((donation) => {

            if (!donation) {
                return res.status(404).json({message: "Donation not found"});
            }

            const item = donation.details.items.find(
                (item) => item._id.toString() === itemId
            );

            if (!item) {
                return res.status(404).json({message: "Item not found"});
            }

            item.brand = itemData.brand;
            item.weight = itemData.weight;
            item.size = itemData.size;
            item.type = itemData.type;
            item.weight.value = parseInt(itemData.weight.value);
            item.weight.unit = itemData.weight.unit;

            if (itemData.photo) {
                item.photo = itemData.photo;
            }

            donation.markModified("details.items");

            donation.details.totalWeight = donation.details.items.reduce(
                (total, item) => total + Number(item.weight.value),
                0
            );

            donation.markModified("details.totalWeight");

            return donation.save();
        })
        .then((updatedDonation) => {
            res.json(updatedDonation);
        })
        .catch((err) => {
            console.error("Error updating item:", err);

            if (!res.headersSent) {
                res.status(500).json({message: "Internal Server Error"});
            }
        });
}

/**
 * Uploads an image for an item in a specific donation.
 *
 * This function extracts the file name from the request and constructs the image URL.
 * It then finds the donation in the database by its ID and finds the item in the donation.
 * If the donation or the item is not found, it responds with a 404 error.
 * It then updates the item with the new image URL, informs Mongoose that the item has been updated, and saves the updated donation.
 * If an error occurs during the update process, it responds with a 500 error.
 *
 * @param {Object} req - The request object, containing the file name in the file object, the donation ID in the body.entityId, and the item ID in the body.subEntityId.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 */
function uploadImage(req, res, next) {
    const originalFilename = req.file.originalname;
    const imageUrl = path.join(
        "./uploads/donations/",
        req.body.entityId + "/images/",
        originalFilename
    );

    Donation.findById(req.body.entityId)
        .then((donation) => {
            if (!donation) {
                return res.status(404).json({message: "Donation not found"});
            }

            const item = donation.details.items.find(
                (item) => item._id.toString() === req.body.subEntityId
            );

            if (!item) {
                return res.status(404).json({message: "Item not found"});
            }

            item.photo = imageUrl;

            donation.markModified("details.items");

            return donation.save();
        })
        .then((updateDonation) => {
            res.json(updateDonation);
        })
        .catch((err) => {
            console.error("Error updating item: ", err);

            if (!res.headersSent) {
                res.status(500).json({message: "Internal server error."});
            }
        });
}

module.exports = {
    getAllItems: getAllItems,
    addItem: addItem,
    deleteItem: deleteItem,
    getItem: getItem,
    updateItem: updateItem,
    uploadImage: uploadImage,
};
