$(document).ready(function () {
    
  // Variables to store current benefactor and pickpoint IDs
  var currentBenefactorId;
  var currentPickpointId;

  // Function to open delete pickpoint modal.
  window.openDeletePickpointModal = (pickPointId, benefactorId) => {
    // Show delete pickpoint modal.
    $("#deletePickpointModal").modal("show");
    // Set data attributes for confirmation.
    $("#confirmDelete").data({
      benefactorid: benefactorId,
      pickpointid: pickPointId,
    });
  };

  $("#openNewPickpointModal").click(function () {
    $("#pickpointModal").modal("hide");
    $("#newPickpointModal").modal("show");
  });

  // Function to open pickpoint modal.
  window.openPickpointModal = (benefactorId, benefactorName) => {
    // Store current Benefactor ID.
    currentBenefactorId = benefactorId;
    // Update modal title.
    $("#pickpointModalLabel").html(`Pickpoints for ${benefactorName}`);
    // Check if DataTable is already initialized.
    if (!$.fn.DataTable.isDataTable("#pickpointsTable")) {
      // Initialize DataTable.
      $("#pickpointsTable").DataTable({
        ajax: {
          url: `/benefactors/${benefactorId}/pickpoints/all`,
          dataSrc: "",
        },
        columns: [
          { data: "country", title: "Country" },
          { data: "city", title: "City" },
          { data: "street", title: "Street" },
          { data: "postalCode", title: "Postal Code" },
          {
            data: null,
            title: "Actions",
            render: function (data, type, row) {
              return `<a href="#" onclick="openEditPickpointModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a href="#" onclick="openDeletePickpointModal('${row._id}')"><i class="fa-solid fa-trash"></i></a>`;
            },
          },
        ],
      });
    } else {
      // Reload DataTable with new data source.
      $("#pickpointsTable")
        .DataTable()
        .ajax.url(`/benefactors/${benefactorId}/pickpoints/all`)
        .load();
    }
    // Show pickpoint modal.
    $("#pickpointModal").modal("show");
    // Clear DataTable when modal is closed.
    $("#pickpointModal").on("hidden.bs.modal", function (e) {
      $("#pickpointsTable").DataTable().clear().draw();
    });
  };

  // Function to open delete pickpoint modal.
  window.openDeletePickpointModal = (id) => {
    // Store current pickpoint ID.
    currentPickpointId = id;
    // Show delete pickpoint modal.
    $("#deletePickpointModal").modal("show");
  };

  // Function to open edit pickpoint modal.
  window.openEditPickpointModal = (pickpointId) => {
    //hide pickpoint modal
    $("#pickpointModal").modal("hide");
    // Store pickpoint ID to global variable.
    window.pickpointToEdit = pickpointId;
    // AJAX request to fetch pickpoint data.
    $.ajax({
      url: `/benefactors/${currentBenefactorId}/pickpoints/${pickpointId}`,
      method: "GET",
      success: function (response) {
        // Populate form fields with pickpoint data.
        $("#editPickpointStreet").val(response.street);
        $("#editPickpointPostalCode").val(response.postalCode);
        $("#editPickpointCity").val(response.city);
        $("#editpickpointcountry").val(response.country);
        // Show edit pickpoint modal.
        $("#editPickpointModal").modal("show");
      },
      error: function (xhr, status, error) {
        console.error(xhr.responseText);
      },
    });
  };

  // Submit edit pickpoint form.
  $("#editPickpointForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission.
    // Construct pickpoint data object from form fields.
    const pickpointData = {
      street: $("#editPickpointStreet").val(),
      postalCode: $("#editPickpointPostalCode").val(),
      city: $("#editPickpointCity").val(),
      country: $("#editpickpointcountry").val(),
    };
    const jsonData = JSON.stringify(pickpointData);
    // AJAX request to update pickpoint.
    $.ajax({
      url: `/benefactors/${currentBenefactorId}/pickpoints/${window.pickpointToEdit}/update`,
      type: "POST",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        // Close edit pickpoint modal.
        $("#editPickpointModal").modal("hide");
        // Reload pickpoints table.
        $("#pickpointsTable").DataTable().ajax.reload();
      },
      error: function (error) {
        console.error("Error updating Pickpoint:", error);
      },
    });
    // Show pickpoint modal.
    $("#pickpointModal").modal("show");
  });

  // Submit create pickpoint form.
  $(document).on("submit", "#createPickpointForm", function (event) {
    event.preventDefault(); // Prevent default form submission
    // Construct pickpoint data object from form fields.
    const pickpointData = {
      street: $("#inputPickpointStreet").val(),
      city: $("#inputPickpointCity").val(),
      postalCode: $("#inputPickpointPostalCode").val(),
      country: $("#createpickpointcountry").val(),
    };
    const jsonData = JSON.stringify(pickpointData);
    // AJAX request to add new pickpoint
    $.ajax({
      url: `/benefactors/${currentBenefactorId}/pickpoints/add`,
      type: "POST",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        // Close pickpoint modal.
        $("#newPickpointModal").modal("hide");
        // Reset form fields.
        $("#createPickpointForm")[0].reset();
        // Close create modal and open pickpoint modal for the current benefactor.
        $("#createModal").modal("hide");
        openPickpointModal(currentBenefactorId, $("#editBenefactorName").val());
        $("#pickpointsTable").DataTable().ajax.reload();
        $("#benefactorsTable").DataTable().ajax.reload();
      },
      error: function (error) {
        console.error("Error creating Pickpoint:", error);
        console.error("Server response:", error.responseText);
      },
    });
    // Reload pickpoints table.
    $("#pickpointsTable").DataTable().ajax.reload();
  });

  // Confirm delete action for pickpoint.
  $("#confirmPickpointDelete").on("click", function (e) {
    $.ajax({
      url: `/benefactors/${currentBenefactorId}/pickpoints/${currentPickpointId}`,
      method: "DELETE",
      success: (response) => {
        // Close delete pickpoint modal.
        $("#deletePickpointModal").modal("hide");
        // Reload pickpoints table.
        $("#pickpointsTable").DataTable().ajax.reload();
      },
      error: (xhr, status, error) => {
        console.error("Failed to delete pickpoint", xhr.responseText);
      },
    });
  });
});
