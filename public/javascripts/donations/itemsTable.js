$(document).ready(function () {
  // Global variable to store the current donation ID
  var currentDonationId;
  var currentItemId;

  // Modal to show items of a donation
  window.itemsModal = (donationId) => {
    currentDonationId = donationId; // Set the global variable to the current donation ID

    if (!$.fn.DataTable.isDataTable("#itemsTable")) {
      // Initialize DataTables if not already initialized
      $("#itemsTable").DataTable({
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
          {
            data: null,
            title: "Actions",
            className: "text-center",
            render: function (data, type, row) {
              //falta trocar aqui os models
              return `<a href="#" onclick="openEditItemModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a href="#" onclick="openDeleteItemModal('${row._id}', '${donationId}')"><i class="fa-solid fa-trash"></i></a>`;
            },
          },
        ],
      });
    } else {
      // If DataTables is already initialized, just reload the data
      $("#itemsTable")
        .DataTable()
        .ajax.url(`/donations/${donationId}/items/all`)
        .load();
    }

    $("#itemsModal").modal("show");
    $("#itemsModal").on("hidden.bs.modal", function (e) {
      // Use the DataTables API to clear the table
      $("#itemsTable").DataTable().clear().draw();
      $("donaionsTable").DataTable().ajax.reload();
    });
  };

  // Form submission event handler for add item modal
  $(document).on("submit", "#addItemForm", function (event) {
    event.preventDefault(); // Prevent default form submission
    // Create a data object with the form data
    let itemImage = $("#itemPhoto").prop("files")[0];
    const itemData = {
      _id: "",
      brand: $("#brand").val(),
      weight: {
        value: $("#weight").val(),
        unit: $("#weightUnit").val(),
      },
      size: $("#size").val(),
      type: $("#itemType").val(),
      photo: itemImage ? 'y' : null,
    };
    // Convert data object to JSON string
    const jsonData = JSON.stringify(itemData);

    // Send AJAX request
    console.log("Sending data: ", itemData);
    $.ajax({
      url: `/donations/${currentDonationId}/items/add`,
      type: "POST",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",
      success: (response) => {
          if (itemImage) {
              uploadItemImage(currentDonationId, response.id, itemImage);
          }
        $("#addItemModal").modal("hide"); // Close the modal
        $("#addItemForm")[0].reset(); // Reset the form
        $("#itemsModal").modal("show"); // Open the items modal
        $("#itemsTable").DataTable().ajax.reload(); //Reload Items table
        $("#donationsTable").DataTable().ajax.reload(); //Reload Donations table
      },
      error: function (error) {
        console.error("Error creating Item:", error);
        console.error("Server response:", error.responseText);
      },
    });
  });

  //Function to open the delete item modal
  window.openDeleteItemModal = (id) => {
    // Store current item ID.
    currentItemId = id;
    // Show delete item modal.
    $("#deleteItemModal").modal("show");
  };

  //Function to open the edit item modal
  window.openEditItemModal = (id) => {
    // Store current item ID.
    currentItemId = id;
    // Get item data.
    $.ajax({
      url: `/donations/${currentDonationId}/items/${currentItemId}`,
      method: "GET",
      success: (response) => {
        // Set item data in edit item modal.
        $("#editBrand").val(response.brand);
        $("#editWeight").val(response.weight.value);
        $("#editWeightUnit").val(response.weight.unit);
        $("#editSize").val(response.size);
        $("#editItemType").val(response.type);
        $("#editItemPhoto").val(response.photo);
        // Hide item modal.
        $("#itemsModal").modal("hide");
        // Show edit item modal.
        $("#editItemModal").modal("show");
      },
      error: (xhr, status, error) => {
        console.error("Failed to get item", xhr.responseText);
      },
    });
  };

  // Confirm Edit action for item.
     $("#updateItem").on("click", function (e) {
     // Create a data object with the form data
         let itemImage = $("#editItemPhoto").prop("files")[0];
     const itemData = {
          _id: currentItemId,
          brand: $("#editBrand").val(),
          weight: {
          value: $("#editWeight").val(),
          unit: $("#editWeightUnit").val(),
          },
          size: $("#editSize").val(),
          type: $("#editItemType").val(),
          photo: itemImage ? 'y' : null
     };
     // Convert data object to JSON string
     const jsonData = JSON.stringify(itemData);
    
     // Send AJAX request
     $.ajax({
          url: `/donations/${currentDonationId}/items/${currentItemId}/update`,
          type: "POST",
          data: jsonData,
          contentType: "application/json",
          dataType: "json",
          success: function (response) {
            console.log("Item updated successfully:", response);
            if (itemImage) {
                uploadItemImage(currentDonationId, currentItemId, currentItemId, itemImage);
            }
            $("#editItemModal").modal("hide"); // Close the modal
            $("#itemsModal").modal("show"); // Open the items modal
            $("#itemsTable").DataTable().ajax.reload(); //Reload Items table
          },
          error: function (error) {
          console.error("Error updating Item:", error);
          console.error("Server response:", error.responseText);
          },
     });
     });



  // Confirm delete action for item.
  $("#confirmDeleteItem").on("click", function (e) {
    $.ajax({
      url: `/donations/${currentDonationId}/items/${currentItemId}/delete`,
      method: "DELETE",
      success: (response) => {
        // Close delete item modal.
        $("#deleteItemModal").modal("hide");
        // Reload item table.
        $("#itemsTable").DataTable().ajax.reload();
      },
      error: (xhr, status, error) => {
        console.error("Failed to delete item", xhr.responseText);
      },
    });
  });

  function uploadItemImage(donationId, itemId, itemImageFile) {
      const formData = new FormData();
      formData.append('entityType', 'donation');
      formData.append('entityId', donationId);
      formData.append('subEntityId', itemId);
      formData.append('item', itemImageFile, itemId + '-item.jpg');
      $.ajax({
          url: `/donations/${donationId}/upload/`,
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: (response) => {
              console.log('Item image uploaded successfully', response);
          },
          error: (error) => {
              console.log('Error updating item', error);
          }
      });
  }
});
