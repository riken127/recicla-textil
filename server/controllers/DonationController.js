const Donation = require("../models/user/UserActivity");
const User = require("../models/user/User");
const Benefactor = require("../models/benefactor/Benefactor");
const fs = require("fs");
const mailController = require("../controllers/MailController");

/**
 * Renders the table of users.
 *
 * This function queries the database to retrieve a page of users,
 * then renders a table view using the retrieved users data.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/all', userController.renderUsersTable);
 */
function renderDonationsTable(req, res, next) {
  const page = req.body.page || 1;

  Donation.find({ activityType: "donation" })
    .skip((page - 1) * 10)
    .limit(10)
    .exec()
    .then(async (donations) => {
      const users = await User.find();
      const benefactors = await Benefactor.find();

      res.render("donations/table", {
        donations: donations,
        users: users,
        benefactors: benefactors,
        currentRoute: "/donations/all",
        username: req.user.username,
        pfp: req.user.image,
      });
    })
    .catch((err) => {
      res.json({
        message: err.message,
        type: "danger",
      });
    });
}

/**
 * Retrieves all users with DataTables parameters.
 *
 * This function retrieves all users from the database while considering DataTables parameters
 * such as pagination, sorting, and searching. It constructs MongoDB queries based on the parameters
 * and returns the users data in a format suitable for DataTables.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/add', userController.addUser)
 */
async function getAllDonations(req, res, next) {
  const totalRecords = await getTotalCount({});
  const { draw, start, length } = req.body;
  const search_value = req.body["search[value]"];
  const query = { activityType: "donation" };
  const orderBy = req.body["order[0][dir]"];
  const columnIndex = req.body["order[0][column]"];
  const order = orderBy === "asc" ? 1 : -1;
  const columnMapping = {
    0: "timestamp",
    1: "userId",
    2: "details.benefactorId",
  };
  const column = columnMapping[columnIndex];

  if (search_value) {
    query["$text"] = { $search: search_value };
  }

  Donation.find(query)
    .skip(parseInt(start))
    .limit(parseInt(length))
    .sort({ [column]: order })
    .exec()
    .then((donations) => {
      res.json({
        draw: parseInt(draw),
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data: donations,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
}

/**
 * Retrieves the total count of users based on a query.
 *
 * This function retrieves the total count of users from the database
 * based on the provided MongoDB query.
 *
 * @param {Object} query - The MongoDB query object.
 * @returns {Promise<number>} The total count of users.
 */
async function getTotalCount(query) {
  try {
    const count = await Donation.countDocuments(query);

    return count;
  } catch (err) {
    throw err;
  }
}

/**
 * Adds a new user to the database.
 *
 * This function adds a new user to the database based on the data
 * provided in the request body. It creates a new user object with
 * default values for optional fields if they are not provided, then
 * saves the user to the database. If successful, it redirects to the
 * "/all" route. If an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.post('/add', auth.isAuthenticated, userController.addUser);
 */
async function addDonation(req, res, next) {
  const donationData = req.body;
  let donation = new Donation({
    userId: donationData.userId,
    activityType: donationData.activityType,
    timestamp: donationData.timestamp,
    details: donationData.details,
    ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    status: donationData.status,
  });

  donation
    .save()
    .then(async (savedDonation) => {
      const benefactor = await Benefactor.findById(
        savedDonation.details.benefactorId
      );
      const user = await User.findById(savedDonation.userId);
      const userName = user ? `${user.firstName} ${user.lastName}` : "Unknown";

      const benefactorName = benefactor ? benefactor.name : "Unknown";

      const pickpoint = benefactor.pickpoints.id(
        savedDonation.details.pickpointId
      );
      const pickpointAddress = pickpoint
        ? `${pickpoint.street}, ${pickpoint.city}, ${pickpoint.postalCode}, ${pickpoint.country}`
        : "Unknown";

      const email = mailController.createEmail("successEmail", {
        to: req.user.email,
        subject: "Donation Registration",
        text:
          "Dear " +
          req.user.firstName +
          ",\n\n" +
          "We'd like to inform you that the donation has been successfully created. Here are the details for the new donation:\n\n" +
          "- User: " +
          userName +
          "\n" +
          "- Benefactor: " +
          benefactorName +
          "\n" +
          "- Pickpoint Address: " +
          pickpointAddress +
          "\n\n" +
          "This is an automated email. Please do not reply to this email as responses will not be received or read.\n\n" +
          "If you need any further information, we are at your disposal.\n\n" +
          "Best regards,\n\n" +
          "Recicla-Textil Team",
      });

      await email.send();

      res.status(200).json({
        type: "success",
        result: savedDonation._id,
      });
    })
    .catch(async (err) => {
      const email = mailController.createEmail("errorEmail", {
        to: req.user.email,
        subject: "Donation Registration Error",
        text:
          "Dear " +
          req.user.firstName +
          ",\n\n" +
          "An error occurred while creating the donation. Please review and take necessary actions.\n\n" +
          "Error Details:\n" +
          "- Error Code: " +
          err.code +
          "\n" +
          "- Error Message: " +
          err.message +
          "\n\n" +
          "If you need any further assistance, please don't hesitate to contact us.\n\n" +
          "Best regards,\n\n" +
          "Recicla-Textil Team",
      });

      await email.send();

      res.json({
        message: err.message,
        type: "danger",
      });
    });
}

/**
 * Deletes a donation from the database.
 *
 * This function deletes a donation from the database based on the donation ID
 * provided in the request body. It uses `Donation.findByIdAndDelete()` to
 * delete the donation document. If the donation document contains an image, it
 * assumes that it's stored in the file system and deletes the image file
 * using the 'fs' module. If successful, it responds with a JSON success
 * message. If an error occurs, it responds with a JSON error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.delete('/:id', auth.isAuthenticated, donationController.deleteDonation);
 */
async function deleteDonation(req, res, next) {
  try {
    const id = req.params.id;
    const result = await Donation.findByIdAndDelete(id);

    if (result && result.image) {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.error(err);
      }
    }

    const benefactor = await Benefactor.findById(result.details.benefactorId);
    const user = await User.findById(result.userId);
    const userName = user ? `${user.firstName} ${user.lastName}` : "Unknown";

    const benefactorName = benefactor ? benefactor.name : "Unknown";

    const pickpoint = benefactor.pickpoints.id(result.details.pickpointId);
    const pickpointAddress = pickpoint
      ? `${pickpoint.street}, ${pickpoint.city}, ${pickpoint.postalCode}, ${pickpoint.country}`
      : "Unknown";

    const email = mailController.createEmail("successEmail", {
      to: req.user.email,
      subject: "Donation Deletion",
      text:
        "Dear " +
        req.user.firstName +
        ",\n\n" +
        "We'd like to inform you that the donation has been successfully deleted. Here are the details for the deleted donation:\n\n" +
        "- User: " +
        userName +
        "\n" +
        "- Benefactor: " +
        benefactorName +
        "\n" +
        "- Pickpoint Address: " +
        pickpointAddress +
        "\n\n" +
        "This is an automated email. Please do not reply to this email as responses will not be received or read.\n\n" +
        "If you need any further information, we are at your disposal.\n\n" +
        "Best regards,\n\n" +
        "Recicla-Textil Team",
    });

    await email.send();

    res.status(200).json({
      message: "Donation deleted successfully",
      type: "success",
    });
  } catch (err) {
    const email = mailController.createEmail("errorEmail", {
      to: req.user.email,
      subject: "Donation Deletion Error",
      text:
        "Dear " +
        req.user.firstName +
        ",\n\n" +
        "An error occurred while deleting the donation. Please review and take necessary actions.\n\n" +
        "Error Details:\n" +
        "- Error Code: " +
        err.code +
        "\n" +
        "- Error Message: " +
        err.message +
        "\n\n" +
        "If you need any further assistance, please don't hesitate to contact us.\n\n" +
        "Best regards,\n\n" +
        "Recicla-Textil Team",
    });

    await email.send();
    res.status(500).json({
      message: err.message,
      type: "danger",
    });
  }
}

/**
 * Retrieves a donation from the database.
 *
 * This function retrieves a donation from the database based on the donation ID
 * provided in the request parameters. It uses `Donation.findById()` to
 * find the donation document. If the donation document is not found, it
 * responds with a JSON error message. If an error occurs during the retrieval process,
 * it responds with a JSON error message.
 *
 * @param {Object} req - The request object, containing the donation ID in the parameters.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.get('/:id', donationController.getDonation);
 */
function getDonation(req, res, next) {
  const donationId = req.params.id;

  Donation.findById(donationId)
    .then((donation) => {
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }

      res.json(donation);
    })
    .catch((err) => {
      console.error("Error retrieving donation:", err);
      res.status(500).json({ message: "Internal Server Error" });
    });
}

/**
 * Updates a donation in the database.
 *
 * This function updates a donation in the database based on the donation ID
 * and update data provided in the request body. It uses `Donation.findByIdAndUpdate()` to
 * update the donation document. If the donation document is not found, it
 * responds with a JSON error message. If an error occurs during the update process,
 * it responds with a JSON error message.
 *
 * @param {Object} req - The request object, containing the donation ID and update data in the body.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 * @returns {void}
 * @example
 * // Usage:
 * router.put('/:id', auth.isAuthenticated, donationController.updateDonation);
 */
async function updateDonation(req, res, next) {
  const donationId = req.params.id;
  const updateData = {};
  const editableProperties = ["userId"];

  for (const prop of editableProperties) {
    if (req.body.hasOwnProperty(prop) && req.body[prop] !== undefined) {
      updateData[prop] = req.body[prop];
    }
  }

  if (req.body.details) {
    const detailsUpdates = ["benefactorId", "pickpointId"];

    for (const detailProp of detailsUpdates) {
      if (
        req.body.details.hasOwnProperty(detailProp) &&
        req.body.details[detailProp] !== undefined
      ) {
        updateData[`details.${detailProp}`] = req.body.details[detailProp];
      }
    }
  }

  try {
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedDonation) {
      return res.json({
        message: "Donation not found",
        type: "danger",
      });
    }

    const benefactor = await Benefactor.findById(
      updatedDonation.details.benefactorId
    );
    const user = await User.findById(updatedDonation.userId);
    const userName = user ? `${user.firstName} ${user.lastName}` : "Unknown";

    const benefactorName = benefactor ? benefactor.name : "Unknown";

    const pickpoint = benefactor.pickpoints.id(
      updatedDonation.details.pickpointId
    );
    const pickpointAddress = pickpoint
      ? `${pickpoint.street}, ${pickpoint.city}, ${pickpoint.postalCode}, ${pickpoint.country}`
      : "Unknown";

    const email = mailController.createEmail("successEmail", {
      to: req.user.email,
      subject: "Donation Update",
      text:
        "Dear " +
        req.user.firstName +
        ",\n\n" +
        "We'd like to inform you that the donation has been successfully updated. Here are the details for the updated donation:\n\n" +
        "- User: " +
        userName +
        "\n" +
        "- Benefactor: " +
        benefactorName +
        "\n" +
        "- Pickpoint Address: " +
        pickpointAddress +
        "\n\n" +
        "This is an automated email. Please do not reply to this email as responses will not be received or read.\n\n" +
        "If you need any further information, we are at your disposal.\n\n" +
        "Best regards,\n\n" +
        "Recicla-Textil Team",
    });

    await email.send();

    req.session.message = {
      type: "success",
      message: updatedDonation._id + " was updated successfully.",
    };
  } catch (err) {
    const email = mailController.createEmail("errorEmail", {
      to: req.user.email,
      subject: "Donation Update Error",
      text:
        "Dear " +
        req.user.firstName +
        ",\n\n" +
        "An error occurred while updating the donation. Please review and take necessary actions.\n\n" +
        "Error Details:\n" +
        "- Error Code: " +
        err.code +
        "\n" +
        "- Error Message: " +
        err.message +
        "\n\n" +
        "If you need any further assistance, please don't hesitate to contact us.\n\n" +
        "Best regards,\n\n" +
        "Recicla-Textil Team",
    });

    await email.send();

    res.json({ message: err.message, type: "danger" });
  }
}

module.exports = {
  renderDonationsTable: renderDonationsTable,
  getAllDonations: getAllDonations,
  addDonation: addDonation,
  deleteDonation: deleteDonation,
  getDonation: getDonation,
  updateDonation: updateDonation,
};
