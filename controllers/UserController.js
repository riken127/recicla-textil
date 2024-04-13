const multer = require('../middleware/multerMiddleware');
const User = require('../models/User');
const fs = require('fs')
const objectMapper = require('../utils/objectMapper');
const {json} = require("express");
function renderCreateForm(req, res, next) {
        res.render('users/create', {});
}

function renderEditForm(req, res, next) {
    User.findById(req.params.id).exec()
        .then((users) => {
            res.render('users/edit', {
                user: user
            });
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: 'danger'
            });
        });
}

function renderUsersTable(req, res, next) {
    User.find().exec()
        .then(() => {
            res.render('users/all', {
                users: users
            });
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: 'danger'
            })
        })
}

function addUser(req, res, next) {
    let user = new User();
    objectMapper.filterAndAssign(user, req.body)
    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: user.firstName + ' was added successfully.'
            }
        })
        .catch((err) => {
            res,json({
                message: err.message,
                type: 'danger'
            });
        });
}

function updateUser(req, res, next) {
    let id = req.params.id;

    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.error(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    let user = new User();
    objectMapper.filterAndAssign(user, req.body)
    User.findByIdAndUpdate(id, user)
        .then(result => {
            req.session.message = {
                type: 'sucess',
                message: user.firstName + ' was updated sucessfully.'
            }
            res.redirect('/all');
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: 'danger'
            });
        });
}

async function deleteUser(req, res, next) {
    var id = req.params.id;
    try {
        const result = await User.findByIdAndDelete(id);
        if (result && result.image) {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch(err) {
                console.error(err);
            }
        }
        req.session.message = {
            type: 'success',
            message: 'User deleted successfully'
        }
        res.redirect('/all')
    } catch (err) {
        res.json({
            message: err.message,
            type: 'danger'
        });
    }
}

module.exports = {
    renderCreateForm: renderCreateForm,
    renderEditForm: renderEditForm,
    renderUsersTable: renderUsersTable,
    addUser: addUser,
    updateUser: updateUser,
    deleteUser: deleteUser
}