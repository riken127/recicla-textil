var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');

// user creation form
router.get('/create', userController.renderCreateForm);
// user editing form
router.get('/edit/:id', userController.renderEditForm);
// user table
router.get('/all', userController.renderUsersTable);
// add user via mongoose middleware
router.post('/add', userController.addUser)
// edit user via mongoose middleware
router.post('/edit', userController.updateUser)
// delete user via mongoose middleware
router.post('/delete', userController.deleteUser)

module.exports = router;
