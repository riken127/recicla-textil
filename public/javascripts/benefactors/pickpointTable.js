$(document).ready(function () {
    var currentBenefactorId;
    var currentPickpointId;
    window.openDeletePickpointModal = (pickPointId, benefactorId) => {
        console.log(benefactorId + " " + pickPointId);
        $("#deletePickpointModal").modal("show");
        $("#confirmDelete").data({
            "benefactorid": benefactorId,
            "pickpointid": pickPointId,
        });
    };

    window.openPickpointModal = (benefactorId, benefactorName) => {
        currentBenefactorId = benefactorId;
        $('#pickpointModalLabel').html(`Pickpoints for ${benefactorName}`);

        if (!$.fn.DataTable.isDataTable('#pickpointsTable')) {
            // Initialize DataTables if not already initialized
            $('#pickpointsTable').DataTable({
                ajax: {
                    url: `/benefactors/${benefactorId}/pickpoints/all`,
                    dataSrc: ''
                },
                columns: [
                    {data: 'country', title: 'Country'},
                    {data: 'city', title: 'City'},
                    {data: 'street', title: 'Street'},
                    {data: 'postalCode', title: 'Postal Code'},
                    {
                        data: null,
                        title: 'Actions',
                        render: function (data, type, row) {
                            return `<a href="#" onclick="openEditPickpointModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a href="#" onclick="openDeletePickpointModal('${row._id}')"><i class="fa-solid fa-trash"></i></a>`;
                        }
                    }
                ]
            });
        } else {
            // If DataTables is already initialized, just reload the data
            $('#pickpointsTable').DataTable().ajax.url(`/benefactors/${benefactorId}/pickpoints/all`).load();
        }

        $("#pickpointModal").modal("show");
        $('#pickpointModal').on('hidden.bs.modal', function (e) {
            // Use the DataTables API to clear the table
            $('#pickpointsTable').DataTable().clear().draw();
        });
    };


    window.openDeletePickpointModal = (id) => {

        currentPickpointId = id;

        $('#deletePickpointModal').modal('show');
    };

// Função para abrir o modal de edição e preencher os campos do formulário
    window.openEditPickpointModal = (pickpointId) => {
        window.pickpointToEdit = pickpointId;
        // Faça uma solicitação AJAX para buscar os dados do Pickpoint
        $.ajax({
            url: `/benefactors/${currentBenefactorId}/pickpoints/${pickpointId}`,
            method: "GET",
            success: function (response) {
                // Preencha os campos do formulário com os dados do Pickpoint
                $("#editPickpointStreet").val(response.street);
                $("#editPickpointPostalCode").val(response.postalCode);
                $("#editPickpointCity").val(response.city);
                $("#editpickpointcountry").val(response.country);

                // Abra o modal de edição
                $("#editPickpointModal").modal("show");
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText);
            },
        });
    };

// Manipulador de eventos para o formulário de edição
    $("#editPickpointForm").submit(function (event) {
        event.preventDefault(); // Evite a submissão padrão do formulário

        // Crie um objeto com os dados do Pickpoint
        const pickpointData = {
            street: $("#editPickpointStreet").val(),
            postalCode: $("#editPickpointPostalCode").val(),
            city: $("#editPickpointCity").val(),
            country: $("#editpickpointcountry").val(),
        };

        // Converta o objeto de dados em uma string JSON
        const jsonData = JSON.stringify(pickpointData);

        // Envie uma solicitação AJAX para a rota de atualização
        $.ajax({
            url: `/benefactors/${currentBenefactorId}/pickpoints/${window.pickpointToEdit}/update`,
            type: "POST",
            data: jsonData,
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                console.log("Pickpoint updated successfully:", response);
                // Feche o modal de edição
                $("#editPickpointModal").modal("hide");
                // Recarregue a tabela de Pickpoints
                $('#pickpointsTable').DataTable().ajax.reload();
            },
            error: function (error) {
                console.error("Error updating Pickpoint:", error);
            },
        });
    });

    $(document).on('submit', '#createPickpointForm', function (event) {
        event.preventDefault(); // Prevent default form submission
        console.log("Create Pickpoint form submitted");
        const pickpointData = {
            street: $("#inputPickpointStreet").val(),
            city: $("#inputPickpointCity").val(),
            postalCode: $("#inputPickpointPostalCode").val(),
            country: $("#createpickpointcountry").val(),
        };

        // Convert data object to JSON string
        const jsonData = JSON.stringify(pickpointData);
        // Send AJAX request

        $.ajax({
            url: `/benefactors/${currentBenefactorId}/pickpoints/add`, // Use a variável global aqui
            type: "POST",
            data: jsonData,
            contentType: "application/json",
            dataType: "json",

            success: function (response) {
                console.log("Pickpoint created successfully:", response);
                // Handle successful creation (e.g., close modal, show confirmation)
                $("#newPickpointModal").modal("hide"); // Close the newPickpointModal
                $("#createPickpointForm")[0].reset();

                // Close the create modal and open the pickpoints modal
                $("#createModal").modal("hide");
                openPickpointModal(currentBenefactorId, $("#editBenefactorName").val());
            },

            error: function (error) {
                console.error("Error creating Pickpoint:", error);
                console.error("Server response:", error.responseText);
            },
        });

        $('#pickpointsTable').DataTable().ajax.reload();
    });


    $('#confirmPickpointDelete').on('click', function (e) {
        $.ajax({
            url: `/benefactors/${currentBenefactorId}/pickpoints/${currentPickpointId}`,
            method: 'DELETE',
            success: (response) => {
                $("#deletePickpointModal").modal("hide");
                $('#pickpointsTable').DataTable().ajax.reload();
            },
            error: (xhr, status, error) => {
                console.error('Failed to delete pickpoint', xhr.responseText);
            }
        });
    })
});