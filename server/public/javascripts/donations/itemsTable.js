$(document).ready(function () {
  // Global variable to store the current donation ID
  var currentDonationId;
  var currentItemId;

  // Function to open the Items Modal
  $("#openAddItemButton").click(function () {
    $("#itemsModal").modal("hide");
    $("#addItemModal").modal("show");
  });

  // Modal to show items of a donation
  window.itemsModal = (donationId) => {
    currentDonationId = donationId; 

    if (!$.fn.DataTable.isDataTable("#itemsTable")) {
      $("#itemsTable").DataTable({
        ajax: {
          url: `/donations/${donationId}/items/all`,
          type: "POST",
          data: function (d) {
            return d
            },
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
          {
            data: null,
            title: "Actions",
            className: "text-center",
            render: function (data, type, row) {
              return `<a href="#" onclick="openItemPhotoModal('${row._id}')"><i class="fa-solid fa-images"></i></a>&nbsp;<a href="#" onclick="openEditItemModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a href="#" onclick="openDeleteItemModal('${row._id}', '${donationId}')"><i class="fa-solid fa-trash"></i></a>`;
            },
          },
        ],
      });
    } else {
      $("#itemsTable")
        .DataTable()
        .ajax.url(`/donations/${donationId}/items/all`)
        .load();
    }

    $("#itemsModal").modal("show");

    $("#itemsModal").on("hidden.bs.modal", function (e) {
      $("#itemsTable").DataTable().clear().draw();
      $("donaionsTable").DataTable().ajax.reload();
    });
  };

  $(document).on("submit", "#addItemForm", function (event) {
    event.preventDefault(); 

    const donationId = currentDonationId;
    let itemImage = $("#itemPhoto").prop("files")[0];

    $.ajax({
      url: `/donations/${donationId}`,
      type: "GET",
      success: function (donation) {
        const benefactorId = donation.details.benefactorId;

        $.ajax({
          url: `/benefactors/${benefactorId}`,
          type: "GET",
          success: function (benefactor) {
            const itemData = {
              _id: "",
              brand: $("#brand").val(),
              weight: {
                value: $("#weight").val(),
                unit: $("#weightUnit").val(),
              },
              size: $("#size").val(),
              type: $("#itemType").val(),
              photo: itemImage ? "y" : null,
            };
            const pointsToAdd =
              itemData.weight.value *
              (benefactor.convertationRatio.points /
                benefactor.convertationRatio.value);
            const jsonData = JSON.stringify(itemData);

            $.ajax({
              url: `/donations/${currentDonationId}/items/`,
              type: "POST",
              data: jsonData,
              contentType: "application/json",
              dataType: "json",
              success: function (response) {

                if (itemImage) {
                  uploadItemImage(currentDonationId, response.id, itemImage);
                }

                $("#addItemModal").modal("hide"); 
                $("#addItemForm")[0].reset(); 
                $("#itemsModal").modal("show"); 
                $("#itemsTable").DataTable().ajax.reload(); 
                $("donationsTable").DataTable().ajax.reload(); 
                addPointsToUser(donation.userId, pointsToAdd);
              },
              error: function (error) {
                console.error("Error creating Item:", error);
                console.error("Server response:", error.responseText);
              },
            });
          },
          error: function (error) {
            console.error("Error fetching Benefactor:", error);
            console.error("Server response:", error.responseText);
          },
        });
      },
      error: function (error) {
        console.error("Error fetching Donation:", error);
        console.error("Server response:", error.responseText);
      },
    });
  });

  // Function to add points to user
  function addPointsToUser(userId, pointsToAdd) {
    const data = {
      userId: userId,
      leafs: pointsToAdd,
    };

    $.ajax({
      url: "/users/update",
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      dataType: "json",
      error: function (error) {
        console.error("Error updating user points:", error);
        console.error("Server response:", error.responseText);
      },
    });
  }

  //Function to open the delete item modal
  window.openDeleteItemModal = (id) => {
    currentItemId = id;
    $("#deleteItemModal").modal("show");
  };

  window.openItemPhotoModal = (id) => {
    currentItemId = id;

    $.ajax({
      url: `/donations/${currentDonationId}/items/${currentItemId}`,
      method: "GET",
      success: (response) => {

        if (response.photo && response.photo != "") {
          $("#showPhotoModalImage").attr('src', "../" + response.photo);
        } else {
          $("#showPhotoModalImage").attr('src', `https://api.dicebear.com/8.x/shapes/svg?seed=${id}`);
        }

        $("#showPhotoModal").modal("show");
      },
      error: (xhr, status, error) => {
        console.error("Failed to get item", xhr.responseText);
      },
    });
  };

  //Function to open the edit item modal
  window.openEditItemModal = (id) => {
    currentItemId = id;

    $.ajax({
      url: `/donations/${currentDonationId}/items/${currentItemId}`,
      method: "GET",
      success: (response) => {
        $("#editBrand").val(response.brand);
        $("#editWeight").val(response.weight.value);
        $("#editWeightUnit").val(response.weight.unit);
        $("#editSize").val(response.size);
        $("#editItemType").val(response.type);
        $("#itemsModal").modal("hide");
        $("#editItemModal").modal("show");
      },
      error: (xhr, status, error) => {
        console.error("Failed to get item", xhr.responseText);
      },
    });
  };

  // Confirm Edit action for item.
  $("#updateItem").on("click", function (e) {
    event.preventDefault();

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
      photo: itemImage ? "y" : null,
    };
    const jsonData = JSON.stringify(itemData);

    $.ajax({
      url: `/donations/${currentDonationId}/items/${currentItemId}`,
      type: "PUT",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",
      success: function (response) {

        if (itemImage) {
          uploadItemImage(
            currentDonationId,
            currentItemId,
            currentItemId,
            itemImage
          );
        }

        $("#editItemModal").modal("hide");
        $("#itemsModal").modal("show"); 
        $("#itemsTable").DataTable().ajax.reload();
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
      url: `/donations/${currentDonationId}/items/${currentItemId}`,
      method: "DELETE",
      success: (response) => {
        $("#deleteItemModal").modal("hide");
        $("#itemsTable").DataTable().ajax.reload();
      },
      error: (xhr, status, error) => {
        console.error("Failed to delete item", xhr.responseText);
      },
    });
  });

  function uploadItemImage(donationId, itemId, itemImageFile) {
    const formData = new FormData();
    formData.append("entityType", "donation");
    formData.append("entityId", donationId);
    formData.append("subEntityId", itemId);
    formData.append("item", itemImageFile, itemId + "-item.jpg");
    $.ajax({
      url: `/donations/${donationId}/upload/`,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
    });
  }
});
