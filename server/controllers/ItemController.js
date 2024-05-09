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
 * router.post('/:id/items/all-items', itemsController.getAllItems);
 */
async function getAllItems(req, res, next) {
    // Collect the donation ID from the request body
    const donationId = req.body.donationId;
    // Collect the DataTables parameters from the request body
    const { draw } = req.body;
    // Search value from the request body
    const search_value = req.body["search[value]"];
    // Construct the MongoDB query based on the search value
    const query = { _id: donationId };
    if (search_value) {
        query["details.items.$text"] = { $search: search_value };
    }
    // Query the database for the benefactor
    Donation.findOne(query)
        .exec()
        .then((donation) => {
            // Respond with DataTables formatted data
            res.json({
                draw: parseInt(draw),
                recordsTotal: donation.details.items.length,
                recordsFiltered: donation.details.items.length,
                data: donation.details.items,
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
 * Renders the table of items for a specific donation.
 *
 * This function queries the database to retrieve a donation by its ID,
 * then responds with a JSON object containing the items of the donation.
 * If the donation is not found, it responds with a JSON error message.
 * If an error occurs during the retrieval process, it responds with a JSON error message.
 *
 * @param {Object} req - The request object, containing the donation ID in the parameters.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/:id/items/all', itemsController.renderItemsTable);
 */
function renderItemsTable(req, res, next) {
    // Extract the donation ID from the route parameters
    const donationId = req.params.id;
    // Find the donation in the database by its ID
    Donation.findById(donationId)
        .exec()
        .then((donation) => {
            if (!donation) {
                // If the donation is not found, respond with a 404 error
                return res.status(404).json({
                    message: "Donation not found",
                    type: "danger",
                });
            }
            res.json(donation.details.items);
        })
        .catch((err) => {
            // If an error occurs during the retrieval process, log the error
            res.status(500).json({
                message: err.message,
                type: "danger",
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
    // Extract the donation ID from the route parameters
    const donationId = req.params.id;
    // Extract the item data from the request body
    const itemData = req.body;
    // Find the donation in the database by its ID
    const weight = parseInt(itemData.weight.value);
    // Set the _id of the item to a new ObjectId
    itemData._id = new mongoose.Types.ObjectId();
    // Check if the photo field is present in the request body
    if (
        req.body.photo &&
        !fs.existsSync("./uploads/donations/" + donationId + "/images/")
    ) {
        fs.mkdirSync("./uploads/donations/" + donationId + "/images/", {
            recursive: true,
        });
    }
    // Update the donation in the database
    Donation.findByIdAndUpdate(
        donationId,
        {
            // Add the item to the items array
            $push: { "details.items": itemData },
            // Increment the total weight and number of items
            $inc: { "details.totalWeight": weight, "details.numberOfItems": 1 },
        },
        // Return the updated document after the update and run the validators
        { new: true, runValidators: true }
    )
        .then((updateDonation) => {
            res.json({
                message: "Item added successfully",
                donation: updateDonation,
                id: itemData._id,
            });
        })
        .catch((err) => {
            // If an error occurs during the update process, log the error
            res.status(500).json({ message: err.message });
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
 * router.delete('/:id/items/:idItem/delete', itemsController.deleteItem);
 */
async function deleteItem(req, res, next) {
    try {
        // Extract the donation ID from the route parameters
        const donationId = req.params.id;
        // Extract the item ID from the route parameters
        const itemId = req.params.idItem;
        // Find the donation in the database by its ID
        const donation = await Donation.findById(donationId);
        // If the donation is not found, respond with a 404 error
        if (!donation) {
            return res
                .status(404)
                .json({ message: "Donation not found", type: "danger" });
        }
        const itemToRemove = itemId;
        // If the item is not found, respond with a 404 error
        if (!itemToRemove) {
            return res
                .status(404)
                .json({ message: "Item not found", type: "danger" });
        }
        // Loop through the items in the donation
        for (let i = 0; i < donation.details.items.length; i++) {
            if (donation.details.items[i]._id.toString() === itemToRemove) {
                // Store the weight of the item to be removed
                const itemWeight = donation.details.items[i].weight.value;
                // Subtract the weight of the item from the total weight
                donation.details.totalWeight -= itemWeight;
                // Subtract 1 from the number of items
                donation.details.numberOfItems -= 1;
                // Remove the item from the items array
                donation.details.items.splice(i, 1);
                break;
            }
        }
        // Save the donation back to the database.
        await Donation.findByIdAndUpdate(donationId, donation, { new: true });
        res.status(200).json({
            message: "Item deleted successfully",
            type: "success",
        });
    } catch (err) {
        // Log the error to the console
        console.error(`Error: ${err}`);
        res.status(500).json({ message: err.message, type: "danger" });
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
    // Extract the donation ID from the route parameters
    const donationId = req.params.id;
    // Extract the item ID from the route parameters
    const itemId = req.params.itemId;
    // Find the donation in the database by its ID
    Donation.findById(donationId)
        .then((donation) => {
            // If the donation is not found, respond with a 404 error
            if (!donation) {
                return res.status(404).json({ message: "Donation not found" });
            }
            // Find the item in the donation
            const item = donation.details.items.find(
                (it) => it._id.toString() === itemId
            );
            if (!item) {
                return res.status(404).json({ message: "Item not found" });
            }
            // Send the item data as JSON response
            res.json(item);
        })
        .catch((err) => {
            // If an error occurs during the retrieval process, log the error
            console.error("Error retrieving donation:", err);
            // Respond with a 500 error
            res.status(500).json({ message: "Internal Server Error" });
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
 * router.post('/:id/items/:itemId/update', itemsController.updateItem);
 */
function updateItem(req, res, next) {
    console.log(req);
    // Extract the donation ID from the route parameters
    const donationId = req.params.id;
    // Extract the item ID from the route parameters
    const itemId = req.params.itemId;
    // Extract the item data from the request body
    const itemData = req.body;
    // Check if the photo field is present in the request body
    if (
        req.body.photo &&
        !fs.existsSync("./uploads/donations/" + donationId + "/images/")
    ) {
        fs.mkdirSync("./uploads/donations/" + donationId + "/images/", {
            recursive: true,
        });
    }
    // Find the donation the database its ID
    Donation.findById(donationId)
        .then((donation) => {
            // If the donation is not found, respond with a 404 error
            if (!donation) {
                return res.status(404).json({ message: "Donation not found" });
            }
            // Find the item in the donation
            const item = donation.details.items.find(
                (item) => item._id.toString() === itemId
            );
            // If the item is not found, respond with a 404 error
            if (!item) {
                return res.status(404).json({ message: "Item not found" });
            }
            // Update the item with the new data
            item.brand = itemData.brand;
            item.weight = itemData.weight;
            item.size = itemData.size;
            item.type = itemData.type;
            item.weight.value = parseInt(itemData.weight.value);
            item.weight.unit = itemData.weight.unit;
            // Check if the photo field is present in the request body
            if (itemData.photo) {
                item.photo = itemData.photo;
            }
            // Inform Mongoose that the item has been updated
            donation.markModified("details.items");
            // Update the total weight
            donation.details.totalWeight = donation.details.items.reduce(
                (total, item) => total + Number(item.weight.value),
                0
            );
            // Inform Mongoose that the totalWeight has been updated
            donation.markModified("details.totalWeight");
            // Save the updated donation
            return donation.save();
        })
        .then((updatedDonation) => {
            // Respond with the updated donation
            res.json(updatedDonation);
        })
        .catch((err) => {
            // If an error occurs during the update process, log the error
            console.error("Error updating item:", err);
            // Respond with a 500 error
            if (!res.headersSent) {
                res.status(500).json({ message: "Internal Server Error" });
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
    // Extract the file name from the request
    const originalFilename = req.file.originalname;
    // Construct the image URL
    const imageUrl = path.join(
        "./uploads/donations/",
        req.body.entityId + "/images/",
        originalFilename
    );
    // Find the donation in the database by its ID
    Donation.findById(req.body.entityId)
        .then((donation) => {
            if (!donation) {
                return res.status(404).json({ message: "Donation not found" });
            }
            // Find the item in the donation
            const item = donation.details.items.find(
                (item) => item._id.toString() === req.body.subEntityId
            );
            // If the item is not found, respond with a 404 error
            if (!item) {
                return res.status(404).json({ message: "Item not found" });
            }
            item.photo = imageUrl;
            // Inform Mongoose that the item has been updated
            donation.markModified("details.items");
            return donation.save();
        })
        // Respond with the updated donation
        .then((updateDonation) => {
            res.json(updateDonation);
        })
        .catch((err) => {
            // If an error occurs during the update process, log the error
            console.error("Error updating item: ", err);
            // Respond with a 500 error
            if (!res.headersSent) {
                res.status(500).json({ message: "Internal server error." });
            }
        });
}

module.exports = {
    getAllItems: getAllItems,
    renderItemsTable: renderItemsTable,
    addItem: addItem,
    deleteItem: deleteItem,
    getItem: getItem,
    updateItem: updateItem,
    uploadImage: uploadImage,
};
