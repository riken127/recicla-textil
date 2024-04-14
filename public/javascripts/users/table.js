$(document).ready(function () {
    var table = $("#usersTable").DataTable({
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
/*
    $(document).ready(function() {
        let countries;

        $.get('https://restcountries.com/v3.1/all?fields=name,flags', function(data) {
            countries = data;
            assignValues();
            handleCountryChange();
        });

        function assignValues() {
            const select = $('#createCountry');
            countries.forEach(country => {
                const option = $('<option></option>').attr('value', country.cca2).text(country.name.common);
                select.append(option);
            });
        }

        function handleCountryChange() {
            const countryCode = $('#createCountry').val();
            const countryData = countries.find(country => countryCode === country.cca2);
            const flagUrl = countryData.flags.png; // Adjusted to match the structure of the data
            $('#phoneCountryFlag').html('<img src="' + flagUrl + '" width="20" height="20" alt="Flag">');
            // You may add phone number formatting logic here
        }

        $('#createCountry').change(handleCountryChange);
    });*/
    
    // Event delegation for edit buttons
    $(document).on("click", ".edit-button", function () {
        var userId = $(this).data("userid");
        openEditModal(userId);
    });

    // Function to open modal and fetch user data
    function openEditModal(id) {
        if (id) {
            // If user ID is provided, make an AJAX request to fetch user data
            $.ajax({
                url: "/users/" + id,
                method: "GET",
                success: function (response) {
                    // Populate form fields with retrieved user data
                    $("#firstName").val(response.firstName);
                    $("#lastName").val(response.lastName);
                    $("#roles").val(response.roles.join(", "));
                    $("#street").val(response.address.street);
                    $("#city").val(response.address.city);
                    $("#postalCode").val(response.address.postalCode);
                    $("#country").val(response.address.country);
                    $("#phone").val(response.phone);
                    $("#language").val(response.language);
                    $("#userId").val(id);
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

        const userId = $("#userId").val();
        const firstName = $("#firstName").val();
        const lastName = $("#lastName").val();
        const roles = $("#roles").val();
        const street = $("#street").val();
        const city = $("#city").val();
        const postalCode = $("#postalCode").val();
        const country = $("#country").val();
        const phone = $("#phone").val();
        const language = $("#language").val();

        const address = {
            street: street,
            city: city,
            postalCode: postalCode,
            country: country,
        };

        const userData = {
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            roles: roles,
            address: address,
            phone: phone,
            language: language,
        };

        // Convert data object to JSON string
        const jsonData = JSON.stringify(userData);

        // Send data using AJAX (replace with your server-side URL and method)
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
    });

    // Form submission event handler for create modal
    $("#createUserForm").submit(function (event) {
        event.preventDefault(); // Prevent default form submission
    
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
            phone: iti.getNumber(),
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
                url: "/users/delete/" + userId,
                method: "DELETE",
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

    // Function to open delete modal
    function openDeleteModal(userId) {
        $("#deleteModal").modal("show");
        $("#confirmDelete").data("userid", userId);
    }
});
