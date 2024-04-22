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
                benefactor: benefactors
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

/**
 * Retrieves all benefactors with DataTables parameters.
 *
 * This function retrieves all benefactors from the database while considering DataTables parameters
 * such as pagination, sorting, and searching. It constructs MongoDB queries based on the parameters
 * and returns the benefactors data in a format suitable for DataTables.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/add', benefactorController.addBenefactor);
 */
async function getAllBenefactors(req, res, next) {
    console.log("Hello, World!")
    // Retrieve the total number of records in the database
    const totalRecords = await getTotalCount({});

    // Retrieve DataTables parameters from the request
    const {draw, start, length, order, columns} = req.body;
    const search = req.body['search[value]'];

    // Determine the sorting parameters
    if (typeof order === "undefined") {
        var attribute_name = 'name'; // Default sorting column
        var column_sort_order = 'desc'; // Default sorting order
    } else {
        var column_index = req.query.order?.[0]?.['column'];
        var column_name = req.query.columns?.[column_index]?.['data'];
        var column_sort_order = req.query.order?.[0]?.['dir'];
    }

    // Determine the search value
    var search_value = search;

    // Construct the MongoDB query based on the search value
    const query = {};

    if (search_value) {
        query['$text'] = {$search: search_value};
    }

    // Construct sorting options
    const sortOptions = {};
    if (column_name) {
        sortOptions[column_name] = column_sort_order === 'asc' ? 1 : -1;
    } else {
        sortOptions['name'] = column_sort_order === 'asc' ? 1 : -1;
    }

    // Query the database for benefactors
    Benefactor.find(query)
        .sort(sortOptions)
        .skip(parseInt(start))
        .limit(parseInt(length))
        .exec()
        .then((benefactors) => {
            // Respond with DataTables formatted data
            res.json({
                draw: parseInt(draw),
                recordsTotal: totalRecords,
                recordsFiltered: totalRecords,
                data: benefactors,
            });
        })
        .catch((err) => {
            // Handle errors
            res.status(500).json({
                error: err.message,
            });
        });
}


module.exports = {
    renderCreateForm: renderCreateForm,
    renderEditForm: renderEditForm,
    renderBenefactorsTable: renderBenefactorsTable,
    addBenefactor: addBenefactor,
    updateBenefactor: updateBenefactor,
    deleteBenefactor: deleteBenefactor,
    getBenefactor: getBenefactor,
    getAllBenefactors: getAllBenefactors
}