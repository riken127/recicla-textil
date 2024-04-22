$(document).ready(function () {
    var dataTableOptions = {
      layout: {
        topStart: {
          buttons: [
            {
              text: '<i class="fas fa-plus"></i> &nbsp; New Pickpoint',
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
        url: "http://localhost:3000/benefactors/:id/pickpoints/all-pickpoints",
        type: "POST",
        data: function (d) {
          return d;
        },
      },
      columns: [
        {
          data: null,
          title: "Street",
          render: function (data, type, row) {
            return `${row.address.street}`;
          },
        },
        {
          data: null,
          title: "City",
          render: function (data, type, row) {
            return `${row.address.city}`;
          },
        },
        {
          data: null,
          title: "Postal Code",
          render: function (data, type, row) {
            return `${row.address.postalCode}`;
          },
        },
        {
          data: null,
          title: "Country",
          render: function (data, type, row) {
            return `${row.address.country}`;
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
  
    var table = $("#pickpointsTable").DataTable(dataTableOptions);
  
    window.openDeleteModal = (benefactorId) => {
      console.log(benefactorId);
      $("#deleteModal").modal("show");
      $("#confirmDelete").data("benefactorid", benefactorId);
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
      event.preventDefault(); // Prevent default form submission
  
      const benefactorData = {
        benefactorId: $("#editBenefactorId").val(),
        firstName: $("#editBenefactorName").val(),
        username: $("#editBenefactorUsername").val(),
        email: $("#editBenefactorEmail").val(),
        password: $("#editPassword").val(),
        roles: $("#editRoles").val(),
        address: {
          street: $("#editStreet").val(),
          city: $("#editCity").val(),
          postalCode: $("#editPostalCode").val(),
          country: $("#editCountry").val(),
        },
        phone: editIti.getNumber(),
        notify: $("#editNotify").is(":checked"),
      };
  
      const jsonData = JSON.stringify(benefactorData);
      $.ajax({
        url: "/benefactors/update", // Replace with your endpoint for updating benefactor
        type: "POST",
        data: jsonData,
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
          console.log("Server response:", response);
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
          console.log(userId);
          openDeleteModal(userId);
      });
  
    // Function to open delete modal
  });
  