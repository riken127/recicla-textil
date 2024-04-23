let currBenefactor;

$(document).ready(function () {
  var dataTableOptions = {
    layout: {
      topStart: {
        buttons: [
          {
            text: '<i class="fas fa-plus"></i> &nbsp; New Benefactor',
            className: "btn btn-primary",
            action: function (e, dt, node, config) {
              $("#createModal").modal("show"); // Open the create modal when the button is clicked
            },
          },
        ],
      },
    },
    processing: true,
    searchable: true,
    serverSide: true,
    ajax: {
      url: "http://localhost:3000/benefactors/all-benefactors",
      type: "POST",
      data: function (d) {
        return d;
      },
    },
    columns: [
      {
        data: null,
        title: "Name",
        render: function (data, type, row) {
          return `${row.name}`;
        },
      },
      {
        data: "pickpoints",
        title: "Pick Points",
        render: function (data, type, row) {
          if (data.length > 0) {
            return `<a href="#" class="expand-button" onclick="openPickpointModal('${row._id}')" title="${data.length} Pickpoints"><i class="fa-solid fa-up-right-and-down-left-from-center px-4 align-items-center"></i></a>`;
          } else {
            return `<a href="#" class="expand-button" onclick="openPickpointModal('${row._id}')" title="This Benefactor has ${data.length} associated Pickpoints!"><i class="fa-solid fa-triangle-exclamation px-4 align-items-center"></i></a>`;
          }
        },
      },
      {
        data: null,
        title: "Address",
        render: function (data, type, row) {
          return row.address
            ? `${row.address.street}, ${row.address.city}, ${row.address.postalCode}, ${row.address.country}`
            : "N/A";
        },
      },
      { data: "phone", title: "Phone" },
      {
        data: "createdAt",
        title: "Created At",
        render: function (data, type, row) {
          return new Date(data).toDateString();
        },
      },

      {
        data: null,
        title: "Actions",
        className: "text-center",
        render: function (data, type, row) {
          return `<a href="#" class="edit-button" onclick="openEditModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a href="#" onclick="openDeleteModal('${row._id}')"><i class="fa-solid fa-trash"></i></a>`;
        },
      },
    ],
    paging: true,
    pagingType: "full_numbers",
  };
  var table = $("#benefactorsTable").DataTable(dataTableOptions);

  window.openDeleteModal = (benefactorId) => {
    $("#deleteModal").modal("show");
    $("#confirmDelete").data("benefactorid", benefactorId);
  };

  window.openPickpointModal = (benefactorId) => {
    console.log("abri o modal");
    $("#pickpointModal").modal("show");
    currBenefactor = benefactorId;
  };


  // Function to open modal and fetch benefactorId data
  window.openEditModal = (id) => {
    if (id) {
      // If benefactor ID is provided, make an AJAX request to fetch benefactor data
      $.ajax({
        url: "/benefactors/" + id,
        method: "GET",  
        success: function (response) {
          // Populate form fields with retrieved benefactor data
          $("#editBenefactorId").val(response._id);
          $("#editBenefactorName").val(response.name);
          $("#editDescription").val(response.description);
          $("#editPickpoints").val(response.pickpoints.length);
          $("#editBenefactorUsername").val(response.username);
          $("#editBenefactorEmail").val(response.email);
          $("#editStreet").val(response.address.street);
          $("#editCity").val(response.address.city);
          $("#editPostalCode").val(response.address.postalCode);
          $("#editCountry").val(response.address.country);
          editIti.setNumber(response.phone);
          $("#editModal").modal("show");
          var form = document.getElementById("editBenefactorForm");
          //form.action = "update";
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);
        },
      });
    } else {
      console.error("Benefactor ID is missing.");
    }
  };

  // Form submission event handler for edit modal
  $("#editBenefactorForm").submit(function (event) {
    console.log("O lucas é meio burro")
    event.preventDefault(); // Prevent default form submission

    const benefactorData = {
      id: $("#editBenefactorId").val(),
      name: $("#editBenefactorName").val(),
      username: $("#editBenefactorUsername").val(),
      email: $("#editBenefactorEmail").val(),
      banner: $("#editBanner").val(),
      logo: $("#editLogo").val(),
      address: {
        street: $("#editStreet").val(),
        city: $("#editCity").val(),
        postalCode: $("#editPostalCode").val(),
        country: $("#editCountry").val(),
      },
      phone: editIti.getNumber(),
    };
    
    if ($("#newPassword").val() != "") {
      benefactorData.password = $("#newPassword").val();
    }

    const jsonData = JSON.stringify(benefactorData);

    console.log(benefactorData);
    $.ajax({
      url: "/benefactors/update", // Replace with your endpoint for updating benefactor
      type: "POST",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        $("#editModal").modal("hide");
        table.ajax.reload();
      },
      error: function (error) {
        console.error("Error:", error);
      },
    });
    table.ajax.reload();
  });

  // Form submission event handler for create modal
  $("#createBenefactorForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    const benefactorData = {
      name: $("#createName").val(),
      username: $("#createUsername").val(),
      email: $("#createEmail").val(),
      password: $("#createPassword").val(),
      banner: $("#createBanner").val(),
      logo: $("#createLogo").val(),
      description: $("#createDescription").val(),
      address: {
        street: $("#createStreet").val(),
        city: $("#createCity").val(),
        postalCode: $("#createPostalCode").val(),
        country: $("#createcountry").val(),
      },
      phone: createIti.getNumber(),
    };

    // Convert data object to JSON string
    const jsonData = JSON.stringify(benefactorData);
    // Send AJAX request
    console.log(benefactorData);

    $.ajax({
      url: "/benefactors/add",
      type: "POST",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",

      success: function (response) {
        console.log("Benefactor created successfully:", response);
        // Handle successful creation (e.g., close modal, show confirmation)
        $("#createModal").modal("hide");
        $("#createBenefactorForm")[0].reset();
      },

      error: function (error) {
        console.error("Error creating Benefactor:", error);
      },
    });

    table.ajax.reload();
  });

  // Click event listener for delete confirmation button
  $(document).on("click", "#confirmDelete", function () {
    var benefactorId = $(this).data("benefactorid");
    if (benefactorId) {
      // If benefactor ID is provided, make an AJAX request to delete benefactor
      $.ajax({
        url: "/benefactors/delete/",
        method: "POST",
        data: JSON.stringify({
          id: benefactorId,
        }),
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
          console.log("Benefactor deleted successfully:", response);
          // Handle successful deletion (e.g., close modal, refresh table)
          $("#deleteModal").modal("hide");
          table.ajax.reload();
        },
        error: function (xhr, status, error) {
          console.error("Error deleting benefactor:", error);
        },
      });
    } else {
      console.error("Benefactor ID is missing.");
    }
  });

  $(document).on("click", ".delete-button", function () {
        var userId = $(this).data("userid");
        openDeleteModal(userId);
    });

});
