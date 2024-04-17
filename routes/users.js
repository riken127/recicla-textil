var express = require('express');
var router = express.Router();
var userController = require('../controllers/UserController');

// user creation form
router.get('/create', userController.renderCreateForm);
// user editing form
router.get('/edit/:id', userController.renderEditForm);
// user table
router.get('/all', userController.renderUsersTable);
// add user via mongoose middleware
router.post('/add', userController.addUser)
// edit user via mongoose middleware
router.post('/update', userController.updateUser)
router.get('/:id', userController.getUser)
// delete user via mongoose middleware
router.post('/delete/', userController.deleteUser)
module.exports = router;
