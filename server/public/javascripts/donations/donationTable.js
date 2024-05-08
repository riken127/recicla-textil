//Variable to store current donation ID
let currentDonationId;

//  Document Ready Function
$(document).ready(function () {
  var dataTableOptions = {
    layout: {
      //Layout for the table
      topStart: {
        buttons: [
          {
            text: '<i class="fas fa-plus"></i> &nbsp; New Donation',
            className: "btn btn-primary",
            action: function (e, dt, node, config) {
              $("#createModal").modal("show"); // Open the create modal when the button is clicked
            },
          },
        ],
      },
    },
    // Table Options
    processing: true,
    searchable: true,
    serverSide: true,
    ajax: {
      //Ajax call to get the data from the server
      url: "http://localhost:3000/donations/all-donations",
      type: "POST",
      data: function (d) {
        return d;
      },
    },
    //Columns for the table
    columns: [
      {
        data: "timestamp",
        title: "Creation Date",
        render: function (data, type, row) {
          return new Date(data).toLocaleString().split(" GMT")[0];
        },
      },
      {
        data: "userId",
        title: "User ID",
      },
      {
        data: "details.benefactorId",
        title: "Benefactor ID",
      },
      {
        data: "details.items",
        title: "Items",
        className: "text-center",
        render: function (data, type, row) {
          //Check if the donation has items or not and display the appropriate icon
          if (data.length > 0) {
            return `<a href="#" class="expand-button" onclick="itemsModal('${row._id}')" title="This Donation has ${data.length} Items!"><i class="fa-solid fa-up-right-and-down-left-from-center px-4 align-items-center"></i></a>`;
          } else {
            return `<a href="#" class="expand-button" onclick="itemsModal('${row._id}')" title="This Donation has ${data.length} Items!"><i class="fa-solid fa-triangle-exclamation px-4 align-items-center"></i></a>`;
          }
        },
      },
      {
        data: "details",
        title: "Details",
        className: "text-center",
        render: function (data, type, row) {
          return `<a href="#" class="expand-button" onclick="openDetailsModal('${row._id}')" title="See Details"><i class="fa-solid fa-circle-info px-4 align-items-center"></i></a>`;
        },
      },
      {
        data: null,
        title: "Actions",
        className: "text-center",
        render: function (data, type, row) {
          return `<a href="#" class="edit-button" onclick="openEditModal('${row._id}')"><i class="fa-solid fa-pen-to-square "></i></a>&nbsp;<a href="#" onclick="openDeleteModal('${row._id}')"><i class="fa-solid fa-trash"></i></a>`;
        },
      },
    ],
    paging: true,
    pagingType: "full_numbers",
  };

  // Function to open the User Modal
  $("#openUserModalButton").click(function () {
    $("#createModal").modal("hide");
    $("#userModal").modal("show");
  });

  // Function to open the Pickpoint Modal
  $("#openPickpointModalButton").click(function () {
    $("#createModal").modal("hide");
    $("#pickpointModal").modal("show");
  });

  // Function to open the Benefactor Modal
  $("#openBenefactorModalButton").click(function () {
    $("#createModal").modal("hide");
    $("#benefactorModal").modal("show");
  });

  // Function to open the Edit User Modal
  $("#openEditUserModalButton").click(function () {
    $("#editModal").modal("hide");
    $("#editUserModal").modal("show");
  });

  // Function to open the Edit Pickpoint Modal
  $("#openEditPickpointModalButton").click(function () {
    $("#editModal").modal("hide");
    $("#editPickpointModal").modal("show");
  });

  // Function to open the Edit Benefactor Modal
  $("#openEditBenefactorModalButton").click(function () {
    $("#editModal").modal("hide");
    $("#editBenefactorModal").modal("show");
  });

  var table = $("#donationsTable").DataTable(dataTableOptions);

  // Function to open the Details modal
  window.openDetailsModal = (donationId) => {
    currentDonationId = donationId; // Set the global variable to the current donation ID

    if (donationId) {
      $.ajax({
        url: `/donations/${donationId}`,
        method: "GET",
        success: async function (response) {
          const user = await getUser(response.userId);
          const benefactor = await getBenefactor(response.details.benefactorId);
          const benefactorId = benefactor._id;
          const pickpoint = await getPickpoint(
            response.details.pickpointId,
            benefactorId
          );

          // Populate user details
          $("#detailsUserName").val(user.firstName + " " + user.lastName);
          $("#detailsUserUsername").val(user.username);
          $("#detailsUserPhoneNumber").val(user.phone);
          $("#detailsUserAddress").val(
            user.address.street +
              ", " +
              user.address.city +
              ", " +
              user.address.country +
              ", " +
              user.address.postalCode
          );
          //Populate benefactor details
          $("#detailsBenefactorName").val(benefactor.name);
          $("#detailsBenefactorPhone").val(benefactor.phone);
          //Populate pickpoint details
          $("#detailsPickpointAddress").val(
            pickpoint.street +
              ", " +
              pickpoint.city +
              ", " +
              pickpoint.country +
              ", " +
              pickpoint.postalCode
          );
          //Populate items details
          $("#itemCount").val(response.details.numberOfItems);
          $("#totalWeight").val(response.details.totalWeight);
        },
      });

      if (!$.fn.DataTable.isDataTable("#itemsDetailsTable")) {
        // Initialize DataTables if not already initialized
        $("#itemsDetailsTable").DataTable({
          ajax: {
            url: `/donations/${donationId}/items/all`,
            dataSrc: "",
          },
          columns: [
            { data: "brand", title: "Brand" },
            {
              data: null,
              title: "Weight",
              render: function (data, type, row) {
                return data.weight.value + " " + data.weight.unit;
              },
            },
            { data: "size", title: "Size" },
            { data: "type", title: "Type" },
            { data: "photo", title: "Photo" },
          ],
        });
      } else {
        // If DataTables is already initialized, just reload the data
        $("#itemsDetailsTable")
          .DataTable()
          .ajax.url(`/donations/${donationId}/items/all`)
          .load();
      }

      $("#detailsModal").modal("show");
      $("#itemsModal").on("hidden.bs.modal", function (e) {
        // Use the DataTables API to clear the table
        $("#itemsDetailsTable").DataTable().clear().draw();
        $("#donationsTable").DataTable().ajax.reload();
      });
    }
  };

  // Form submission event handler for create modal
  $("#createDonationForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission
    // Collect all items from the table
    if (!$("#createUserId").val()) {
      $("#errorMessage").text("Error: User is required.");
      $("#errorAlert")
        .addClass("show")
        .removeClass("fade")
        .css("display", "block");
      return;
    }
    if (!$("#createBenefactorId").val()) {
      $("#errorMessage").text("Error: Benefactor is required.");
      $("#errorAlert")
        .addClass("show")
        .removeClass("fade")
        .css("display", "block");
      return;
    }
    if (!$("#createDonationPickpointId").val()) {
      $("#errorMessage").text("Error: PickPoint is required.");
      $("#errorAlert")
        .addClass("show")
        .removeClass("fade")
        .css("display", "block");
      return;
    }

    var items = [];
    // Create the Donation Data object
    const donationData = {
      userId: $("#createUserId").val(), // Set the user ID
      activityType: "donation", //set the activity type to donation
      timestamp: new Date($("#createTimestamp").val()), // set the timestamp to the current date
      details: {
        benefactorId: $("#createBenefactorId").val(), // Set the benefactor ID
        pickpointId: $("#createDonationPickpointId").val(), // Set the pickpoint ID
        items: items,
        totalWeight: 0, // Set the total weight to 0
        numberOfItems: 0, // Set the number of items to 0
      },
      ip: 0,
    };
    $("#createUserId").val("");
    $("#createBenefactorId").val("");
    $("#createDonationPickpointId").val("");
    // Send AJAX request
    $.ajax({
      url: "/donations/add",
      type: "POST",
      data: JSON.stringify(donationData),
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        $("#createModal").modal("hide");
        $("#createDonationForm")[0].reset();
        window.itemsModal(response.result);
        table.ajax.reload();
      },
    });
    $("#pickpointInfo").attr("hidden", "");
    table.ajax.reload();
  });

  // Function to open the Edit modal and populate the form fields with the existing data
  window.openEditModal = async (donationId) => {
    if (donationId) {
      $.ajax({
        url: `/donations/` + donationId,
        method: "GET",
        success: async function (response) {
          try {
            // User ID and Username
            const userId = response.userId;
            const user = await getUser(userId);
            const userUsername = user.username;
            // Benefactor ID and Name
            const benefactorId = response.details.benefactorId;
            const benefactor = await getBenefactor(benefactorId);
            const benefactorName = benefactor.name;
            // Pickpoint ID and Address
            const pickpointId = response.details.pickpointId;
            const pickpoint = await getPickpoint(pickpointId, benefactorId);
            const country = pickpoint.country;
            const city = pickpoint.city;
            const street = pickpoint.street;
            const postalCode = pickpoint.postalCode;
            // Populate the form fields with the existing data
            $("#editDonationId").val(response._id);
            $("#editUserId").val(userId);
            $("#editUserName").val(userUsername);
            $("#editBenefactorId").val(benefactorId);
            $("#editBenefactorName").val(benefactorName);
            $("#editDonationPickpointId").val(pickpointId);
            $("#editActivityType").val(response.activityType);
            $("#editTimestamp").val(response.timestamp);
            // Address fields
            $("#editPickpointAddress").val(
              `${street}, ${city}, ${country}, ${postalCode}`
            );
            // Open the edit modal
            $("#editModal").modal("show");
          } catch (error) {
            console.error("Error:", error);
          }
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
          console.error("Status:", status);
          console.error("Response text:", xhr.responseText);
          console.error("HTTP status code:", xhr.status);
          console.error("Response headers:", xhr.getAllResponseHeaders());
        },
      });
    } else {
      console.error("Donation ID is missing.");
    }
  };

  // Form submission event handler for edit modal
  $("#editDonationForm").submit(function (event) {
    event.preventDefault();
    // Collect all items from the table
    const donationData = {
      donationId: $("#editDonationId").val(),
      userId: $("#editUserId").val(),
      details: {
        benefactorId: $("#editBenefactorId").val(),
        pickpointId: $("#editDonationPickpointId").val(),
      },
    };
    const jsonData = JSON.stringify(donationData);
    // Send AJAX request to update donation
    $.ajax({
      url: "/donations/update",
      method: "POST",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        // Handle successful update (e.g., close modal, refresh table)
        $("#editModal").modal("hide");
        table.ajax.reload();
      },
      error: function (xhr, status, error) {
        console.error("Error updating donation:", error);
      },
    });
    $("#editModal").modal("hide");  
    table.ajax.reload();
  });

  // Function to open the Delete modal
  window.openDeleteModal = (donationId) => {
    $("#deleteModal").modal("show");
    $("#confirmDelete").data("donationid", donationId);
  };
  // Click event listener for delete confirmation button
  $(document).on("click", "#confirmDelete", function () {
    var donationId = $(this).data("donationid");
    if (donationId) {
      // If donation ID is provided, make an AJAX request to delete donation
      $.ajax({
        url: "/donations/delete",
        method: "POST",
        data: JSON.stringify({
          id: donationId,
        }),
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
          // Handle successful deletion (e.g., close modal, refresh table)
          $("#deleteModal").modal("hide");
          table.ajax.reload();
        },
        error: function (xhr, status, error) {
          console.error("Error deleting donation:", error);
        },
      });
    } else {
      console.error("Donation ID is missing.");
    }
  });

  // Retrieve Pickpoint by ID
  function getPickpoint(PickpointId, BenefactorId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/benefactors/${BenefactorId}/pickpoints/${PickpointId}`,
        method: "GET",
        success: function (response) {
          resolve(response);
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);
          reject(error);
        },
      });
    });
  }

  // Retrieve Benefactor by ID
  function getBenefactor(id) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/benefactors/${id}`,
        method: "GET",
        success: function (response) {
          resolve(response);
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);
          reject(error);
        },
      });
    });
  }

  // Retrieve User by ID
  function getUser(id) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/users/${id}`,
        method: "GET",
        success: function (response) {
          var user = response;
          resolve(user);
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);
          reject(error);
        },
      });
    });
  }
});

// Script to select User to Create a Donation

$(document).ready(function () {
  $("#userModal").on("show.bs.modal", function () {
    $("body").addClass("test");
    $(".modal-backdrop").last().css("z-index", 1051);
    $.ajax({
      url: "/users/all-users",
      type: "POST",
      data: { length: 10 },
      success: function (users) {
        $("#userContainer").empty();
        users.data.forEach((user) => {
          $("#userContainer").append(`
          <div class="user-container">
              <div class="d-flex align-items-center justify-content-between mt-2">
                  <div>
                      <h5>${user.username}</h5>
                      <h6>${user.firstName} ${user.lastName}</h6>
                      <p>${user._id}</p>
                  </div>
                  <button class="btn btn-primary select-create-user" data-id="${user._id}" >Select</button>
              </div>
          </div>
      `);
        });
      },
    });
  });

  $("#userModal").on("hidden.bs.modal", function () {
    $("body").removeClass("test");
    $(".modal-backdrop").last().css("z-index", 1040);
    $("#createModal").modal("show");
  });
});

$("#userSearch").on("input", function () {
  var searchValue = $(this).val();
  $.ajax({
    url: "/users/all-users",
    type: "POST",
    data: { "search[value]": searchValue, length: 10 },
    success: function (users) {
      $("#userContainer").empty();
      users.data.forEach((user) => {
        $("#userContainer").append(`
        <div class="user-container">
            <div class="d-flex align-items-center justify-content-between mt-2">
                <div>
                    <h5>${user.username}</h5>
                    <h6>${user.firstName} ${user.lastName}</h6>
                    <p>${user._id}</p>
                </div>
                <button class="btn btn-primary select-create-user" data-id="${user._id}" >Select</button>
            </div>
        </div>
    `);
      });
    },
  });
});

$(document).ready(function () {
  $("body").on("click", ".select-create-user", function () {
    // Get the user information
    var userId = $(this).data("id");
    var userName = $(this).parent().find("h5").text();
    // Set the user information in the input fields
    $("#createUserId").val(userId);
    $("#createUserName").val(userName);
    // Hide the user modal
    $("#userModal").modal("hide");
  });
});

// Script to select Benefactor to Create a Donation

$(document).ready(function () {
  $("#benefactorModal").on("show.bs.modal", function () {
    $("body").addClass("test");
    $(".modal-backdrop").last().css("z-index", 1051);
    $.ajax({
      url: "/benefactors/all-benefactors",
      type: "POST",
      data: { length: 10 },
      success: function (benefactors) {
        $("#benefactorContainer").empty();
        benefactors.data.forEach((benefactor) => {
          if (benefactor.pickpoints.length > 0) {
            $("#benefactorContainer").append(`
                    <div class="benefactor-container">
                        <div class="d-flex align-items-center justify-content-between mt-2">
                            <div>
                                <h5>${benefactor.name}</h5>
                                <p>${benefactor._id}</p>
                            </div>
                            <button class="btn btn-primary select-create-benefactor" data-id="${benefactor._id}">Select</button>
                        </div>
                    </div>
                `);
          }
        });
      },
    });
  });

  $("#benefactorModal").on("hidden.bs.modal", function () {
    $("body").removeClass("test");
    $(".modal-backdrop").last().css("z-index", 1040);
  });
});

$("#benefactorSearch").on("input", function () {
  var searchValue = $(this).val();
  $.ajax({
    url: "/benefactors/all-benefactors",
    type: "POST",
    data: { "search[value]": searchValue, length: 10 },
    success: function (benefactors) {
      $("#benefactorContainer").empty();
      benefactors.data.forEach((benefactor) => {
        if (benefactor.pickpoints.length > 0) {
          $("#benefactorContainer").append(`
                  <div class="benefactor-container">
                      <div class="d-flex align-items-center justify-content-between mt-2">
                          <div>
                              <h5>${benefactor.name}</h5>
                              <p>${benefactor._id}</p>
                          </div>
                          <button class="btn btn-primary select-create-benefactor" data-id="${benefactor._id}">Select</button>
                      </div>
                  </div>
              `);
        }
      });
    },
  });
});

$(document).ready(function () {
  $("body").on("click", ".select-create-benefactor", function () {
    // Get the benefactor information
    var benefactorId = $(this).data("id");
    var benefactorName = $(this).parent().find("h5").text();
    // Set the benefactor information in the input fields
    $("#createBenefactorId").val(benefactorId);
    $("#createBenefactorName").val(benefactorName);
    // Hide the benefactor modal and show the pickpoint modal
    $("#benefactorModal").modal("hide");
    $("#pickpointModal").modal("show");
    $("#pickpointInfo").show();
  });
});

// Select Pickpoint to Create a Donation
$(document).ready(function () {
  $(".select-pickPoint").click(function () {
    var street = $(this).data("street");
    var city = $(this).data("city");
    var postalCode = $(this).data("postalcode");
    var country = $(this).data("country");
    var pickpointId = $(this).data("_id");

    $("#createStreet").val(street);
    $("#createCity").val(city);
    $("#createPostalCode").val(postalCode);
    $("#createCountry").val(country);
    $("#createDonationPickpointId").val(pickpointId);

    $("#pickpointModal").modal("hide");
    $("#pickpointInfo").show();
  });

  $("#pickpointModal").on("hidden.bs.modal", function (e) {
    $("#createModal").modal("show");
  });

  $("#pickpointSearch").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $(".pickPoint-container").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});

// Script to select pickpoint to create a Donation

$(document).ready(function () {
  $("#pickpointModal").on("show.bs.modal", function () {
    $("body").addClass("test");
    $(".modal-backdrop").last().css("z-index", 1051);
    $("#createModal").modal("hide");
    var benefactorId = $("#createBenefactorId").val(); // Get the benefactor ID from the input field
    $.ajax({
      url: `/benefactors/${benefactorId}/pickpoints/all-pickpoints`,
      type: "POST",
      data: {
        length: 10,
        benefactorId: benefactorId, // Send the benefactorId in the request body
      },
      success: function (pickpoints) {
        $("#pickpointContainer").empty();
        pickpoints.data.forEach((pickpoint) => {
          // Use .data
          if (pickpoint && typeof pickpoint === "object") {
            // Check if pickpoint is not null and is an object
            $("#pickpointContainer").append(`
              <div class="pickpoint-container">
                  <div class="d-flex align-items-center justify-content-between mt-2">
                      <div>
                          <h5>${pickpoint.street}, ${pickpoint.city}</h5>
                          <p>${pickpoint.postalCode}, ${pickpoint.country}</p>
                      </div>
                      <button class="btn btn-primary select-pickpoint" data-id="${pickpoint._id}">Select</button>
                  </div>
              </div>
          `);
          }
        });
      },
    });
  });

  $("#pickpointModal").on("hidden.bs.modal", function () {
    $("body").removeClass("test");
    $(".modal-backdrop").last().css("z-index", 1040);
    $("#createModal").modal("show");
  });
});

$("#pickpointSearch").on("input", function () {
  var searchValue = $(this).val();
  var benefactorId = $("#createBenefactorId").val(); // Get the benefactor ID from the input field
  $.ajax({
    url: `/benefactors/${benefactorId}/pickpoints/all-pickpoints`,
    type: "POST",
    data: {
      "search[value]": searchValue,
      length: 10,
      benefactorId: benefactorId, // Send the benefactorId in the request body
    },
    success: function (pickpoints) {
      $("#pickpointContainer").empty();
      pickpoints.data.forEach((pickpoint) => {
        // Use .data
        if (pickpoint && typeof pickpoint === "object") {
          // Check if pickpoint is not null and is an object
          $("#pickpointContainer").append(`
              <div class="pickpoint-container">
                  <div class="d-flex align-items-center justify-content-between mt-2">
                      <div>
                          <h5>${pickpoint.street}, ${pickpoint.city}</h5>
                          <p>${pickpoint.postalCode}, ${pickpoint.country}</p>
                      </div>
                      <button class="btn btn-primary select-pickpoint" data-id="${pickpoint._id}">Select</button>
                  </div>
              </div>
          `);
        }
      });
    },
  });
});

$(document).ready(function () {
  $("body").on("click", ".select-pickpoint", function () {
    var pickpointId = $(this).data("id");
    var pickpointStreet = $(this).parent().find("h5").text();
    var pickpointCountry = $(this)
      .parent()
      .find("p")
      .text()
      .split(",")[1]
      .trim(); // Get the country
    var pickpointCity = $(this).parent().find("h5").text().split(",")[1].trim(); // Get the city
    var pickpointPostalCode = $(this)
      .parent()
      .find("p")
      .text()
      .split(",")[0]
      .trim(); // Get the postal code

    $("#createDonationPickpointId").val(pickpointId); // Set the pickpoint ID

    $("#createPickpointAddress").val(
      `${pickpointStreet}, ${pickpointCity}, ${pickpointPostalCode}, ${pickpointCountry}`
    ); // Set the pickpoint address in the input field

    $("#pickpointInfo").removeAttr("hidden");
    $("#pickpointModal").modal("hide");
  });
});

// Script to select User to Edit a Donation
$(document).ready(function () {
  $("#editUserModal").on("show.bs.modal", function () {
    $("body").addClass("test");
    $(".modal-backdrop").last().css("z-index", 1051);
    $.ajax({
      url: "/users/all-users",
      type: "POST",
      data: { length: 10 },
      success: function (users) {
        $("#editUserContainer").empty();
        users.data.forEach((user) => {
          $("#editUserContainer").append(`
        <div class="user-container">
            <div class="d-flex align-items-center justify-content-between mt-2">
                <div>
                    <h5>${user.username}</h5>
                    <h6>${user.firstName} ${user.lastName}</h6>
                    <p>${user._id}</p>
                </div>
                <button class="btn btn-primary select-edit-user" data-id="${user._id}">Select</button>
            </div>
        </div>
    `);
        });
      },
    });
  });

  $("#editUserModal").on("hidden.bs.modal", function () {
    $("body").removeClass("test");
    $(".modal-backdrop").last().css("z-index", 1040);
    $("#editModal").modal("show");
  });
});

// Search for users
$("#editUserSearch").on("input", function () {
  var searchValue = $(this).val();
  $.ajax({
    url: "/users/all-users",
    type: "POST",
    data: { "search[value]": searchValue, length: 10 },
    success: function (users) {
      $("#editUserContainer").empty();
      users.data.forEach((user) => {
        $("#editUserContainer").append(`
      <div class="user-container">
          <div class="d-flex align-items-center justify-content-between mt-2">
              <div>
                  <h5>${user.username}</h5>
                  <h6>${user.firstName} ${user.lastName}</h6>
                  <p>${user._id}</p>
              </div>
              <button class="btn btn-primary select-edit-user" data-id="${user._id}">Select</button>
          </div>
      </div>
  `);
      });
    },
  });
});

$(document).ready(function () {
  $("body").on("click", ".select-edit-user", function () {
    // Get the user information
    var userId = $(this).data("id");
    var userName = $(this).parent().find("h5").text();
    // Set the user information in the input fields
    $("#editUserId").val(userId);
    $("#editUserName").val(userName);
    // Hide the user modal
    $("#editUserModal").modal("hide");
  });
});

// Script to select Benefactor to Edit a Donation
$(document).ready(function () {
  $("#editBenefactorModal").on("show.bs.modal", function () {
    $("body").addClass("test");
    $(".modal-backdrop").last().css("z-index", 1051);
    $.ajax({
      url: "/benefactors/all-benefactors",
      type: "POST",
      data: {  length: 10 },
      success: function (benefactors) {
        $("#editBenefactorContainer").empty();
        benefactors.data.forEach((benefactor) => {
          if (benefactor.pickpoints.length > 0) {
            $("#editBenefactorContainer").append(`
            <div class="benefactor-container">
                <div class="d-flex align-items-center justify-content-between mt-2">
                    <div>
                        <h5>${benefactor.name}</h5>
                        <p>${benefactor._id}</p>
                    </div>
                    <button class="btn btn-primary select-edit-benefactor" data-id="${benefactor._id}">Select</button>
                </div>
            </div>
        `);
          }
        });
      },
    });
  });

  $("#editBenefactorModal").on("hidden.bs.modal", function () {
    $("body").removeClass("test");
    $(".modal-backdrop").last().css("z-index", 1040);
  });
});

$("#editBenefactorSearch").on("input", function () {
  var searchValue = $(this).val();
  $.ajax({
    url: "/benefactors/all-benefactors",
    type: "POST",
    data: { "search[value]": searchValue, length: 10 },
    success: function (benefactors) {
      $("#editBenefactorContainer").empty();
      benefactors.data.forEach((benefactor) => {
        if (benefactor.pickpoints.length > 0) {
          $("#editBenefactorContainer").append(`
          <div class="benefactor-container">
              <div class="d-flex align-items-center justify-content-between mt-2">
                  <div>
                      <h5>${benefactor.name}</h5>
                      <p>${benefactor._id}</p>
                  </div>
                  <button class="btn btn-primary select-edit-benefactor" data-id="${benefactor._id}">Select</button>
              </div>
          </div>
      `);
        }
      });
    },
  });
});

$(document).ready(function () {
  $("body").on("click", ".select-edit-benefactor", function () {
    // Get the benefactor information
    var benefactorId = $(this).data("id");
    var benefactorName = $(this).parent().find("h5").text();
    // Set the benefactor information in the input fields
    $("#editBenefactorId").val(benefactorId);
    $("#editBenefactorName").val(benefactorName);
    // Hide the benefactor modal and show the pickpoint modal
    $("#editBenefactorModal").modal("hide");
    $("#editModal").modal("hide");
    $("#editPickpointModal").modal("show");
  });
});

// Select Pickpoint to Edit a Donation

$(document).ready(function () {
  $(".select-edit-pickPoint").click(function () {
    // Get the pickpoint information
    var street = $(this).data("street");
    var city = $(this).data("city");
    var postalCode = $(this).data("postalcode");
    var country = $(this).data("country");
    var pickpointId = $(this).data("_id");
    // Set the pickpoint information in the input fields
    $("#editStreet").val(street);
    $("#editCity").val(city);
    $("#editPostalCode").val(postalCode);
    $("#editCountry").val(country);
    $("#editDonationPickpointId").val(pickpointId);
    // Hide the pickpoint modal and show the pickpoint information
    $("#editPickpointModal").modal("hide");
  });
  $("#editPickpointModal").on("hidden.bs.modal", function (e) {
    $("#editModal").modal("show");
  });
  $("#editPickpointSearch").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $(".pickPoint-container").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});

// Script to select pickpoint to edit a Donation
$(document).ready(function () {
  $("#editPickpointModal").on("show.bs.modal", function () {
    $("body").addClass("test");
    $(".modal-backdrop").last().css("z-index", 1051);
    var benefactorId = $("#editBenefactorId").val(); // Get the benefactor ID from the input field
  $.ajax({
    url: `/benefactors/${benefactorId}/pickpoints/all-pickpoints`,
    type: "POST",
    data: {
      length: 10,
      benefactorId: benefactorId, // Send the benefactorId in the request body
    },
    success: function (pickpoints) {
      $("#editPickpointContainer").empty();
      pickpoints.data.forEach((pickpoint) => {
        // Use .data
        if (pickpoint && typeof pickpoint === "object") {
          // Check if pickpoint is not null and is an object
          $("#editPickpointContainer").append(`
              <div class="pickpoint-container">
                  <div class="d-flex align-items-center justify-content-between mt-2">
                      <div>
                          <h5>${pickpoint.street}, ${pickpoint.city}</h5>
                          <p>${pickpoint.postalCode}, ${pickpoint.country}</p>
                      </div>
                      <button class="btn btn-primary select-edit-pickpoint" title="${pickpoint._id}" data-id="${pickpoint._id}">Select</button>
                  </div>
              </div>
          `);
        }
      });
    },
  });
  });

  $("#editPickpointModal").on("hidden.bs.modal", function () {
    $("body").removeClass("test");
    $(".modal-backdrop").last().css("z-index", 1040);
  });
});

$("#editPickpointSearch").on("input", function () {
  var searchValue = $(this).val();
  var benefactorId = $("#editBenefactorId").val(); // Get the benefactor ID from the input field
  $.ajax({
    url: `/benefactors/${benefactorId}/pickpoints/all-pickpoints`,
    type: "POST",
    data: {
      "search[value]": searchValue,
      length: 10,
      benefactorId: benefactorId, // Send the benefactorId in the request body
    },
    success: function (pickpoints) {
      $("#editPickpointContainer").empty();
      pickpoints.data.forEach((pickpoint) => {
        // Use .data
        if (pickpoint && typeof pickpoint === "object") {
          // Check if pickpoint is not null and is an object
          $("#editPickpointContainer").append(`
              <div class="pickpoint-container">
                  <div class="d-flex align-items-center justify-content-between mt-2">
                      <div>
                          <h5>${pickpoint.street}, ${pickpoint.city}</h5>
                          <p>${pickpoint.postalCode}, ${pickpoint.country}</p>
                      </div>
                      <button class="btn btn-primary select-edit-pickpoint" title="${pickpoint._id}" data-id="${pickpoint._id}">Select</button>
                  </div>
              </div>
          `);
        }
      });
    },
  });
});

$(document).ready(function () {
  $("body").on("click", ".select-edit-pickpoint", function () {
    var pickpointId = $(this).data("id");
    var pickpointStreet = $(this).parent().find("h5").text();
    var pickpointCountry = $(this)
      .parent()
      .find("p")
      .text()
      .split(",")[1]
      .trim(); // Get the country
    var pickpointCity = $(this).parent().find("h5").text().split(",")[1].trim(); // Get the city
    var pickpointPostalCode = $(this)
      .parent()
      .find("p")
      .text()
      .split(",")[0]
      .trim(); // Get the postal code
    $("#editDonationPickpointId").val(pickpointId);
    $("#editPickpointAddress").val(
      `${pickpointStreet}, ${pickpointCity}, ${pickpointPostalCode}, ${pickpointCountry}`
    );
    $("#editPickpointModal").modal("hide");
    $("editModal").modal("show");
  });
});
