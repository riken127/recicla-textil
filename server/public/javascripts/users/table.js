$(document).ready(function () {
    // DataTable options.
    var dataTableOptions = {
        // Layout customization.
        layout: {
            topStart: {
                buttons: [
                    {
                        // Button to open create modal.
                        text: '<i class="fas fa-plus"></i> &nbsp; New User',
                        className: "btn btn-primary",
                        action: function (e, dt, node, config) {
                            $("#createModal").modal("show");
                        },
                    },
                ],
            },
        },
        // DataTable settings.
        "processing": true,
        "searchable": true,
        "serverSide": true,
        "ajax": {
            // Endpoint for fetching data.
            url: "http://localhost:3000/users/all-users",
            type: "POST",
            data: function (d) {
                console.log(d);
                return d;
            }
        },
        // Columns configuration.
        "columns": [
            {
                "data": null,
                "title": "Name",
                "render": function (data, type, row) {
                    return `${row.firstName} ${row.lastName}`;
                }
            },
            {
                "data": "roles",
                "title": "Roles",
                "render": function (data, type, row) {
                    return data.join(', ');
                }
            },
            {
                "data": null,
                "title": "Address",
                "render": function (data, type, row) {
                    return row.address ? `${row.address.street}, ${row.address.city}, ${row.address.postalCode}, ${row.address.country}` : 'N/A';
                }
            },
            {"data": "phone", "title": "Phone"},
            {
                "data": "createdAt",
                "title": "Created At",
                "render": function (data, type, row) {
                    return new Date(data).toDateString();
                }
            },
            {"data": "language", "title": "Language"},
            {
                // Actions column.
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

    // Initialize DataTable.
    var table = $("#usersTable").DataTable(dataTableOptions);

    // Function to open delete modal.
    window.openDeleteModal = (userId) => {
        console.log(userId)
        $("#deleteModal").modal("show");
        $("#confirmDelete").data("userid", userId);
    }

    // Function to open edit modal.
    window.openEditModal = (id) => {
        if (id) {
            // AJAX request to fetch user data for editing.
            $.ajax({
                url: "/users/" + id,
                method: "GET",
                success: function (response) {
                    // Populate edit modal with user data.
                    $("#editUserId").val(response._id);
                    $("#editFirstName").val(response.firstName);
                    $("#editLastName").val(response.lastName);
                    if (!response.image && $("#pfpHint").is(":hidden")) {
                        $("#pfpHint").show();
                    } else {
                        $("#pfpHint").hide();
                    }
                    $("#editUsername").val(response.username);
                    $("#editEmail").val(response.email);
                    $("#editPassword").val("");
                    $("#editConfirmPassword").val("");
                    $("#editStreet").val(response.address.street);
                    $("#editCity").val(response.address.city);
                    $("#editPostalCode").val(response.address.postalCode);
                    $("#editcountry").countrySelect("setCountry", response.address.country);
                    editIti.setNumber(response.phone);
                    $("#editRoles").val(response.roles[0]).change();
                        $("#editNotify")[0].checked = response.notify;
                    $("#editLanguage").val(response.language);
                    $("#editModal").modal("show");
                },
                error: function (xhr, status, error) {
                    console.error(xhr.responseText);
                },
            });
        } else {
            console.error("User ID is missing.");
        }
    }

    // Submit edit user form.
    $("#editUserForm").submit(function (event) {
        event.preventDefault();
        // Construct user data object from form fields.
        let password = $("#editPassword").val();
        let confirmPassword = $("#editConfirmPassword").val();


        if (password && confirmPassword) {
            if (password !== confirmPassword) {
                $("#editErrorMessage").text("Error: Passwords do not match.");
                $("#editErrorAlert").addClass("show").removeClass("fade").css("display", "block");
                return;
            }
        } else if (!password && confirmPassword || password && !confirmPassword) {
            $("#editErrorMessage").text("Error: Must fill both fields or neither.");
            $("#editErrorAlert").addClass("show").removeClass("fade").css("display", "block");
            return;
        }

        let imageFile = $("#editImage").prop("files")[0];
        const userData = {
            // Populate with form fields.
            userId: $("#editUserId").val(),
            firstName: $("#editFirstName").val(),
            lastName: $("#editLastName").val(),
            username: $("#editUsername").val(),
            email: $("#editEmail").val(),
            password: (password && confirmPassword) ? (password) : (undefined),
            roles: $("#editRoles").val(),
            address: {
                street: $("#editStreet").val(),
                city: $("#editCity").val(),
                postalCode: $("#editPostalCode").val(),
                country: $("#editcountry").val(),
            },
            phone: editIti.getNumber(),
            language: null,
            notify: $("#editNotify").is(":checked"),
            image: imageFile ? 'y' : null
        };

        // Get language for country and then submit form.
        getLanguageForCountry(userData.address.country)
            .then(language => {
                userData.language = language;
                const jsonData = JSON.stringify(userData);
                // AJAX request to update user.
                $.ajax({
                    url: "/users/update",
                    type: "POST",
                    data: jsonData,
                    contentType: "application/json",
                    dataType: "json",
                    success:  (response) => {
                        if (imageFile) {
                            uploadEditImage(userData.userId, imageFile);
                        } else {
                            $("#editModal").modal("hide")
                            $("#editUserForm")[0].reset();
                            table.ajax.reload();
                        }
                    },
                    error: (error) => {
                        console.log("Error:" + error)
                        $("#editErrorMessage").text("Error: " + error.responseJSON.message);
                        $("#editErrorAlert").addClass("show").removeClass("fade").css("display", "block");
                    },
                });
            })
            .catch(error => {
                console.error("Error getting language for country:", error);
            });
        table.ajax.reload();
    });

    function uploadEditImage(userId, imageFile) {
        const formData = new FormData();
        formData.append('entityType', 'user');
        formData.append('entityId', userId);
        formData.append('image', imageFile, userId + '.jpg');

        $.ajax({
            url: "/users/upload",
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                $("#editModal").modal("hide");
                $("#editUserForm")[0].reset();
                table.ajax.reload();
            },
            error: (error) => {
                $("#editErrorMessage").text("Error: ", error.message);
                $("#editErrorAlert").addClass("show").removeClass("fade").css("display", "block");
            }
        });
    }
    // Function to get language for country.
    function getLanguageForCountry(countryName) {
        // Fetch language data from restAPI.
        return fetch(`https://restcountries.com/v3.1/name/${countryName}`)
            .then(response => response.json())
            .then(data => {
                const languages = data[0].languages;
                const primaryLanguageCode = Object.keys(languages)[0];
                const primaryLanguageName = languages[primaryLanguageCode];
                return primaryLanguageName;
            })
            .catch(error => {
                console.error('Error fetching country data:', error);
                return 'English';
            });
    }

    // Submit create user data
    $("#createUserForm").submit(function (event) {
        event.preventDefault();

        // Get password and confirm password values
        let password = $("#createPassword").val();
        let confirmPassword = $("#createConfirmPassword").val();

        // Check if passwords match
        if (password !== confirmPassword) {
            // Display error message in the modal
            $("#createErrorMessage").text("Passwords do not match");
            $("#createErrorAlert").addClass("show").removeClass("fade").css("display", "block");
            return; // Stop form submission
        }

        let imageFile = $("#createImage").prop("files")[0];

        // Construct user data object from form fields.
        const userData = {
            // Populate with form field values.
            firstName: $("#createFirstName").val(),
            lastName: $("#createLastName").val(),
            username: $("#createUsername").val(),
            email: $("#createEmail").val(),
            password: password,
            roles: $("#createRoles").val(),
            address: {
                street: $("#createStreet").val(),
                city: $("#createCity").val(),
                postalCode: $("#createPostalCode").val(),
                country: $("#createcountry").val(),
            },
            phone: createIti.getNumber(),
            language: null,
            notify: $("#createNotify").is(":checked"),
            image: imageFile ? 'y' : null,
        };

        // Get language for country and then submit form.
        getLanguageForCountry(userData.address.country)
            .then(language => {
                userData.language = language;

                const jsonData = JSON.stringify(userData);

                // AJAX request to add new user.
                $.ajax({
                    url: "/users/add",
                    type: "POST",
                    data: jsonData,
                    contentType: "application/json",
                    dataType: "json",
                    success: (response) => {
                        if (imageFile) {
                            uploadCreateImage(response.result, imageFile);
                        } else {
                            $("#createModal").modal("hide");
                            $("#createUserForm")[0].reset();
                            table.ajax.reload();
                        }
                    },
                    error: (error) => {
                        console.error("Error creating user:", error);
                        // Display error message in the modal
                        $("#createErrorMessage").text("Error: " + error.responseJSON.message);
                        $("#createErrorAlert").addClass("show").removeClass("fade").css("display", "block");
                    },
                });
            })
            .catch(error => {
                console.error("Error getting language for country:", error);
            });
        table.ajax.reload();
    });

    function uploadCreateImage(userId, imageFile) {
        const formData = new FormData();
        formData.append('entityType', 'user');
        formData.append('entityId', userId);
        formData.append('image', imageFile, userId + '.jpg');
        $.ajax({
            url: '/users/upload/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                console.log('Image uploaded successfully', response);
                $("#createModal").modal("hide");
                $("#createUserForm")[0].reset();
                table.ajax.reload();
            },
            error: (error) => {
                console.error("Error uploading image:", error);
            }
        });
    }
    // Confirm delete action.
    $(document).on("click", "#confirmDelete", function () {
        var userId = $(this).data("userid");
        if (userId) {
            // AJAX request to delete user.
            $.ajax({
                url: "/users/delete/",
                method: "POST",
                data: JSON.stringify({
                    id: userId
                }),
                contentType: "application/json",
                dataType: "json",
                success: function (response) {
                    console.log("User deleted successfully:", response);
                    $("#deleteModal").modal("hide");
                    table.ajax.reload();
                },
                error: function (xhr, status, error) {
                    console.error("Error deleting user:", error);
                },
            });
        } else {
            console.error("User ID is missing.");
        }
    });
});
