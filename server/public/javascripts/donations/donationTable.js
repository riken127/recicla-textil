//Variable to store current donation ID
let currentDonationId;

//  Document Ready Function
$(document).ready(function () {
    var dataTableOptions = {
        layout: {
            topStart: {
                buttons: [
                    {
                        text: '<i class="fas fa-plus"></i> &nbsp; New Donation',
                        className: "btn btn-primary",
                        action: function (e, dt, node, config) {
                            $("#createModal").modal("show");
                        },
                    },
                ],
            },
        },
        processing: true,
        searchable: true,
        serverSide: true,
        ajax: {
            url: "http://localhost:3000/donations/all",
            type: "POST",
            data: function (d) {
                return d;
            },
        },
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
        currentDonationId = donationId;

        if (donationId) {
            $.ajax({
                url: `/donations/${donationId}`,
                method: "GET",
                success: async function (response) {
                    const user = await getUser(response.userId);
                    const benefactor = await getBenefactor(
                        response.details.benefactorId
                    );
                    const benefactorId = benefactor._id;
                    const pickpoint = await getPickpoint(
                        response.details.pickpointId,
                        benefactorId
                    );

                    $("#detailsUserName").val(
                        user.firstName + " " + user.lastName
                    );
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
                    $("#detailsBenefactorName").val(benefactor.name);
                    $("#detailsBenefactorPhone").val(benefactor.phone);
                    $("#detailsPickpointAddress").val(
                        pickpoint.street +
                        ", " +
                        pickpoint.city +
                        ", " +
                        pickpoint.country +
                        ", " +
                        pickpoint.postalCode
                    );
                    $("#itemCount").val(response.details.numberOfItems);
                    $("#totalWeight").val(response.details.totalWeight);
                },
            });

            if (!$.fn.DataTable.isDataTable("#itemsDetailsTable")) {
                $("#itemsDetailsTable").DataTable({
                    ajax: {
                        url: `/donations/${donationId}/items/all`,
                        dataSrc: "",
                    },
                    columns: [
                        {data: "brand", title: "Brand"},
                        {
                            data: null,
                            title: "Weight",
                            render: function (data, type, row) {
                                return (
                                    data.weight.value + " " + data.weight.unit
                                );
                            },
                        },
                        {data: "size", title: "Size"},
                        {data: "type", title: "Type"},
                    ],
                });
            } else {
                $("#itemsDetailsTable")
                    .DataTable()
                    .ajax.url(`/donations/${donationId}/items/all`)
                    .load();
            }

            $("#detailsModal").modal("show");

            $("#itemsModal").on("hidden.bs.modal", function (e) {
                $("#itemsDetailsTable").DataTable().clear().draw();
                $("#donationsTable").DataTable().ajax.reload();
            });
        }
    };

    // Form submission event handler for create modal
    $("#createDonationForm").submit(function (event) {
        event.preventDefault();

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
        const donationData = {
            userId: $("#createUserId").val(),
            activityType: "donation",
            timestamp: new Date($("#createTimestamp").val()),
            details: {
                benefactorId: $("#createBenefactorId").val(),
                pickpointId: $("#createDonationPickpointId").val(),
                items: items,
                totalWeight: 0,
                numberOfItems: 0,
            },
            ip: 0,
        };
        $("#createUserId").val("");
        $("#createBenefactorId").val("");
        $("#createDonationPickpointId").val("");

        $.ajax({
            url: "/donations/",
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

    // Funcstion to open the Edit modal and populate the form fields with the existing data
    window.openEditModal = async (donationId) => {
        currentDonationId = donationId;

        if (donationId) {
            $.ajax({
                url: `/donations/` + donationId,
                method: "GET",
                success: async function (response) {
                    try {
                        const userId = response.userId;
                        const user = await getUser(userId);
                        const userUsername = user.username;
                        const benefactorId = response.details.benefactorId;
                        const benefactor = await getBenefactor(benefactorId);
                        const benefactorName = benefactor.name;
                        const pickpointId = response.details.pickpointId;
                        const pickpoint = await getPickpoint(
                            pickpointId,
                            benefactorId
                        );
                        const country = pickpoint.country;
                        const city = pickpoint.city;
                        const street = pickpoint.street;
                        const postalCode = pickpoint.postalCode;

                        $("#editUserId").val(userId);
                        $("#editUserName").val(userUsername);
                        $("#editBenefactorId").val(benefactorId);
                        $("#editBenefactorName").val(benefactorName);
                        $("#editDonationPickpointId").val(pickpointId);
                        $("#editActivityType").val(response.activityType);
                        $("#editTimestamp").val(response.timestamp);
                        $("#editPickpointAddress").val(
                            `${street}, ${city}, ${country}, ${postalCode}`
                        );
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
                    console.error(
                        "Response headers:",
                        xhr.getAllResponseHeaders()
                    );
                },
            });
        } else {
            console.error("Donation ID is missing.");
        }
    };

    // Form submission event handler for edit modal
    $("#editDonationForm").submit(function (event) {
        event.preventDefault();

        const donationData = {
            userId: $("#editUserId").val(),
            details: {
                benefactorId: $("#editBenefactorId").val(),
                pickpointId: $("#editDonationPickpointId").val(),
            },
        };
        const jsonData = JSON.stringify(donationData);

        $.ajax({
            url: "/donations/" + currentDonationId,
            method: "PUT",
            data: jsonData,
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                $("#editModal").modal("hide");
                table.ajax.reload();
            },
            error: function (xhr, status, error) {
                console.error("Error updating donation:", error);
            },
        });
    });

    // Function to open the Delete modal
    window.openDeleteModal = (donationId) => {
        currentDonationId = donationId;
        $("#deleteModal").modal("show");
    };

    // Click event listener for delete confirmation button
    $(document).on("click", "#confirmDelete", function () {
        var donationId = currentDonationId;

        if (donationId) {
            $.ajax({
                url: "/donations/" + donationId,
                method: "DELETE",
                contentType: "application/json",
                dataType: "json",
                success: function (response) {
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
            url: "/users/all",
            type: "POST",
            data: {length: 10},
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
        url: "/users/all",
        type: "POST",
        data: {"search[value]": searchValue, length: 10},
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
        var userId = $(this).data("id");
        var userName = $(this).parent().find("h5").text();

        $("#createUserId").val(userId);
        $("#createUserName").val(userName);
        $("#userModal").modal("hide");
    });
});

// Script to select Benefactor to Create a Donation
$(document).ready(function () {
    $("#benefactorModal").on("show.bs.modal", function () {
        $("body").addClass("test");
        $(".modal-backdrop").last().css("z-index", 1051);

        $.ajax({
            url: "/benefactors/all",
            type: "POST",
            data: {length: 10},
            success: function (benefactors) {
                $("#benefactorContainer").empty();

                benefactors.data.forEach((benefactor) => {
                    if (
                        benefactor.pickpoints.filter(
                            (pickpoint) => pickpoint.active === true
                        ).length > 0
                    ) {
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
        url: "/benefactors/all",
        type: "POST",
        data: {"search[value]": searchValue, length: 10},
        success: function (benefactors) {
            $("#benefactorContainer").empty();
            benefactors.data.forEach((benefactor) => {
                if (
                    benefactor.pickpoints.filter(
                        (pickpoint) => pickpoint.active === true
                    ).length > 0
                ) {
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
        var benefactorId = $(this).data("id");
        var benefactorName = $(this).parent().find("h5").text();

        $("#createBenefactorId").val(benefactorId);
        $("#createBenefactorName").val(benefactorName);
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

        var benefactorId = $("#createBenefactorId").val();

        $.ajax({
            url: `/benefactors/${benefactorId}/pickpoints/all`,
            type: "POST",
            data: {
                length: 10,
                benefactorId: benefactorId,
            },
            success: function (pickpoints) {
                $("#pickpointContainer").empty();
                pickpoints.data.forEach((pickpoint) => {
                    if (pickpoint && typeof pickpoint === "object") {
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
    var benefactorId = $("#createBenefactorId").val();

    $.ajax({
        url: `/benefactors/${benefactorId}/pickpoints/all`,
        type: "POST",
        data: {
            "search[value]": searchValue,
            length: 10,
            benefactorId: benefactorId,
            success: function (pickpoints) {
                $("#pickpointContainer").empty();

                pickpoints.data.forEach((pickpoint) => {
                    if (pickpoint && typeof pickpoint === "object") {
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
            .trim();
        var pickpointCity = $(this)
            .parent()
            .find("h5")
            .text()
            .split(",")[1]
            .trim();
        var pickpointPostalCode = $(this)
            .parent()
            .find("p")
            .text()
            .split(",")[0]
            .trim();

        $("#createDonationPickpointId").val(pickpointId);

        $("#createPickpointAddress").val(
            `${pickpointStreet}, ${pickpointCity}, ${pickpointPostalCode}, ${pickpointCountry}`
        );

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
            url: "/users/all",
            type: "POST",
            data: {length: 10},
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
        url: "/users/all",
        type: "POST",
        data: {"search[value]": searchValue, length: 10},
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
        var userId = $(this).data("id");
        var userName = $(this).parent().find("h5").text();

        $("#editUserId").val(userId);
        $("#editUserName").val(userName);
        $("#editUserModal").modal("hide");
    });
});

// Script to select Benefactor to Edit a Donation
$(document).ready(function () {
    $("#editBenefactorModal").on("show.bs.modal", function () {
        $("body").addClass("test");
        $(".modal-backdrop").last().css("z-index", 1051);

        $.ajax({
            url: "/benefactors/all",
            type: "POST",
            data: {length: 10},
            success: function (benefactors) {
                $("#editBenefactorContainer").empty();

                benefactors.data.forEach((benefactor) => {
                    if (
                        benefactor.pickpoints.filter(
                            (pickpoint) => pickpoint.active === true
                        ).length > 0
                    ) {
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
        url: "/benefactors/all",
        type: "POST",
        data: {"search[value]": searchValue, length: 10},
        success: function (benefactors) {
            $("#editBenefactorContainer").empty();

            benefactors.data.forEach((benefactor) => {
                if (
                    benefactor.pickpoints.filter(
                        (pickpoint) => pickpoint.active === true
                    ).length > 0
                ) {
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
        var benefactorId = $(this).data("id");
        var benefactorName = $(this).parent().find("h5").text();

        $("#editBenefactorId").val(benefactorId);
        $("#editBenefactorName").val(benefactorName);
        $("#editBenefactorModal").modal("hide");
        $("#editModal").modal("hide");
        $("#editPickpointModal").modal("show");
    });
});

// Select Pickpoint to Edit a Donation

$(document).ready(function () {
    $(".select-edit-pickPoint").click(function () {
        var street = $(this).data("street");
        var city = $(this).data("city");
        var postalCode = $(this).data("postalcode");
        var country = $(this).data("country");
        var pickpointId = $(this).data("_id");

        $("#editStreet").val(street);
        $("#editCity").val(city);
        $("#editPostalCode").val(postalCode);
        $("#editCountry").val(country);
        $("#editDonationPickpointId").val(pickpointId);
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

        var benefactorId = $("#editBenefactorId").val();

        $.ajax({
            url: `/benefactors/${benefactorId}/pickpoints/all`,
            type: "POST",
            data: {
                length: 10,
                benefactorId: benefactorId,
            },
            success: function (pickpoints) {
                $("#editPickpointContainer").empty();

                pickpoints.data.forEach((pickpoint) => {
                    if (pickpoint && typeof pickpoint === "object") {
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
    var benefactorId = $("#editBenefactorId").val();

    $.ajax({
        url: `/benefactors/${benefactorId}/pickpoints/all`,
        type: "POST",
        data: {
            "search[value]": searchValue,
            length: 10,
            benefactorId: benefactorId,
        },
        success: function (pickpoints) {
            $("#editPickpointContainer").empty();
            pickpoints.data.forEach((pickpoint) => {
                if (pickpoint && typeof pickpoint === "object") {
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
            .trim();
        var pickpointCity = $(this)
            .parent()
            .find("h5")
            .text()
            .split(",")[1]
            .trim();
        var pickpointPostalCode = $(this)
            .parent()
            .find("p")
            .text()
            .split(",")[0]
            .trim();
        $("#editDonationPickpointId").val(pickpointId);
        $("#editPickpointAddress").val(
            `${pickpointStreet}, ${pickpointCity}, ${pickpointPostalCode}, ${pickpointCountry}`
        );
        $("#editPickpointModal").modal("hide");
        $("editModal").modal("show");
    });
});
