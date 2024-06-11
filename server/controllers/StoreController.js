const Prize = require("../models/benefactor/Prize");
const User = require("../models/user/User");
const fs = require("fs");
const path = require("path");
const { Type } = require("mongoose");

/**
 * Removes points from a user, and updates the points (if enough).
 *
 * This function updates the number of points a user has and returns a prize code, if enough points are found.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - THe response object.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('redeem/:prize', storeController.redeemPrize);
 */
function redeemPrize(req, res, next) {
    let user = req.body;
    let prize;

    if (!req.params.prize) {
        return res.status(500).json({
            type: "error",
            message: "prize is undefined.",
        });
    }

    if (!user) {
        return res.status(401).json({
            type: "error",
            message: "unauthorized",
        });
    }

    User.findById(user._id)
        .then((currentUser) => {
            user = currentUser;

            Prize.findById(req.params.prize)
                .then((currentPrize) => {
                    prize = currentPrize;

                    if (user.leafs < prize.price) {
                        return res.status(500).json({
                            type: "error",
                            message:
                                "unsufficient amount of points to complete the choosen trasaction.",
                        });
                    }

                    user.leafs -= prize.price;

                    User.findByIdAndUpdate(user._id, user, { new: true })
                        .then((user) => {
                            return res.status(200).json({
                                type: "success",
                                message: generateRandomString(),
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(500).json({
                                type: "error",
                                message: err,
                            });
                        });
                })
                .catch((err) => {
                    return res.status(500).json({
                        type: "error",
                        message: err,
                    });
                });
        })
        .catch((err) => {
            return res.status(500).json({
                type: "error",
                message: err,
            });
        });
}

/**
 * Generates a random string in the format "A1BC-2DEF-3GHI-4JKL".
 * Each segment of the string is a random sequence of four alphanumeric characters (0-9, A-Z).
 * The segments are separated by hyphens.
 * 
 * @returns {string} The generated random string.
 */
function generateRandomString() {
    return (
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        "-" +
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        "-" +
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        "-" +
        Math.random().toString(36).substring(2, 6).toUpperCase()
    );
}

/**
 * Creates a new prize, receives the benefactor id via url and creates a new object in the mongoDB db.
 *
 * This function creates a new document in the Prize mongoose collection, it registers the benefactor it belongs to using the benefactor id that is passed by parameters.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/', storeController.addPrize);
 */
function addPrize(req, res, next) {
    let prize = new Prize({
        price: req.body.price,
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        benefactor: req.body.benefactor,
    });

    if (!prize.price || !prize.title || !prize.benefactor) {
        return res.status(500).json({
            type: "error",
            message: "required fields were not written.",
        });
    }

    prize
        .save()
        .then((prize) => {
            if (
                prize.image &&
                !fs.existsSync(
                    "./uploads/benefactors/" + prize.benefactor + "/prizes"
                )
            ) {
                fs.mkdirSync(
                    "./uploads/benefactors/" + prize.benefactor + "/prizes",
                    { recursive: true }
                );
            }

            return res.status(200).json({
                type: "success",
                result: prize._id,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                type: "error",
                result: error,
            });
        });
}

/**
 * Edits a prize, receives the prize id via the url and the the prize object via the request body.
 *
 * This function edits a prize document in the Prize mongoose collection.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 * @example
 * // Usage:
 * router.put('/:id', storeController.editPrize);
 */
function editPrize(req, res, next) {
    let prize = req.body;

    Prize.findByIdAndUpdate(req.params.id, prize, { new: true })
        .then((prize) => {
            if (
                prize.image &&
                !fs.existsSync("./uploads/benefactors/" + prize.benefactor)
            ) {
                fs.mkdirSync(
                    "./uploads/benefactors/" + prize.benefactor + "/prizes",
                    { recursive: true }
                );
            } else if (
                fs.existsSync(
                    "./uploads/benefactors/" +
                        prize.benefactor +
                        "/prizes" +
                        prize._id +
                        ".jpg"
                ) &&
                req.body.image
            ) {
                fs.unlinkSync(
                    "./uploads/benefactors/" +
                        prize.benefactor +
                        "/prizes/" +
                        offer._id +
                        ".jpg"
                );
            }

            if (!prize) {
                return res.status(500).json({
                    type: "error",
                    message: "prize not found",
                });
            }

            return res.status(200).json({
                type: "success",
                message: prize._id + " was updated successfully.",
            });
        })
        .catch((error) => {
            return res.status(500).json({
                type: "error",
                message: error,
            });
        });
}

/**
 * Deletes a prize, receives the prize id via the url.
 *
 * This function deletes a prize, if it exists.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 * @example
 * // Usage:
 * router.delete('/:id', storeController.deletePrize);
 */
function deletePrize(req, res, next) {
    Prize.findByIdAndDelete(req.params.id, { new: true })
        .then((prize) => {
            if (!prize) {
                return res.status(500).json({
                    type: "error",
                    message: "prize not found",
                });
            }

            if (prize.image) {
                try {
                    return fs.unlinkSync("./uploads/" + prize.image);
                } catch (err) {
                    res.status(500).json({
                        type: "error",
                        message: err,
                    });
                }
            }

            return res.status(200).json({
                type: "success",
                message: "prize was deleted successfully.",
            });
        })
        .catch((error) => {
            return res.status(500).json({
                type: "error",
                message: error,
            });
        });
}

/**
 * Returns a prize, receives the prize id via the url.
 *
 * This function returns the prize, gathering the id as a search parameters for such.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response obvject.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/:id', storeController.getPrize);
 */
function getPrize(req, res, next) {
    Prize.findById(req.params.id)
        .then((prize) => {
            if (!prize) {
                return res.status(500).json({
                    type: "error",
                    message: "prize not found",
                });
            }

            res.status(200).json(prize);
        })
        .catch((err) => {
            res.status(500).json({
                type: "error",
                message: err,
            });
        });
}

/**
 * Returns all prizes belonging to a benefactor.
 *
 * This function returns all the prizes, that have a matching benefactorId, the one being sent via the url.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @example
 * // Usage:
 * router.get('benefactor/:id', storeController.getBenefactorPrizes);
 */
function getBenefactorPrizes(req, res, next) {
    Prize.find({
        benefactor: req.params.id,
    })
        .then((users) => {
            if (!users) {
                return res.status(500).json({
                    type: "error",
                    message: "no prize found",
                });
            }

            res.status(200).json(users);
        })
        .catch((error) => {
            res.status(500).json({
                type: "error",
                message: error,
            });
        });
}

/**
 * Get all prizes.
 *
 * This function returns all prizes, having only to parameters, number of elements, and page.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @example
 * // Usage:
 * router.get('all/', storeController.getAllPrizes);
 */
function getAllPrizes(req, res, next) {
    const numberOfPrizes = parseInt(req.query.pageSize, 10);
    const pageNumber = parseInt(req.query.pageNumber, 10);
    const searchQuery = req.query.search || "";

    if (isNaN(numberOfPrizes) || isNaN(pageNumber)) {
        return res.status(400).json({
            type: "error",
            message: "Invalid parameters",
        });
    }

    const skip = pageNumber * numberOfPrizes;
    let searchFilter = {};

    if (searchQuery) {
        searchFilter = {
            $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
            ],
        };
    }

    Prize.find(searchFilter)
        .limit(numberOfPrizes)
        .skip(skip)
        .then((prizes) => {
            return res.status(200).json(prizes);
        })
        .catch((err) => {
            return res.status(500).json({
                type: "error",
                message: err,
            });
        });
}

function upload(req, res, next) {
    try {
        const originalFilename = req.file.originalname;
        const imageUrl = path.join(
            "./uploads/benefactors",
            "/" + req.body.entityId,
            "/prizes/",
            originalFilename
        );

        Prize.findByIdAndUpdate(req.body.prizeId, {
            image: imageUrl,
        })
            .then((updatedPrize) => {
                return res.status(200).json({
                    message: "Prize image uploaded sucessfully",
                    type: "sucess",
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    type: "error",
                    message: "Failed to upload prize image.",
                });
            });
    } catch (error) {
        res.status(500).json({
            type: "error",
            message: "Failed to upload prize image.",
        });
    }
}
module.exports = {
    getAllPrizes,
    getBenefactorPrizes,
    getPrize,
    addPrize,
    editPrize,
    deletePrize,
    redeemPrize,
    upload,
};
