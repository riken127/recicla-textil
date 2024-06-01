/**
 * Module representing the BenefactorPost model.
 * @module BenefactorPost
 */

const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Link:
 *       type: object
 *       required:
 *         - link
 *         - title
 *         - onHover
 *       properties:
 *         link:
 *           type: string
 *           description: The URL of the link
 *         title:
 *           type: string
 *           description: The title of the link
 *         onHover:
 *           type: string
 *           description: The text to display on hover
 *       example:
 *         link: "http://example.com"
 *         title: "Example"
 *         onHover: "Go to example.com"
 */
const LinkSchema = new mongoose.Schema({
    link: {type: String, required: true},
    title: {type: String, required: true},
    onHover: {type: String, required: true}
});

/**
 * @swagger
 * components:
 *   schemas:
 *     BenefactorPost:
 *       type: object
 *       required:
 *         - benefactorId
 *         - title
 *         - content
 *         - image
 *       properties:
 *         benefactorId:
 *           type: string
 *           description: The ID of the benefactor
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         image:
 *           type: string
 *           description: The URL of the image
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was last updated
 *         links:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Link'
 *       example:
 *         benefactorId: "60d2f3f4f342f3f4d2f3f4d2"
 *         title: "Post Title"
 *         content: "Post content"
 *         image: "http://example.com/image.jpg"
 */
const BenefactorPostSchema = new mongoose.Schema({
    benefactorId: {type: mongoose.Schema.Types.ObjectId, ref: 'Benefactor', required: true},
    title: {type: String, required: true},
    content: {type: String, required: true},
    image: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    links: [LinkSchema]
});

module.exports = mongoose.model('BenefactorPost', BenefactorPostSchema);
