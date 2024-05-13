var express = require('express');
var upload = require('../middleware/multerMiddleware');
var router = express.Router();
var userController = require('../controllers/UserController');
var auth = require('../controllers/AuthenticationController')
// the main page, that contains the datatables' plugin, and all the modals'.
router.get('/all', auth.isAuthenticated, auth.hasRoles(['administrator']), userController.renderUsersTable);
// upload user image
router.post('/upload/',upload.single('image'),userController.uploadImage);

// add user via mongoose middleware, sends mongoose object via POSTs' body via create modals' form
router.post('/', auth.isAuthenticated, userController.addUser)
// edit user via mongoose middleware, sends mongoose object via POSTs' body via update modals' form.
router.put('/:id', auth.isAuthenticated, userController.updateUser)
// get user information via get, sends a request to which is than rendered in frontend via ajax.
router.get('/:id', userController.getUser)
// delete user via mongoose middleware, sends mongoose object via post's body.
router.delete('/:id', auth.isAuthenticated, userController.deleteUser)
// get all users by json (server-side processing route, connects with ajax's create table in frontend)
router.post('/all', userController.getAllUsers);

// route exportation
module.exports = router;
