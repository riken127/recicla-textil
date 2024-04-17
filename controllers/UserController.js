const multer = require("../middleware/multerMiddleware");
const User = require("../models/user/User");
const Address = require("../models/Address");
const fs = require("fs");
const objectMapper = require("../utils/objectMapper");
const { json } = require("express");

function renderCreateForm(req, res, next) {
  res.render("users/create", {});
}

function renderEditForm(req, res, next) {
  User.findById(req.params.id)
    .exec()
    .then((users) => {
      res.render("users/edit", {
        user: user,
      });
    })
    .catch((err) => {
      res.json({
        message: err.message,
        type: "danger",
      });
    });
}

function renderUsersTable(req, res, next) {
    const page = req.body.page || 1;

  User.find()
      .skip((page - 1) * 10)
      .limit(10)
    .exec()
    .then((users) => {
      res.render("users/table", {
        users: users,
      });
    })
    .catch((err) => {
      res.json({
        message: err.message,
        type: "danger",
      });
    });
}
/*
function getAllUsers(req, res, next) {
    // Retrieve DataTables parameters from the request
    const { draw, start, length, search, order, columns } = req.body;

    // Construct MongoDB query based on DataTables parameters
    const query = {}; // You can add conditions here based on DataTables parameters

    User.find(query)
        .skip(parseInt(start))
        .limit(parseInt(length))
        .exec()
        .then((users) => {
            // Respond with the retrieved users and other necessary information
            res.json({
                draw: parseInt(draw),
                recordsTotal: users.length, // Total records in the entire dataset (without any filtering)
                recordsFiltered: users.length, // Total records after filtering (if applicable)
                data: users, // Array of users to display on the current page
            });
        })
        .catch((err) => {
            // Handle errors
            res.status(500).json({
                error: err.message,
            });
        });
}*/

async function getAllUsers(req, res, next) {
    const totalRecords = await getTotalCount({});
    // Retrieve DataTables parameters from the request
    const { draw, start, length, order, columns } = req.body;
    const search = req.body['search[value]'];
    if (typeof order === "undefined") {
        var attribute_name = 'firstName';
        var column_sort_order = 'desc';
    } else {
        var column_index = req.query.order?.[0]?.['column'];
        var column_name = req.query.columns?.[column_index]?.['data'];
        var column_sort_order = req.query.order?.[0]?.['dir'];
    }

    // Check if search parameter exists and handle accordingly
    //var search_value = search ? search['text'] : '';
    var search_value = search;
    // Construct MongoDB query based on DataTables parameters
    const query = {};

    if (search_value) {
        query['$text'] = { $search: search_value };
    }

    console.log(req.body);
    // Sort
    const sortOptions = {};
    if (column_name) {
        sortOptions[column_name] = column_sort_order === 'asc' ? 1 : -1;
    } else {
        sortOptions['firstName'] = column_sort_order === 'asc' ? 1 : -1;
    }

    User.find(query)
        .sort(sortOptions)
        .skip(parseInt(start))
        .limit(parseInt(length))
        .exec()
        .then((users) => {
            res.json({
                draw: parseInt(draw),
                recordsTotal:  totalRecords,
                recordsFiltered: totalRecords,
                data: users,
            });
        })
        .catch((err) => {
            // Handle errors
            res.status(500).json({
                error: err.message,
            });
        });
}
async function getTotalCount(query) {
    try {
        const count = await User.countDocuments(query);
        return count;
    } catch (err) {
        throw err;
    }
}

function getUser(req, res, next) {
  const userId = req.params.id; // Assuming the user ID is passed as a route parameter
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user); // Send the user data as JSON response
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Internal Server Error" });
    });
}

function addUser(req, res, next) {
    console.log(req.body);
    const userData = req.body; // Store the request body data
    // Create a new user object with default values
    let user = new User({
        lastName: userData.lastName,
        firstName: userData.firstName,
        username: userData.username || "", // Default to empty string if not provided
        email: userData.email || "", // Default to empty string if not provided
        password: userData.password || "", // Default to empty string if not provided
        image: userData.image || "", // Default to empty string if not provided
        roles: userData.roles || ["user"], // Default to "user" if roles are not provided
        address: userData.address || {}, // Default to empty object if address is not provided
        phone: userData.phone || "", // Default to empty string if not provided
        language: userData.language || "", // Default to empty string if not provided
        notify: userData.notify || false // Default to false if notify is not provided
    });

    user.save()
        .then((savedUser) => {
            req.session.message = {
                type: "success",
                message: savedUser.firstName + " was added successfully.",
            };
            res.redirect("/all");
        })
        .catch((err) => {
            res.json({
                message: err.message,
                type: "danger"
            });
        });
}

function updateUser(req, res, next) {
  const userId = req.body.userId;
  const updateData = {}; // Object to hold changes
    console.log(req.body)
  // Loop through editable user properties (excluding userId)
  const editableProperties = [
    "firstName",
    "lastName",
      "username",
      "email",
      "password",
    "roles",
    "phone",
    "language",
  ];
  for (const prop of editableProperties) {
    if (req.body.hasOwnProperty(prop) && req.body[prop] !== undefined) {
      updateData[prop] = req.body[prop]; // Include only properties present in request body
    }
  }

  // Handle nested properties like address (assuming Address model exists)
  if (req.body.address) {
    const addressUpdates = {};
    for (const addressProp in req.body.address) {
      if (req.body.address.hasOwnProperty(addressProp)) {
        addressUpdates[addressProp] = req.body.address[addressProp];
      }
    }
    updateData.address = addressUpdates;
  }

  User.findByIdAndUpdate(userId, updateData, { new: true }) // Return updated document
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.json({ message: "User not found", type: "danger" });
      }

      req.session.message = {
        type: "success",
        message: updatedUser.firstName + " was updated successfully.",
      };
      res.redirect("/all");
    })
    .catch((err) => {
      res.json({ message: err.message, type: "danger" });
    });
}

async function deleteUser(req, res, next) {
    try {
        const id = req.body.id;
        // Assuming you're using Mongoose for MongoDB interaction
        const result = await User.findByIdAndDelete(id);
        if (result && result.image) {
            // Assuming you're using the 'fs' module for file system operations
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                console.error(err);
            }
        }
        res.status(200).json({
            message: "User deleted successfully",
            type: "success",
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
            type: "danger",
        });
    }
}


module.exports = {
  renderCreateForm: renderCreateForm,
  renderEditForm: renderEditForm,
  renderUsersTable: renderUsersTable,
  addUser: addUser,
  updateUser: updateUser,
  deleteUser: deleteUser,
  getUser: getUser,
    getAllUsers: getAllUsers
};
