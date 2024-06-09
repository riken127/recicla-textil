const Offer = require('../models/benefactor/Offer');
const path = require('path');
const fs = require('fs');

/**
 * Renders the last n specified offers.
 *
 * This function queries the database to retrieve the last n number of offers in page p.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @return {void}
 * @example
 * // Usage:
 * router.get('all/', offerController.getAllOffers);
 */
function allOffers(req, res, next) {
    const numberOfOffers = parseInt(req.query.pageSize, 10);
    const pageNumber = parseInt(req.query.pageNumber, 10);
    const searchQuery = req.query.search || '';

    if (isNaN(numberOfOffers) || isNaN(pageNumber)) {
        return res.status(400).send({
            type: 'error',
            message: 'Invalid parameters',
        });
    }

    const skip = pageNumber * numberOfOffers;
    let searchFilter = {};

    if (searchQuery) {
        searchFilter = {
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        };
    }

    Offer.find(searchFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numberOfOffers)
        .then(offers => {
            return res.status(200).send(offers);
        })
        .catch(err => {
            next(err);
        });
}

/**
 * Renders all offers of the given benefactor id.
 *
 * This function queries the database for all offers related to a specified benefactor.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @return {void}
 * @example
 * // Usage:
 * router.get('/:id', offerController.getBenefactorOffers);
 */
function getBenefactorOffers(req, res, next) {
    let id = req.params.id;

    Offer.find({benefactor: id})
        .then(offers => {
            if (!offers) {
                return res.status(400).json({
                    type: 'error',
                    message: 'could not find any posts related to the specified id',
                });
            }

            return res.status(200).json(offers);
        })
        .catch(error => {
            return res.status(500).json({
                type: 'error',
                message: error,
            });
        });
}

/**
 * Uplaods an image for a specific offer.
 *
 * This function handles the uploading of an image for a specific post.
 *
 * @param {Object} req - The request object. It should contain the following:
 *   - `file.originalname`: The original filename of the uploaded image.
 *   - `params.benefactorId`: The ID of the benefactor who owns the offer.
 *   - `body.offerId`: The ID of the offer to which the image is to be uplaoded.
 * @param {Object} res - The response object is used to send the response back to the client.
 * @returns {void}
 */
function upload(req, res, next) {
    try {
        const originalFilename = req.file.originalname;
        const imageUrl = path.join(
            "./uploads/benefactors",
            "/" + req.body.entityId,
            "/offers/",
            originalFilename
        );

        Offer.findByIdAndUpdate(req.body.offerId, {
            image: imageUrl
        })
            .then((updatedBenefactor) => {
                return res.json({
                    message: "Offer image uploaded successfully.",
                    type: "success",
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    type: 'error',
                    message: "Failed to upload offer image.",
                });
            });
    } catch (error) {
        res.status(500).json({
            type: 'error',
            message: "Failed to upload offer image.",
        });
    }
}

/**
 * Adds an offer to the specified benefactor.
 *
 * This function accesses the database and creates a new offer for a specified benefactor.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @return {void}
 * @example
 * // Usage:
 * router.post('/:id', offerController.addBenefactorOffer);
 */
function addBenefactorOffer(req, res, next) {
    let id = req.params.id;
    let offerData = req.body;
    let offer = new Offer({
        startDate: offerData.startDate,
        endDate: offerData.endDate,
        benefactor: id,
        title: offerData.title,
        description: offerData.description,
        image: offerData.image || '',
        points: offerData.points,
        active: true
    });

    offer.save()
        .then(offer => {
            if (offerData.image &&
                !fs.existsSync('./uploads/benefactors/' + id + '/offers')
            ) {
                fs.mkdirSync(
                    './uploads/benefactors/' + id + '/offers',
                    {recursive: true}
                );
            }

            return res.status(200).json({
                type: 'success',
                result: offer._id,
            });
        })
        .catch(error => {
            return res.status(500).json({
                type: 'error',
                result: error,
            });
        });
}

/**
 * Edits an offer of the given benefactor id.
 *
 * This function queries the database for the specified offer id, and, if it exists, changes the offer (if the specified parameters in the body of the request are valid).
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @return {void}
 * @example
 * // Usage:
 * router.put('/:id/', offerController.editBenefactorOffer);
 */
function editBenefactorOffer(req, res, next) {
    let benefactorId = req.params.id;
    let offerData = req.body;
    let offer = {
        _id: offerData._id,
        startDate: offerData.startDate,
        endDate: offerData.endDate,
        benefactor: offerData.benefactor,
        title: offerData.title,
        description: offerData.description,
        image: offerData.image || '',
        points: offerData.points || 0,
        active: offerData.active
    };

    Offer.findByIdAndUpdate(offerData._id, offer, {new: true})
        .then(offer => {
            if (
                offerData.image &&
                !fs.existsSync('./uploads/benefactors/' + benefactorId + '/offers')
            ) {
                fs.mkdirSync(
                    './uploads/benefactors/' + benefactorId + '/offers',
                    {recursive: true}
                );
            }else if (fs.existsSync('./uploads/benefactors/' + benefactorId + '/offers/' + offerData._id + '.jpg') &&
                       offerData.image) {
                fs.unlinkSync('./uploads/benefactors/' + benefactorId + '/offers/' + offerData._id + '.jpg');
            }

            if (!offer) {
                return res.status(500).json({
                    message: 'not found',
                    type: 'error',
                });
            }

            return res.status(200).json({
                type: 'success',
                message: offer.title + " was successfully updated",
            });
        })
        .catch(error => {
            return res.status(500).json({
                type: 'error',
                result: error,
            });
        });
}

/**
 * Disables an offer of the given benefactor id.
 *
 * This function queries the database for the specified benefactor id and offer if, if it exists, changes the offer status to disabled.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Funcion} next - The next middleware function in the request-response cycle.
 * @return {void}
 * @example
 * // Usage:
 * router.delete('/:id', offerController.disableBenefactorOffer);
 */
function disableBenefactorOffer(req, res, next) {
    let offerId = req.params.id;

    Offer.findByIdAndUpdate(offerId, {active: false}, {new: true})
        .then(offer => {
            if (!offer) {
                return res.status(404).json({
                    type: 'error',
                    message: 'Offer not found',
                });
            }

            return res.status(200).json({
                offer,
            });
        })
        .catch(error => {
            return res.status(500).json({
                type: 'error',
                message: 'An error occurred while disabling the offer',
                error,
            });
        });
}

module.exports = {
    allOffers,
    addBenefactorOffer,
    editBenefactorOffer,
    getBenefactorOffers,
    disableBenefactorOffer,
    upload
};
