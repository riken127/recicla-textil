const multer = require("../middleware/multerMiddleware");
const fs = require("fs");
const objectMapper = require("../utils/objectMapper");
const { json } = require("express");
const Donation = require("../models/user/UserActivity");
const { updateDonation } = require("./DonationController");
const mongoose = require('mongoose');
const path = require('path');

async function getAllItems(req, res, next) {
  const donationId = req.body.donationId;
  const { draw, start, length, order, columns } = req.body;
  const search = req.body["search[value]"];
  // Determine the sorting parameters
  if (typeof order === "undefined") {
    var attribute_name = "details.items.brand"; // Default sorting column
    var column_sort_order = "desc"; // Default sorting order
  } else {
    var column_index = req.query.order?.[0]?.["column"];
    var column_name = req.query.columns?.[column_index]?.["data"];
    var column_sort_order = req.query.order?.[0]?.["dir"];
  }
  // Determine the search value
  var search_value = search;
  // Construct the MongoDB query based on the search value
  const query = { _id: donationId };
  if (search_value) {
    query["details.items.$text"] = { $search: search_value };
  }
  // Construct sorting options
  const sortOptions = {};
  if (column_name) {
    sortOptions[column_name] = column_sort_order === "asc" ? 1 : -1;
  } else {
    sortOptions["details.items.brand"] = column_sort_order === "asc" ? 1 : -1;
  }
  // Query the database for the benefactor
  Donation.findOne(query)
    .exec()
    .then((donation) => {
      // Respond with DataTables formatted data
      res.json({
        draw: parseInt(draw),
        recordsTotal: donation.details.items.length,
        recordsFiltered: donation.details.items.length,
        data: donation.details.items, // Return only the pickpoints
      });
    })
    .catch((err) => {
      // Handle errors
      res.status(500).json({
        error: err.message,
      });
    });
}

function renderItemsTable(req, res, next) {
  const donationId = req.params.id;
  Donation.findById(donationId)
    .exec()
    .then((donation) => {
      if (!donation) {
        return res.status(404).json({
          message: "Donation not found",
          type: "danger",
        });
      }
      res.json(donation.details.items);
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
        type: "danger",
      });
    });
}


function addItem(req, res, next) {
  const donationId = req.params.id;
  const itemData = req.body;
  const weight = parseInt(itemData.weight.value);
  itemData._id = new mongoose.Types.ObjectId();
  if (req.body.photo && !fs.existsSync('./uploads/donations/' + donationId + '/images/')) {
      fs.mkdirSync('./uploads/donations/' + donationId + '/images/', {recursive:true});
  }
  Donation.findByIdAndUpdate(
    donationId,
    {
      // Add the item to the items array
      $push: { "details.items": itemData },
      // Increment the total weight and number of items
      $inc: { "details.totalWeight": weight, "details.numberOfItems": 1 },
    },
    // Return the updated document after the update and run the validators
    { new: true, runValidators: true }
  )
    .then((updateDonation) => {
      res.json({
        message: "Item added successfully",
        donation: updateDonation,
          id: itemData._id
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
}

async function deleteItem(req, res, next) {
     try {
         const donationId = req.params.id;
         const itemId = req.params.idItem;
         const donation = await Donation.findById(donationId);
 
         if (!donation) {
             return res.status(404).json({message: "Donation not found", type: "danger"});
         }
         const itemToRemove = itemId;
 
         if (!itemToRemove) {
             return res.status(404).json({message: "Item not found", type: "danger"});
         }
 
         for (let i = 0; i < donation.details.items.length; i++) {
             if (donation.details.items[i]._id.toString() === itemToRemove) {
                 // Store the weight of the item to be removed
                 const itemWeight = donation.details.items[i].weight.value;
 
                 // Subtract the weight of the item from the total weight
                 donation.details.totalWeight -= itemWeight;
 
                 // Subtract 1 from the number of items
                 donation.details.numberOfItems -= 1;
 
                 donation.details.items.splice(i, 1);
                 console.log("Item found and removed");
                 break;
             }
         }
 
         // Save the donation back to the database.
         await Donation.findByIdAndUpdate(donationId, donation, {new: true});
         res.status(200).json({message: "Item deleted successfully", type: "success"});
     } catch (err) {
         console.error(`Error: ${err}`);
         res.status(500).json({message: err.message, type: "danger"});
     }
 }



 function getItem(req, res, next) {
     // Extract the donation ID from the route parameters
     const donationId = req.params.id; // Assuming the donation ID is passed as a route parameter
     const itemId = req.params.itemId;
 
     // Find the donation in the database by its ID
     Donation.findById(donationId)
         .then((donation) => {
             // If the donation is not found, respond with a 404 error
             if (!donation) {
                 return res.status(404).json({message: "Donation not found"});
             }
             const item = donation.details.items.find(it => it._id.toString() === itemId);
 
             if (!item) {
                 return res.status(404).json({message: "Item not found"});
             }
 
             // Send the item data as JSON response
             res.json(item);
         })
         .catch((err) => {
             // If an error occurs during the retrieval process, log the error
             console.error("Error retrieving donation:", err);
             // Respond with a 500 error
             res.status(500).json({message: "Internal Server Error"});
         });
 }

 function updateItem(req, res, next) {
  // Extract the donation ID from the route parameters
  const donationId = req.params.id; // Assuming the donation ID is passed as a route parameter
  const itemId = req.params.itemId;
  const itemData = req.body;

  console.log("Updating item with ID:", itemId);
  console.log("Updating donation with ID:", donationId);
  console.log("Received data:", itemData);
     if (req.body.photo && !fs.existsSync('./uploads/donations/' + donationId + '/images/')) {
         fs.mkdirSync('./uploads/donations/' + donationId + '/images/', {recursive:true});
     }
  // Find the donation the database its ID
  Donation.findById(donationId)
      .then((donation) => {
          // If the donation is not found, respond with a 404 error
          if (!donation) {
              return res.status(404).json({message: "Donation not found"});
          }
          
          // Find the item in the donation
          const item = donation.details.items.find(item => item._id.toString() === itemId);

          console.log("Item updated successfully:", item);

          // If the item is not found, respond with a 404 error
          if (!item) {
              return res.status(404).json({message: "Item not found"});
          }

          // Update the item with the new data
          item.brand = itemData.brand;
          item.weight = itemData.weight;
          item.size = itemData.size;
          item.type = itemData.type;
          item.photo = itemData.photo;

          // Inform Mongoose that the item has been updated
          donation.markModified('details.items');

          // Update the total weight
          donation.details.totalWeight = donation.details.items.reduce((total, item) => total + Number(item.weight.value), 0);

          // Inform Mongoose that the totalWeight has been updated
          donation.markModified('details.totalWeight');

          // Save the updated donation
          return donation.save();
       })
       .then((updatedDonation) => {
           // Respond with the updated donation
           res.json(updatedDonation);
       })
       .catch((err) => {
           // If an error occurs during the update process, log the error
           console.error("Error updating item:", err);
           // Respond with a 500 error
           if (!res.headersSent) {
               res.status(500).json({message: "Internal Server Error"});
           }
       });
}

function uploadImage(req, res, next) {
        const originalFilename = req.file.originalname;
        const imageUrl = path.join('./uploads/users/', req.body.entityId + '/', originalFilename);

        Donation.findById(req.body.entityId)
            .then((donation) => {
            if (!donation) {
                return res.status(404).json({message: "Donation not found"});
            }

            const item = donation.details.items.find(item => item._id.toString() === req.body.subEntityId);

            if (!item) {
                return res.status(404).json({message: 'Item not found'});
            }

            item.photo = imageUrl;

            donation.markModified('details.items');
            return donation.save();
        })
        .then((updateDonation) => {
            res.json(updateDonation);
        })
            .catch((err) => {
                console.error("Error updating item: ", err);

                if (!res.headersSent) {
                    res.status(500).json({message: 'Internal server error.'});
                }
            })

}
module.exports = {
  getAllItems: getAllItems,
  renderItemsTable: renderItemsTable,
  addItem: addItem,
  deleteItem: deleteItem,
  getItem: getItem,
  updateItem: updateItem,
    uploadImage: uploadImage
};
