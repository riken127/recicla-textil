const multer = require('multer');
const Benefactor = require('../models/Benefactor');
const fs   = require('fs');
const objectMapper = require('../utils/objectMapper');
const {json} = require("express");
const { name } = require('ejs');
const { get } = require('http');

function renderCreateForm(req, res) {
    res.render('benefactors/create', {});
}

function renderEditForm(req, res, next) {
    Benefactor.findById(req.params.id)
        .exec()
        .then((benefactors) => {
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
    Benefactor.find()
        .exec()
        .then(() => {
            res.render('benefactors/table', {
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

function getBenefactor(req, res, next) {
    const benefactorId = req.params.id; // Assuming the Benefactor ID is passed as a route parameter
    Benefactor.findById(benefactorId)
        .then((benefactor) => {
            if (!benefactor) {
                return res.status(404).json({ message: 'Benefactor not found' });
            }
            res.json(benefactor); // Send the Benefactor data as JSON response
        })
        .catch((err) => {
            console.error('Error retrieving Benefactor:', err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
}


function addBenefactor(req, res, next) {
   console.log(req.body);
    const benefactorData = req.body; // Store the request body data
    // Create a new Benefactor instance with default values
    let benefactor = new Benefactor({
        name: benefactorData.name,
        address: benefactorData.address || '',
        username: benefactorData.username || '',
        password: benefactorData.password || '',
        email: benefactorData.email || '',
        phone: benefactorData.phone || '',
        logo: benefactorData.logo || '',
        banner: benefactorData.banner || '',
        pickpoint: benefactorData.pickpoint || '',
    });

    benefactor.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: benefactor.name + ' was added successfully.'
            }
            res.redirect("/all");
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: 'danger'
            });
        });
}

function updateBenefactor(req, res, next) {
    const benefactorId = req.body.benefactorId;
    const benefactorData = {};// Object to hold changes

    //Loop through editable benefactor properties (excluding benefactorId)
    const editableProperties = [
        'name', 'phone', 'logo', 'banner', ];
        for(const property of editableProperties) {
            if(req.body.hasOwnProperty(prop) && req.body[prop] !== undefined) {
                benefactorData[prop] = req.body[prop];
            }
        }

        //Handle nested proreties like adress (assuming Address model exists)
        if(req.body.address) {
            const addressUpdates= {};
            for(const prop in req.body.address) {
                if(req.body.address.hasOwnProperty(prop) ) {
                addressUpdates[prop] = req.body.address[prop];
            }
        }
        benefactorData.address = addressUpdates;
    }

    Benefactor.findByIdAndUpdate(benefactorId, benefactorData, {new: true})
        .then((benefactor) => {
            if(!benefactor) {
                return res.json({message: 'Benefactor not found', type: 'danger'});
            }
            req.session.message = {
                type: 'success',
                message: benefactor.name + ' was updated successfully.'
            }
            res.json("/all");
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: 'danger'
            });
        });
    }


async function deleteBenefactor(req, res, next) {
    
    try {
        const id = req.params.id;
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
    deleteBenefactor: deleteBenefactor,
    getBenefactor: getBenefactor
}