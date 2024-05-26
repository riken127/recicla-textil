const Post = require("../models/benefactor/BenefactorPost");

/**
 * Adds a new link to an existing post in the database.
 *
 * This function adds a new link to an existing post in the database based on the
 * data provided in the request body. It retrieves the post by ID, then creates a
 * new link object with the provided data. It adds the link to the post's links array
 * and updates the post's `updatedAt` timestamp. If successful, it responds with a JSON
 * success message. If an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/posts/:postId/links', auth.isAuthenticated, linkController.addLink);
 */
function addLink(req, res) {
    const postId = req.params.postId;
    const linkData = req.body;

    Post.findByIdAndUpdate(
        postId,
        { $push: { links: linkData }, updatedAt: Date.now() },
        { new: true }
    )
        .then((post) => {
            res.status(200).json({
                message: "Link added successfully",
                post: post,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Error adding link",
                error: error,
            });
        });
}

/**
 * Deletes a link from an existing post in the database.
 *
 * This function deletes a link from an existing post in the database based on the
 * post ID and link ID provided in the request parameters. It retrieves the post by ID,
 * checks if the link exists within the post's links array, removes the link if it exists,
 * and saves the updated post back to the database. If successful, it responds with a JSON
 * success message. If an error occurs or if the post or link is not found, it responds with a
 * JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.delete('/posts/:postId/links/:linkId', auth.isAuthenticated, linkController.deleteLink);
 */
async function deleteLink(req, res) {
    try {
        const postId = req.params.postId;
        const linkId = req.params.linkId;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                type: "danger",
            });
        }

        if (!linkId) {
            return res.status(404).json({
                message: "Link not found",
                type: "danger",
            });
        }

        const linkExists = post.links.some(
            (link) => link._id.toString() === linkId
        );

        if (!linkExists) {
            return res.status(404).json({
                message: "No links found",
                type: "danger",
            });
        }

        post.links = post.links.filter(
            (link) => link._id.toString() !== linkId
        );

        await post.save();

        res.status(200).json({
            message: "Link deleted successfully",
            post: post,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting link",
            error: error,
        });
    }
}

/**
 * Updates a link in an existing post in the database.
 *
 * This function updates a link in an existing post in the database based on the
 * post ID and link ID provided in the request parameters, and the updated link
 * data provided in the request body. It retrieves the post by ID, checks if the
 * link exists within the post's links array, updates the link with the new data,
 * and saves the updated post back to the database. If successful, it responds with
 * a JSON success message. If an error occurs or if the post or link is not found, it
 * responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.put('/posts/:postId/links/:linkId', auth.isAuthenticated, linkController.updateLink);
 */
function updateLink(req, res) {
    const postId = req.params.postId;
    const linkId = req.params.linkId;
    const linkData = req.body;

    Post.findById(postId)
        .then((post) => {
            if (!post) {
                return res.status(404).json({
                    message: "Post not found",
                    type: "danger",
                });
            }

            const link = post.links.id(linkId);

            if (!link) {
                return res.status(404).json({
                    message: "Link not found",
                    type: "danger",
                });
            }

            link.set(linkData);

            return post.save();
        })
        .then((post) => {
            res.status(200).json({
                message: "Link updated successfully",
                post: post,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Error updating link",
                error: error,
            });
        });
}

module.exports = {
    addLink: addLink,
    deleteLink: deleteLink,
    updateLink: updateLink,
};
