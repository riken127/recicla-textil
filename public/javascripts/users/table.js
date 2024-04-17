$(document).ready(function () {
    /*var table = $("#usersTable").DataTable({
        pageLength: 3,
        layout: {
            topStart: {
                buttons: [
                    {
                        text: '<i class="fas fa-plus"></i> &nbsp; New User',
                        className: "btn btn-primary",
                        action: function (e, dt, node, config) {
                            $("#createModal").modal("show"); // Open the create modal when the button is clicked
                        },
                    },
                ],
            },
        },
    });

    // Event delegation for edit buttons
    $(document).on("click", ".edit-button", function () {
        var userId = $(this).data("userid");
        openEditModal(userId);
    });*/
    var dataTableOptions = {
        "processing": true,
        "searchable": true,
        "serverSide": true,
        "ajax": {
            url: "http://localhost:3000/users/all-users",
            type: "POST",
            data: function(d) {
                console.log(d);
                return d;
            }
        },
        "columns": [
            {
                "data": null,
                "title": "Name",
                "render": function(data, type, row) {
                    return `${row.firstName} ${row.lastName}`;
                }
            },
            {
                "data": "roles",
                "title": "Roles",
                "render": function(data, type, row) {
                    return data.join(', ');
                }
            },
            {
                "data": null,
                "title": "Address",
                "render": function(data, type, row) {
                    return row.address ? `${row.address.street}, ${row.address.city}, ${row.address.postalCode}, ${row.address.country}` : 'N/A';
                }
            },
            { "data": "phone", "title": "Phone" },
            {
                "data": "createdAt",
                "title": "Created At",
                "render": function(data, type, row) {
                    return new Date(data).toDateString();
                }
            },
            { "data": "language", "title": "Language" },
            {
                "data": null,
                "title": "Actions",
                "className": "text-center",
                "render": function(data, type, row) {
                    return `<a href="#" class="edit-button" onclick="openEditModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a href="#" onclick="openDeleteModal('${row._id}')"><i class="fa-solid fa-trash"></i></a>`;
                }
            }
        ],
        "paging": true,
        "pagingType": "full_numbers"
    };


        var table = $("#usersTable").DataTable(dataTableOptions);

        window.openDeleteModal = (userId) => {
        $("#deleteModal").modal("show");
        $("#confirmDelete").data("userid", userId);
    }
    // Function to open modal and fetch user data
    window.openEditModal = (id) => {
        if (id) {
            // If user ID is provided, make an AJAX request to fetch user data
            $.ajax({
                url: "/users/" + id,
                method: "GET",
                success: function (response) {
                    // Populate form fields with retrieved user data
                    $("#editUserId").val(response._id);
                    $("#editFirstName").val(response.firstName);
                    $("#editLastName").val(response.lastName);
                    $("#editRoles").val(response.roles.join(", "));
                    $("#editUsername").val(response.username);
                    $("#editEmail").val(response.email);
                    $("#editPassword").val(response.password);
                    $("#editStreet").val(response.address.street);
                    $("#editCity").val(response.address.city);
                    $("#editPostalCode").val(response.address.postalCode);
                    $("#editcountry").countrySelect("setCountry",response.address.country);
                    //$("#editphone").val(response.phone);
                    editIti.setNumber(response.phone);
                    $("#editLanguage").val(response.language);
                    $("#editModal").modal("show");
                    var form = document.getElementById("editUserForm");
                    form.action = "update";
                },
                error: function (xhr, status, error) {
                    console.error(xhr.responseText);
                },
            });
        } else {
            console.error("User ID is missing.");
        }
    }

    // Form submission event handler for edit modal
    $("#editUserForm").submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        const userData = {
            userId: $("#editUserId").val(),
            firstName: $("#editFirstName").val(),
            lastName: $("#editLastName").val(),
            username: $("#editUsername").val(),
            email: $("#editEmail").val(),
            password: $("#editPassword").val(),
            roles: $("#editRoles").val(),
            address: {
                street: $("#editStreet").val(),
                city: $("#editCity").val(),
                postalCode: $("#editPostalCode").val(),
                country: $("#createcountry").val(),
            },
            phone: editIti.getNumber(),
            language: null,
            notify: $("#editNotify").is(":checked"),
        };

        getLanguageForCountry(userData.address.country)
            .then(language => {
                userData.language = language;

                const jsonData = JSON.stringify(userData);
                $.ajax({
                    url: "/users/update", // Replace with your endpoint for updating user
                    type: "POST",
                    data: jsonData,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (response) {
                        console.log("Server response:", response);
                        $("#editModal").modal("hide");
                    },
                    error: function (error) {
                        console.error("Error:", error);
                    },
                });
            })
    });
    // Function to get language based on country code
    function getLanguageForCountry(countryName) {
        return fetch(`https://restcountries.com/v3.1/name/${countryName}`)
            .then(response => response.json())
            .then(data => {
                // Retrieve the primary language spoken in the country
                const languages = data[0].languages;
                // Assuming the first language listed is the primary one, you can retrieve its name
                const primaryLanguageCode = Object.keys(languages)[0];
                const primaryLanguageName = languages[primaryLanguageCode];
                return primaryLanguageName;
            })
            .catch(error => {
                console.error('Error fetching country data:', error);
                return null;
            });
    }
    // Form submission event handler for create modal
    $("#createUserForm").submit(function (event) {
        event.preventDefault(); // Prevent default form submission
    

        
    
        const userData = {
            firstName: $("#createFirstName").val(),
            lastName: $("#createLastName").val(),
            username: $("#createUsername").val(),
            email: $("#createEmail").val(),
            password: $("#createPassword").val(),
            roles: $("#createRoles")
                .val()
                .split(",")
                .map((role) => role.trim()),
            address: {
                street: $("#createStreet").val(),
                city: $("#createCity").val(),
                postalCode: $("#createPostalCode").val(),
                country: $("#createcountry").val(),
            },
            phone: createIti.getNumber(),
            language: null, // Placeholder for language
            notify: $("#createNotify").is(":checked"),
        };
    
        // Get the language for the selected country
        getLanguageForCountry(userData.address.country)
            .then(language => {
                // Set the user's language based on the country
                userData.language = language;
    
                // Convert data object to JSON string
                const jsonData = JSON.stringify(userData);
    
                // Send AJAX request
                $.ajax({
                    url: "/users/add",
                    type: "POST",
                    data: jsonData,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (response) {
                        console.log("User created successfully:", response);
                        // Handle successful creation (e.g., close modal, show confirmation)
                        $("#createModal").modal("hide");
                        $("#createUserForm")[0].reset();
                    },
                    error: function (error) {
                        console.error("Error creating user:", error);
                    },
                });
            })
            .catch(error => {
                console.error("Error getting language for country:", error);
            });
    });


    // Click event listener for delete confirmation button
    $(document).on("click", "#confirmDelete", function () {
        var userId = $(this).data("userid");
        if (userId) {
            // If user ID is provided, make an AJAX request to delete user
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
                    // Handle successful deletion (e.g., close modal, refresh table)
                    $("#deleteModal").modal("hide");
                },
                error: function (xhr, status, error) {
                    console.error("Error deleting user:", error);
                },
            });
        } else {
            console.error("User ID is missing.");
        }
    });

    $(document).on("click", ".delete-button", function () {
        var userId = $(this).data("userid");
        openDeleteModal(userId);
    });


    // Function to open delete modal

})
