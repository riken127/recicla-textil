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
        title: "Timestamp",
        render: function (data, type, row) {
          return new Date(data).toLocaleString().split(" GMT")[0];
        },
      },
      {
        data: "userId",
        title: "User ID",
      },
      {
        data: "ip",
        title: "IP",
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
    // Send AJAX request
    $.ajax({
      url: "/donations/add",
      type: "POST",
      data: JSON.stringify(donationData), // Convert donationData to JSON string
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        console.log("Donation created successfully:", response);
        // Handle successful creation (e.g., close modal, show confirmation)
        $("#createModal").modal("hide");
        $("#createDonationForm")[0].reset();
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
            $("#editCountry").val(country);
            $("#editCity").val(city);
            $("#editStreet").val(street);
            $("#editPostalCode").val(postalCode);
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
    console.log(
      "Isto é o editDonationPickpointId: ",
      $("#editDonationPickpointId").val()
    );
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
        console.log("Donation updated successfully:", response);
        // Handle successful update (e.g., close modal, refresh table)
        $("#editModal").modal("hide");
        table.ajax.reload();
      },
      error: function (xhr, status, error) {
        console.error("Error updating donation:", error);
      },
    });
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
          console.log("Donation deleted successfully:", response);
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
  function getPickpoint(PickpoiintId, BenefactorId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/benefactors/${BenefactorId}/pickpoints/${PickpoiintId}`,
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
