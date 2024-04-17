const multer = require('multer');
const Benefactor = require('../models/Benefactor');
const fs   = require('fs');
const objectMapper = require('../utils/objectMapper');
const {json} = require("express");

function renderCreateForm(req, res) {
    res.render('benefactors/create', {});
}

function renderEditForm(req, res, next) {
    Benefactor.findById(req.params.id).exec()
        .then(() => {
            res.render('benefactors/edit', {
                benefactor: benefactor
            });
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: 'danger'
            });
        });
}

function renderBenefactorsTable(req, res, next) {
    Benefactor.find().exec()
        .then(() => {
            res.render('benefactors/all', {
                benefactors: benefactors
            });
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: 'danger'
            });
        });
}

function addBenefactor(req, res, next) {
    var benefactor = new Benefactor();
    objectMapper.filterAndAssign(user, req.body);
    benefactor.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: benefactor.name + ' was added successfully.'
            }
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: 'danger'
            });
        });
}

function updateBenefactor(req, res, next) {
    let id = req.params.id;

    let new_benefactor_banner = "";
    let new_benefactor_logo = "";

    if (req.logo) {
        new_benefactor_logo = req.logo.filename;
        try {
            fs.unlinkSync('./uploads/' + req.params.id);
        } catch (err) {
            console.error(err);
        }
    } else {
        new_benefactor_logo = req.body.old_benefactor_logo;
    }

    if (req.banner) {
        new_benefactor_banner = req.banner.filename;
        try {
            fs.unlinkSync('./uploads/' + req.params.id);
        } catch(err) {
            console.error(err);
        }
    } else {
        new_benefactor_banner = req.body.old_benefactor_banner;
    }

    let benefactor = new Benefactor();
    objectMapper.filterAndAssign(benefactor, req.body);

    Benefactor.findByIdAndUpdate(id, benefactor)
        .then(() => {
            req.session.message = {
                type: 'success',
                message: benefactor.name + ' was added successfully.'
            }
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: 'danger'
            });
        });

}

async function deleteBenefactor(req, res, next) {
    var id = req.params.id;
    try {
        const result = await Benefactor.findByIdAndDelete(id);
        if (result && result.logo || result.banner) {
            if (result.logo) {
                try {
                    fs.unlinkSync('./uploads/' + result.logo);
                } catch(err) {
                    console.error(err);
                }
            }else if (result.banner) {
                try {
                    fs.unlinkSync('./uploads/' + result.banner);
                } catch(err) {
                    console.error(err);
                }
            }
        }

        req.session.message = {
            type: 'success',
            message: result.name + ' was deleted successfully.'
        }
        res.redirect('benefactors/all')
    } catch(err) {
        res.json({
            message: err.mesasge,
            type: 'danger'
        });
    }
}

module.exports = {
    renderCreateForm: renderCreateForm,
    renderEditForm: renderEditForm,
    renderBenefactorsTable: renderBenefactorsTable,
    addBenefactor: addBenefactor,
    updateBenefactor: updateBenefactor,
    deleteBenefactor: deleteBenefactor
}