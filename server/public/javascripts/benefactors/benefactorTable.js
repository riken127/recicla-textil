let currBenefactor;
const topBar = $(
    `<div id="topBar" class="row">
        <div class="col">
            <button class="btn btn-primary" onclick="openAddModal()">
                <i class="fas fa-plus"></i> &nbsp; New Benefactor
            </button>
        </div>
        <div class="col-auto d-flex align-items-center">
            <div class="form-check form-switch ml-3">
                <input class="form-check-input" type="checkbox" id="pendingBenefactorsSwitch">
                <label class="form-check-label" for="pendingBenefactorsSwitch">Pending Benefactors</label>
            </div>
        </div>
    </div>`
);

/**
 * Initializes the DataTable and defines its behavior, including AJAX data retrieval,
 * filtering, pagination, and handling of pending benefactors switch.
 */
$(document).ready(function () {
    var dataTableOptions = {
        layout: {
            topStart: topBar,
        },
        processing: true,
        searchable: true,
        serverSide: true,
        ajax: {
            url: "http://localhost:3000/benefactors/all",
            type: "POST",
            data: function (d) {
                if ($("#pendingBenefactorsSwitch").is(":checked")) {
                    d.status = "pending";
                }

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
                className: "text-center",
                render: function (data, type, row) {
                    const counter = data.filter(
                        (pickpoint) => pickpoint.active === true
                    ).length;
                    const title =
                        "This Benefactor has " +
                        counter +
                        " associated Pickpoints!";
                    const icon =
                        counter > 0
                            ? "fa-up-right-and-down-left-from-center"
                            : "fa-triangle-exclamation";

                    return `<a href="#" class="expand-button" onclick="openPickpointModal('${row._id}', '${row.name}')" title="${title}"><i class="fa-solid ${icon} px-4 align-items-center"></i></a>`;
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

                    return new Date(data).toLocaleString().split(" GMT")[0];
                },
            },
            {
                data: null,
                title: "Actions",
                className: "text-center",
                render: function (data, type, row) {
                    let actions =
                        `<a href="#" class="edit-button" onclick="openEditModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>` +
                        `&nbsp;<a href="#" onclick="openDeleteModal('${row._id}')"><i class="fa-solid fa-trash"></i></a>`;

                    if (row.status === "pending") {
                        actions += `&nbsp;<a href="#" class="accept-button" onclick="openAcceptModal('${row._id}')"><i class="fa-solid fa-circle-check"></i></a>`;
                    }

                    return actions;
                },
            },
        ],
        paging: true,
        pagingType: "full_numbers",
    };

    var table = $("#benefactorsTable").DataTable(dataTableOptions);

    /**
     * Event handler for the change event of the pending benefactors switch.
     * Reloads the DataTable when the switch state changes.
     */
    $("#pendingBenefactorsSwitch").on("change", function () {
        table.ajax.reload();
    });

    /**
     * Opens the modal for benefactors form.
     */
    window.openAddModal = () => {
        $("#createModal").modal("show");
    };

    /**
     * Opens the modal for accepting a pending benefactor.
     *
     * @param {string} id - The ID of the pending benefactor to be accepted.
     */
    window.openAcceptModal = (id) => {
        currBenefactor = id;
        $("#acceptBenefactorModal").modal("show");
    };

    /**
     * Event handler for the click event of the accept benefactor button.
     * Sends a request to update the status of a benefactor to "active" upon acceptance.
     */
    $("#acceptBenefactorButton").on("click", function () {
        const activeData = {
            benefactorId: currBenefactor,
            status: "active",
        };
        const jsonActiveData = JSON.stringify(activeData);

        $.ajax({
            url: "/benefactors/update",
            type: "POST",
            data: jsonActiveData,
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                $("#acceptBenefactorModal").modal("hide");
                table.ajax.reload();
            },
            error: function (error) {
                console.error("Error:", error);
            },
        });
    });

    /**
     * Opens the modal for editing a benefactor's details.
     *
     * This function makes an AJAX request to retrieve the details of a benefactor with the given ID,
     * and populates the edit modal with the retrieved data.
     *
     * @param {string} id - The ID of the benefactor to be edited.
     */
    window.openEditModal = (id) => {
        currBenefactor = id;
        if (id) {
            $.ajax({
                url: "/benefactors/" + id,
                method: "GET",
                success: function (response) {
                    $("#editBenefactorId").val(response._id);
                    $("#editBenefactorName").val(response.name);
                    $("#editBenefactorDescription").val(response.description);
                    $("#editPickpoints").val(response.pickpoints.length);
                    $("#editBenefactorUsername").val(response.username);
                    $("#editBenefactorEmail").val(response.email);
                    $("#editStreet").val(response.address.street);
                    $("#editCity").val(response.address.city);
                    $("#editPostalCode").val(response.address.postalCode);
                    $("#editCountry").val(response.address.country);
                    $("#editPoints").val(response.convertationRatio.points);
                    $("#editValue").val(response.convertationRatio.value);
                    $("#editWeigthMetric").val(
                        response.convertationRatio.weigthMetric
                    );
                    $("#editPassword").val("");
                    $("#editConfirmPassword").val("");
                    editIti.setNumber(response.phone);
                    $("#editModal").modal("show");

                    if (!response.logo && $("#logoHint").is(":hidden")) {
                        $("#logoHint").show();
                    } else {
                        $("#logoHint").hide();
                    }

                    if (!response.banner && $("#bannerHint").is(":hidden")) {
                        $("#bannerHint").show();
                    } else {
                        $("#bannerHint").hide();
                    }
                },
                error: function (xhr, status, error) {
                    console.error(xhr.responseText);
                },
            });
        } else {
            console.error("Benefactor ID is missing.");
        }
    };

    /**
     * Handles the submission of the edit benefactor form.
     *
     * This function is triggered when the edit benefactor form is submitted. It validates the password fields,
     * constructs a JSON object containing benefactor data, and sends an AJAX request to update the benefactor details
     * on the server. If successful, it hides the edit modal, resets the form, and reloads the benefactors table.
     */
    $("#editBenefactorForm").submit(function (event) {
        event.preventDefault();

        let password = $("#editPassword").val();
        let confirmPassword = $("#editConfirmPassword").val();

        if (password && confirmPassword) {
            if (password !== confirmPassword) {
                $("#editErrorMessage").text("Error: Passwords do not match");
                $("#editErrorAlert")
                    .addClass("show")
                    .removeClass("fade")
                    .css("display", "block");

                return;
            }
        } else if (
            (!password && confirmPassword) ||
            (password && !confirmPassword)
        ) {
            $("#editErrorMessage").text(
                "Error: Must fill both fields or neither."
            );
            $("#editErrorAlert")
                .addClass("show")
                .removeClass("fade")
                .css("display", "block");

            return;
        }

        let bannerImage = $("#editBanner").prop("files")[0];
        let logoImage = $("#editLogo").prop("files")[0];
        const benefactorData = {
            name: $("#editBenefactorName").val(),
            username: $("#editBenefactorUsername").val(),
            description: $("#editBenefactorDescription").val(),
            email: $("#editBenefactorEmail").val(),
            password: password && confirmPassword ? password : undefined,
            roles: $("#editRoles").val(),
            address: {
                street: $("#editStreet").val(),
                city: $("#editCity").val(),
                postalCode: $("#editPostalCode").val(),
                country: $("#editCountry").val(),
            },
            convertationRatio: {
                points: $("#editPoints").val(),
                value: $("#editValue").val(),
                weigthMetric: $("#editWeigthMetric").val(),
            },
            phone: editIti.getNumber(),
            notify: $("#editNotify").is(":checked"),
            image: bannerImage || logoImage ? "y" : null,
        };
        const jsonData = JSON.stringify(benefactorData);

        $.ajax({
            url: "/benefactors/" + currBenefactor,
            type: "PUT",
            data: jsonData,
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                if (bannerImage) {
                    uploadBannerImage(benefactorData.benefactorId, bannerImage);
                }

                if (logoImage) {
                    uploadLogoImage(benefactorData.benefactorId, logoImage);
                }

                $("#editModal").modal("hide");
                $("#editBenefactorForm")[0].reset();
                table.ajax.reload();
            },
            error: function (error) {
                console.error("Error:", error);
                $("#editErrorMessage").text(
                    "Error: " + error.responseJSON.message
                );
                $("#editErrorAlert")
                    .addClass("show")
                    .removeClass("fade")
                    .css("display", "block");
            },
        });
    });

    /**
     * Handles the submission of the create benefactor form.
     *
     * This function is triggered when the create benefactor form is submitted. It validates the password fields,
     * constructs a JSON object containing benefactor data, and sends an AJAX request to add the new benefactor
     * to the server. If successful, it hides the create modal, resets the form, and reloads the benefactors table.
     * If provided, it also uploads the banner and logo images associated with the new benefactor.
     */
    $("#createBenefactorForm").submit(function (event) {
        event.preventDefault();
        let password = $("#createPassword").val();
        let confirmPassword = $("#createConfirmPassword").val();

        if (password !== confirmPassword) {
            $("#createErrorMessage").text("Passwords do not match");
            $("#createErrorAlert")
                .addClass("show")
                .removeClass("fade")
                .css("display", "block");
                
            return;
        }

        let logoImageFile = $("#createLogo").prop("files")[0];
        let bannerImageFile = $("#createBanner").prop("files")[0];
        const benefactorData = {
            name: $("#createName").val(),
            username: $("#createUsername").val(),
            email: $("#createEmail").val(),
            password: password,
            banner: bannerImageFile ? "y" : null,
            logo: logoImageFile ? "y" : null,
            description: $("#createDescription").val(),
            phone: createIti.getNumber(),
            address: {
                street: $("#createStreet").val(),
                city: $("#createCity").val(),
                postalCode: $("#createPostalCode").val(),
                country: $("#createcountry").val(),
            },
            convertationRatio: {
                points: $("#createPoints").val(),
                value: $("#createValue").val(),
                weigthMetric: $("#createWeigthMetric").val(),
            },
        };
        const jsonData = JSON.stringify(benefactorData);

        $.ajax({
            url: "/benefactors/",
            type: "POST",
            data: jsonData,
            contentType: "application/json",
            dataType: "json",
            success: (response) => {
                if (bannerImageFile) {
                    uploadBannerImage(response.result, bannerImageFile);
                }

                if (logoImageFile) {
                    uploadLogoImage(response.result, logoImageFile);
                }

                $("#createModal").modal("hide");
                $("#createBenefactorForm")[0].reset();
                table.ajax.reload();
            },
            error: function (error) {
                console.error("Error creating Benefactor:", error);
                $("#createErrorMessage").text(
                    "Error: " + error.responseJSON.message
                );
                $("#createErrorAlert")
                    .addClass("show")
                    .removeClass("fade")
                    .css("display", "block");
            },
        });
    });

    /**
     * Uploads a banner image for a benefactor.
     *
     * @param {string} benefactorId - The ID of the benefactor.
     * @param {File} bannerImageFile - The banner image file to be uploaded.
     */

    function uploadBannerImage(benefactorId, bannerImageFile) {
        const formData = new FormData();

        formData.append("entityType", "benefactor");
        formData.append("entitySubType", "profile");
        formData.append("entityId", benefactorId);
        formData.append(
            "banner",
            bannerImageFile,
            benefactorId + "-banner.jpg"
        );

        $.ajax({
            url: "/benefactors/upload/banner",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                table.ajax.reload();
            },
            error: (error) => {
                console.error("Error uploading image:", error);
            },
        });
    }

    /**
     * Uploads a logo image for a benefactor.
     *
     * @param {string} benefactorId - The ID of the benefactor.
     * @param {File} logoImageFile - The logo image file to be uploaded.
     */
    function uploadLogoImage(benefactorId, logoImageFile) {
        const formData = new FormData();

        formData.append("entityType", "benefactor");
        formData.append("entitySubType", "profile");
        formData.append("entityId", benefactorId);
        formData.append("logo", logoImageFile, benefactorId + "-logo.jpg");

        $.ajax({
            url: "/benefactors/upload/logo",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                table.ajax.reload();
            },
            error: (error) => {
                console.error("Error uploading image:", error);
            },
        });
    }

    /**
     * Opens the modal for deleting a benefactor.
     *
     * @param {string} benefactorId - The ID of the benefactor to be deleted.
     */
    window.openDeleteModal = (benefactorId) => {
        currBenefactor = benefactorId;
        $("#deleteBenefactorModal").modal("show");
    };

    /**
     * Handles the confirmation of the deletion of a benefactor.
     *
     * This function is triggered when the confirmation button in the delete benefactor modal is clicked.
     * It sends an AJAX request to delete the benefactor with the current benefactor ID (`currBenefactor`).
     * If successful, it hides the delete modal and reloads the benefactors table to reflect the changes.
     */
    $("#confirmBenefactorDelete").on("click", function () {
        $.ajax({
            url: `/benefactors/` + currBenefactor,
            method: "DELETE",
            contentType: "application/json",
            success: function (response) {
                $("#deleteBenefactorModal").modal("hide");
                table.ajax.reload();
            },
            error: function (xhr, status, error) {
                console.error("Failed to delete benefactor:", xhr.responseText);
            },
        });
    });
});
