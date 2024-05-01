var express = require('express');
var upload = require('../middleware/multerMiddleware');
var router = express.Router();
var userController = require('../controllers/UserController');
var auth = require('./auth')
// the main page, that contains the datatables' plugin, and all the modals'.
router.get('/all', auth.checkAuthenticated, userController.renderUsersTable);
// add user via mongoose middleware, sends mongoose object via POSTs' body via create modals' form
router.post('/add', userController.addUser)
// upload user image
router.post('/upload/',upload.single('image'),userController.uploadImage);
// edit user via mongoose middleware, sends mongoose object via POSTs' body via update modals' form.
router.post('/update',userController.updateUser)
// get user information via get, sends a request to which is than rendered in frontend via ajax.
router.get('/:id', userController.getUser)
// delete user via mongoose middleware, sends mongoose object via post's body.
router.post('/delete/', userController.deleteUser)
// get all users by json (server-side processing route, connects with ajax's create table in frontend)
router.post('/all-users', userController.getAllUsers);

// route exportation
module.exports = router;
