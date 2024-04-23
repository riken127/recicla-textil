$(document).ready(function () {
    var dataTableOptions = {
        layout: {
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
        "processing": true,
        "searchable": true,
        "serverSide": true,
        "ajax": {
            url: "http://localhost:3000/donations/all-donations",
            type: "POST",
            data: function (d) {
                console.log(d);
                return d;
            }
        },
        "columns": [
            {
                "data": "userId",
                "title": "User ID"
            },
            {
                "data": "activityType",
                "title": "Activity Type"
            },
            {
                "data": "timestamp",
                "title": "Timestamp",
                "render": function (data, type, row) {
                    return new Date(data).toDateString();
                }
            },
            {
                "data": "details",
                "title": "Details",
                "render": function (data, type, row) {
                    return "<button class='details-btn btn btn-primary' data-details='" + data + "'>Ver detalhes</button>";
                }
            },
            {
                "data": "ip",
                "title": "IP"
            },
            {
                "data": null,
                "title": "Actions",
                "className": "text-center",
                "render": function (data, type, row) {
                    return `<a href="#" class="edit-button" onclick="openEditModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a href="#" onclick="openDeleteModal('${row._id}')"><i class="fa-solid fa-trash"></i></a>`;
                }
            }
        ],
        "paging": true,
        "pagingType": "full_numbers"
    };

    var table = $("#donationsTable").DataTable(dataTableOptions);

    $(document).ready(function () {
        var dataTableOptions = {
            layout: {
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
            "processing": true,
            "searchable": true,
            "serverSide": true,
            "ajax": {
                url: "http://localhost:3000/donations/all-donations",
                type: "POST",
                data: function (d) {
                    console.log(d);
                    return d;
                }
            },
            "columns": [
                {
                    "data": "userId",
                    "title": "User ID"
                },
                {
                    "data": "activityType",
                    "title": "Activity Type"
                },
                {
                    "data": "timestamp",
                    "title": "Timestamp",
                    "render": function (data, type, row) {
                        return new Date(data).toDateString();
                    }
                },
                {
                    "data": "details",
                    "title": "Details",
                    "render": function (data, type, row) {
                        return "<button class='details-btn btn btn-primary' data-details='" + data + "'>Ver detalhes</button>";
                    }
                },
                {
                    "data": "ip",
                    "title": "IP"
                },
                {
                    "data": null,
                    "title": "Actions",
                    "className": "text-center",
                    "render": function (data, type, row) {
                        return `<a href="#" class="edit-button" onclick="openEditModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a href="#" onclick="openDeleteModal('${row._id}')"><i class="fa-solid fa-trash"></i></a>`;
                    }
                }
            ],
            "paging": true,
            "pagingType": "full_numbers"
        };
    
        var table = $("#donationsTable").DataTable(dataTableOptions);
    
// Form submission event handler for create modal
$("#createDonationForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect all items from the table
    var items = [];
    $('#itemsTable tbody tr').each(function() {
        var brand = $(this).find('.item-brand').text();
        var weight = parseInt($(this).find('.item-weight').text()) || 0;
        var size = $(this).find('.item-size').text();
        var itemType = $(this).find('.item-type').text();
        var itemPhoto = $(this).find('.item-photo').attr('src');
        items.push({brand: brand, weight: weight, size: size, itemType: itemType, itemPhoto: itemPhoto});
    });

    const donationData = {
        userId: $("#createUserId").val(),
        activityType: $("#createActivityType").val(),
        timestamp: new Date($("#createTimestamp").val()),
        details:{
            benefactor: $("#createBenefactor").val(),
            items: items,
            totalWeight: $("#totalWeight").val(),
            numberOfItems: $("#numberItens").val(),
            country: $("#createCountry").val(),
            city: $("#createCity").val(),
            street: $("#createStreet").val(),
            postalCode: $("#createPostalCode").val()
        },
        ip: $("#createIp").val(),
    };

    // Send AJAX request
    $.ajax({
        url: "/donations/add", // Replace with the actual endpoint for creating donations
        type: "POST",
        data: JSON.stringify(donationData), // Convert donationData to JSON string
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            console.log("Donation created successfully:", response);
            // Handle successful creation (e.g., close modal, show confirmation)
            $("#createModal").modal("hide");
            $("#createDonationForm")[0].reset();
        }
    });
});

    
    window.openDeleteModal = (donationId) => {
        console.log(donationId)
        $("#deleteModal").modal("show");
        $("#confirmDelete").data("donationid", donationId);
    }
    
    // Click event listener for delete confirmation button
    $(document).on("click", "#confirmDelete", function () {
        var donationId = $(this).data("donationid");
        if (donationId) {
            // If donation ID is provided, make an AJAX request to delete donation
            $.ajax({
                url: "/donations/delete",
                method: "POST",
                data: JSON.stringify({
                    id: donationId
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
    
    
    
    
  });
    
    

window.openDeleteModal = (donationId) => {
    console.log(donationId)
    $("#deleteModal").modal("show");
    $("#confirmDelete").data("donationid", donationId);
}

// Click event listener for delete confirmation button
$(document).on("click", "#confirmDelete", function () {
    var donationId = $(this).data("donationid");
    if (donationId) {
        // If donation ID is provided, make an AJAX request to delete donation
        $.ajax({
            url: "/donations/delete",
            method: "POST",
            data: JSON.stringify({
                id: donationId
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

});
