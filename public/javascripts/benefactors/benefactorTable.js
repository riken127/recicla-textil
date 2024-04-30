// Variable to store the currently selected benefactorId.
let currBenefactor;

// Document ready function.
$(document).ready(function () {
    // DataTable options.
    var dataTableOptions = {
        layout: {
            // Layout customization.
            topStart: {
                buttons: [
                    {
                        // Button to open create modal.
                        text: '<i class="fas fa-plus"></i> &nbsp; New Benefactor',
                        className: "btn btn-primary",
                        action: function (e, dt, node, config) {
                            $("#createModal").modal("show");
                        },
                    },
                ],
            },
        },
        // DataTable settings.
        processing: true,
        searchable: true,
        serverSide: true,
        ajax: {
            // Endpoint for fetching data.
            url: "http://localhost:3000/benefactors/all-benefactors",
            type: "POST",
            data: function (d) {
                return d;
            },
        },
        // Columns configuration.
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
                    // Render PickPoints column with associated count.
                    if (data.length > 0) {
                        return `<a href="#" class="expand-button" onclick="openPickpointModal('${row._id}', '${row.name}')" title="${data.length} Pickpoints"><i class="fa-solid fa-up-right-and-down-left-from-center px-4 align-items-center"></i></a>`;
                    } else {
                        return `<a href="#" class="expand-button" onclick="openPickpointModal('${row._id}', '${row.name}')" title="This Benefactor has ${data.length} associated Pickpoints!"><i class="fa-solid fa-triangle-exclamation px-4 align-items-center"></i></a>`;
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
            {data: "phone", title: "Phone"},
            {
                data: "createdAt",
                title: "Created At",
                render: function (data, type, row) {
                    return new Date(data).toDateString();
                },
            },

            {
                // Actions column.
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


    // Initialize DataTable.
    var table = $("#benefactorsTable").DataTable(dataTableOptions);


    // Function to open edit modal for benefactor.
    window.openEditModal = (id) => {
        if (id) {
            // AJAX request to fetch benefactor data for editing.
            $.ajax({
                url: "/benefactors/" + id,
                method: "GET",
                success: function (response) {
                    // Populate edit modal with benefactor data.
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
                    $("#editPassword").val(response.password);
                    $("#editConfirmPassword").val(response.password);
                    $("#editPoints").val(response.convertationRatio.points);
                    $("#editValue").val(response.convertationRatio.value);
                    $("#editWeigthMetric").val(response.convertationRatio.weigthMetric);
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
                    var form = document.getElementById("editBenefactorForm");
                },
                error: function (xhr, status, error) {
                    console.error(xhr.responseText);
                },
            });
        } else {
            console.error("Benefactor ID is missing.");
        }
    };


    // Submit edit benefactor form.
    $("#editBenefactorForm").submit(function (event) {
        event.preventDefault();
        // Construct benefactor data object from form fields.
        let password = $("#editPassword").val();
        let confirmPassword = $("#editConfirmPassword").val();

        if (password !== confirmPassword) {
            $("#editErrorMessage").text("Error: Passwords do not match");
            $("#editErrorAlert").addClass("show").removeClass("fade").css("display", "block");
            return;
        }

        let bannerImage = $("#editBanner").prop("files")[0];
        let logoImage = $("#editLogo").prop("files")[0];
        const benefactorData = {
            // Populate benefactor data object from form fields.
            benefactorId: $("#editBenefactorId").val(),
            name: $("#editBenefactorName").val(),
            username: $("#editBenefactorUsername").val(),
            description: $("#editBenefactorDescription").val(),
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
            convertationRatio: {
                points: $("#editPoints").val(),
                value: $("#editValue").val(),
                weigthMetric: $("#editWeigthMetric").val(),
            },
            notify: $("#editNotify").is(":checked"),
            image: (bannerImage || logoImage) ? 'y' : null
        };


        const jsonData = JSON.stringify(benefactorData);
        // AJAX request to update benefactor.
        $.ajax({
            url: "/benefactors/update",
            type: "POST",
            data: jsonData,
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                if (bannerImage) {
                    uploadBannerImage(benefactorData.benefactorId, bannerImage);
                    uploadLogoImage(benefactorData.benefactorId, logoImage);
                }
                $("#editModal").modal("hide");
                $("#editBenefactorForm")[0].reset();
                table.ajax.reload();
            },
            error: function (error) {
                console.error("Error:", error);
                $("#editErrorMessage").text("Error: " + error.responseJSON.message);
                $("#editErrorAlert").addClass("show").removeClass("fade").css("display", "block");
            },
        });
        table.ajax.reload();
    });

    // Submit create benefactor form.
    $("#createBenefactorForm").submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get password and confirm password values.
        let password = $("#createPassword").val();
        let confirmPassword = $("#createConfirmPassword").val();

        if (password !== confirmPassword) {
            $("#createErrorMessage").text("Passwords do not match");
            $("#createErrorAlert").addClass("show").removeClass("fade").css("display", "block");
            return;
        }

        let logoImageFile = $("#createLogo").prop("files")[0];
        let bannerImageFile = $("#createBanner").prop("files")[0];
        // Construct benefactor data object from form fields.
        const benefactorData = {
            // Populate with form field values.
            name: $("#createName").val(),
            username: $("#createUsername").val(),
            email: $("#createEmail").val(),
            password: password,
            banner: bannerImageFile ? 'y' : null,
            logo: logoImageFile ? 'y' : null,
            description: $("#createDescription").val(),
            address: {
                street: $("#createStreet").val(),
                city: $("#createCity").val(),
                postalCode: $("#createPostalCode").val(),
                country: $("#createcountry").val(),
            },
            phone: createIti.getNumber(),
            convertationRatio: {
                points: $("#createPoints").val(),
                value: $("#createValue").val(),
                weigthMetric: $("#createWeigthMetric").val(),
            },
        };


        const jsonData = JSON.stringify(benefactorData);


        // AJAX request to add new benefactor.
        $.ajax({
            url: "/benefactors/add",
            type: "POST",
            data: jsonData,
            contentType: "application/json",
            dataType: "json",
            success:  (response) => {
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
                $("#createErrorMessage").text("Error: " + error.responseJSON.message);
                $("#createErrorAlert").addClass("show").removeClass("fade").css("display", "block");
            },
        });
    });

    function uploadBannerImage(benefactorId, bannerImageFile) {
        const formData = new FormData();
        formData.append('entityType', 'benefactor');
        formData.append('entitySubType', 'profile')
        formData.append('entityId', benefactorId);
        formData.append('banner', bannerImageFile, benefactorId + '-banner.jpg');

        $.ajax({
           url: '/benefactors/upload/banner',
           type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
               console.log('Image uploaded successfully', response);
               table.ajax.reload();
            },
            error: (error) => {
               console.error("Error uploading image:", error);
            }
        });
    }
    function uploadLogoImage(benefactorId, logoImageFile) {
        const formData = new FormData();
        formData.append('entityType', 'benefactor');
        formData.append('entitySubType', 'profile')
        formData.append('entityId', benefactorId);
        formData.append('logo', logoImageFile, benefactorId + '-logo.jpg');
        $.ajax({
            url: '/benefactors/upload/logo',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                console.log('Image uploaded successfully', response);
                table.ajax.reload();
            },
            error: (error) => {
                console.error("Error uploading image:", error);
            }
        });
    }
    // Function to open delete modal for benefactor.
    window.openDeleteModal = (benefactorId) => {
        currBenefactor = benefactorId;
        $("#deleteBenefactorModal").modal("show");
        console.log("Benefactor ID:", currBenefactor);
    }


    // Confirm delete action for benefactor.
    $('#confirmBenefactorDelete').on('click', function () {
        $.ajax({
            url: `/benefactors/delete`,
            method: 'POST',
            data: JSON.stringify({id: currBenefactor}),
            contentType: "application/json",
            success: function (response) {
                $('#deleteBenefactorModal').modal('hide');
            },
            error: function (xhr, status, error) {
                console.error('Failed to delete benefactor:', xhr.responseText);
            }
        });
        table.ajax.reload();
    });

});
