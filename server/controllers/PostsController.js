const {type} = require("os");
const Benefactor = require("../models/benefactor/Benefactor");
const Post = require("../models/benefactor/BenefactorPost");
const fs = require("fs");
const path = require("path");

/**
 * Adds a new post to the database.
 *
 * This function adds a new post to the database based on the data
 * provided in the request body. It creates a new post object with
 * the provided values and associates it with the corresponding benefactor,
 * then saves the post to the database. If successful, it responds with a
 * JSON containing the ID of the created post. If an error occurs, it responds
 * with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 * @example
 * // Usage:
 * router.post("/:benefactorId/posts/", benefactorController.addPost);
 */
function addPost(req, res) {
    let benefactorId = req.params.benefactorId;
    let postData = req.body;
    let post = new Post({
        benefactorId: benefactorId || "",
        title: postData.title || "",
        content: postData.content || "",
        image: postData.image || "",
        links: postData.links || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });

    post.save()
        .then((post) => {
            if (
                postData.image &&
                !fs.existsSync("./uploads/benefactor/" + benefactorId)
            ) {
                fs.mkdirSync(
                    "./uploads/benefactor/" + benefactorId + "/posts",
                    {recursive: true}
                );
            }

            res.status(200).json({
                type: "success",
                result: post._id,
            });
        })
        .catch((error) => {
            res.status(500).json({
                type: "error",
                result: error,
            });
        });
}

/**
 * Updates an existing post in the database.
 *
 * This function updates an existing post in the database based on the data
 * provided in the request body. It updates the post object with the new values
 * and sets the updatedAt field to the current date and time. If successful, it
 * responds with a JSON message indicating the success. If the post is not found,
 * it responds with an error message. If an error occurs during the process, it
 * responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 * @example
 * // Usage:
 * router.put("/:benefactorId/posts/:postId", benefactorController.updatePost);
 */
function updatePost(req, res) {
    let postId = req.params.postId;
    let benefactorId = req.params.benefactorId;
    let postData = req.body;
    postData.updatedAt = Date.now();

    Post.findByIdAndUpdate(postId, postData, {new: true})
        .then((post) => {
            if (
                req.body.image &&
                !fs.existsSync("./uploads/benefactor/" + benefactorId)
            ) {
                fs.mkdirSync(
                    "./uploads/benefactor/" + benefactorId + "/posts",
                    {recursive: true}
                );
            }

            if (!post) {
                res.json({
                    message: "Post not found",
                    type: "danger",
                });
            }

            res.json({
                type: "success",
                message: post.title + " was updated successfully.",
            });
        })
        .catch((error) => {
            res.status(500).json({
                type: "error",
                result: error,
            });
        });
}

/**
 * Deletes an existing post from the database.
 *
 * This function deletes an existing post from the database based on the ID
 * provided in the request parameters. If the post includes an image, it attempts
 * to delete the associated image file from the server. If successful, it responds
 * with a JSON message indicating the success. If the post is not found, it responds
 * with an error message. If an error occurs during the process, it responds with a
 * JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 * @example
 * // Usage:
 *  router.delete('/:benefactorId/posts/:postId', auth.isAuthenticated, postController.deletePost);
 */
function deletePost(req, res) {
    let postId = req.params.postId;
    let postData = req.body;

    Post.findByIdAndDelete(postId, postData, {new: true})
        .then((post) => {
            if (post.image) {
                try {
                    fs.unlinkSync("./uploads/" + post.image);
                } catch (err) {
                    console.log(err);
                }
            }

            if (!post) {
                res.json({
                    message: "Post not found",
                    type: "danger",
                });
            }

            res.json({
                type: "success",
                message: post.title + " was deleted successfully.",
            });
        })
        .catch((error) => {
            res.status(500).json({
                type: "error",
                result: error,
            });
        });
}

/**
 * Retrieves all posts for a specific benefactor.
 *
 * This function retrieves all posts from the database for a specific benefactor. It constructs a MongoDB query
 * using the benefactorId from the request parameters and returns the posts data in a JSON format.
 *
 * @param {Object} req - The request object. It should contain the following:
 *   - `params.benefactorId`: The ID of the benefactor whose posts are to be retrieved.
 * @param {Object} res - The response object. Used to send the response back to the client.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/:benefactorId/posts/', auth.isAuthenticated, postController.getAllPosts);
 */
function getAllPosts(req, res) {
    let benefactorId = req.params.benefactorId;

    Post.find({benefactorId: benefactorId})
        .then((posts) => {
            res.json(posts);
        })
        .catch((error) => {
            res.status(500).json({
                type: "error",
                result: error,
            });
        });
}

/**
 * Uploads an image for a specific post.
 *
 * This function handles the uploading of an image for a specific post. It constructs the image URL using the benefactorId
 * from the request parameters and the original filename of the uploaded image. It then updates the post with the new image URL.
 *
 * @param {Object} req - The request object. It should contain the following:
 *   - `file.originalname`: The original filename of the uploaded image.
 *   - `params.benefactorId`: The ID of the benefactor who owns the post.
 *   - `body.postId`: The ID of the post to which the image is to be uploaded.
 * @param {Object} res - The response object. Used to send the response back to the client.
 * @returns {void}
 * @example
 */
function uploadImage(req, res) {
    try {
        const originalFilename = req.file.originalname;
        const benefactorId = req.params.benefactorId;
        const imageUrl = paht.join(
            "./uploads/benefactors/",
            benefactorId,
            "/posts/",
            originalFilename
        );

        Post.findByIdAndUpdate(
            req.body.postId,
            {image: imageUrl},
            {new: true}
        )
            .then((post) => {
                res.json({
                    type: "success",
                    message: "Image uploaded successfully.",
                });
            })
            .catch((error) => {
                res.status(500).json({
                    error: "Failed to upload image.",
                });
            });
    } catch (error) {
        res.status(500).json({
            error: "Failed to upload image.",
        });
    }
}

/**
 * Retrieves the latest posts with pagination parameters.
 *
 * This function retrieves the latest posts from the database while considering pagination parameters
 * such as page number and limit per page. It constructs MongoDB queries based on the parameters
 * and returns the posts data in a paginated format.
 *
 * @param {Object} req - The request object. The page number and limit per page should be provided as query parameters.
 * @param {Object} res - The response object.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/posts/all', auth.isAuthenticated, postController.getLastPosts);
 */
function getLastPosts(req, res) {
    let {page = 1, limit = 10} = req.body;

    Post.find()
        .sort({createdAt: -1})
        .skip((page - 1) * limit)
        .limit(limit)
        .then((posts) => {
            res.json(posts);
        })
        .catch((error) => {
            res.status(500).json({
                type: "error",
                result: error,
            });
        });
}

module.exports = {
    addPost: addPost,
    updatePost: updatePost,
    deletePost: deletePost,
    getAllPosts: getAllPosts,
    uploadImage: uploadImage,
    getLastPosts: getLastPosts,
};
