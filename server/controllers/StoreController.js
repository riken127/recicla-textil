const Prize = require('../models/benefactor/Prize');
const User = require('../models/user/User');
const fs = require('fs');
const path = require('path');
const {Type} = require("mongoose");

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
	let user = req.body.user;
	let prize;

	if (!req.params.prize) {
		return res.status(500).json({
			type: 'error',
			message: 'prize is undefined.'
		})
	}

	if (!user) {
		return res.status(401).json({
			type: 'error',
			message: 'unauthorized'
		});
	}

	User.findById(user._id)
		.then(curr => {
			user = user;
		})
		.catch(err => {
			return res.status(500).json({
				type: 'error',
				message: err
			});
		});

	Prize.findById(req.params.prize)
		.then(curr => {
			prize = curr;
		})
		.catch(err => {
			return res.status(500).json({
				type: 'error',
				message: err
			});
		});

	if (user.points < prize.price) {
		return res.status(500).json({
			type: 'error',
			message: 'unsufficient amount of points to complete the choosen trasaction.'
		});
	}

	user.points -= prize.price;

	User.findByIdAndUpdate(user._id, user, {new: true})
		.then(user => {
			return res.status(200).json({
				type: 'success',
				message: '42X132-X12313-Z1241241-Z124141'
			});
		})
		.catch(err => {
			return res.status(500).json({
				type: 'error',
				message: err
			});
		});
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
		benefactor: req.body.benefactor
	});

	if (!prize.price || !prize.title || !prize.benefactor) {
		return res.status(500).json({
			type: 'error',
			message: 'required fields were not written.'
		});
	}

	prize.save()
		.then(prize => {
			if (
				prize.image &&
				!fs.existsSync('./uploads/benefactor/' + prize.benefactor)
			) {
				fs.mkdirSync(
					'./uploads/benefactor/' + prize.benefactor + '/prizes',
					{recursive: true}
				);
			}

			return res.status(200).json({
				type: 'success',
				message: 'prize was created successfully'
			});
		})
		.catch(error => {
			return res.status(500).json({
				type: 'error',
				result: error
			})
		})
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

	Prize.findByIdAndUpdate(req.params.id, prize, {new: true})
		.then(prize => {
			if (
				prize.image &&
				!fs.existsSync('./uploads/benefactor/' + prize.benefactor)
			) {
				fs.mkdirSync(
					'./uploads/benefactor/' + prize.benefactor + '/prizes',
					{recursive: true}
				)
			}

			if (!prize) {
				return res.status(500).json({
					type: 'error',
					message: 'prize not found'
				});
			}

			return res.status(200).json({
				type: 'success',
				message: prize._id + " was updated successfully."
			});
		})
		.catch(error => {
			return res.status(500).json({
				type: 'error',
				message: error
			})
		})
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
	Prize.findByIdAndDelete(req.params.id, {new: true})
		.then(prize => {
			if (!prize) {
				return res.status(500).json({
					type: 'error',
					message: 'prize not found'
				})
			}

			if (prize.image) {
				try {
					return fs.unlinkSync('./uploads/' + prize.image);
				} catch (err) {
					res.status(500).json({
						type: 'error',
						message: err
					})
				}
			}

			return res.status(200).json({
				type: 'success',
				message: 'prize was deleted successfully.'
			});
		})
		.catch(error => {
			return res.status(500).json({
				type: 'error',
				message: error
			})
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
	Prize.findById({benefactor: req.params.id})
		.then(prize => {
			if (!prize) {
				return res.status(500).json({
					type: 'error',
					message: 'prize not found'
				});
			}

			res.status(200).json(user);
		})
		.catch(err => {
			res.status(500).json({
				type: 'error',
				message: err
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
				benefactor: req.params.id
})
		.then(users => {
			if (!users) {
				return res.status(500).json({
					type: 'error',
					message: 'no prize found'
				});
			}

			res.status(200).json(users);
		})
		.catch(error => {
			res.status(500).json({
				type: 'error',
				message: error
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
 * router.get('all/:n/:p', storeController.getAllPrizes);
 */
async function getAllPrizes(req, res, next) {
	try {
		const elementsPerPage = parseInt(req.params.n);
		const pageNumber = parseInt(req.params.p);

		if (isNaN(elementsPerPage) || isNaN(pageNumber) || elementsPerPage <= 0 || pageNumber < 0) {
			return res.status(400).json({error: 'Invalid parameters'});
		}

		const skip = pageNumber * elementsPerPage;

		const prizes = await Prize.find()
			.limit(elementsPerPage)
			.skip(skip);

		res.status(200).json(prizes);
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getAllPrizes,
	getBenefactorPrizes,
	getPrize,
	addPrize,
	editPrize,
	deletePrize,
	redeemPrize
}
