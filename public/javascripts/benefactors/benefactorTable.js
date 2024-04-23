$(document).ready(function () {
  var dataTableOptions = {
    layout: {
      topStart: {
        buttons: [
          {
            text: '<i class="fas fa-plus"></i> &nbsp; New Benefactor',
            className: "btn btn-primary",
            action: function (e, dt, node, config) {
              $("#createModal").modal("show"); // Open the create modal when the button is clicked
            },
          },
        ],
      },
    },
    processing: true,
    searchable: true,
    serverSide: true,
    ajax: {
      url: "http://localhost:3000/benefactors/all-benefactors",
      type: "POST",
      data: function (d) {
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
        render: function (data, type, row) {
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
      { data: "phone", title: "Phone" },
      {
        data: "createdAt",
        title: "Created At",
        render: function (data, type, row) {
          return new Date(data).toDateString();
        },
      },

      {
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

  var currentBenefactorId; // Declare a variável no escopo global
  var table = $("#benefactorsTable").DataTable(dataTableOptions);

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
                { data: 'country', title: 'Country' },
                { data: 'city', title: 'City' },
                { data: 'street', title: 'Street' },
                { data: 'postalCode', title: 'Postal Code' },
                { 
                    data: null,
                    title: 'Actions',
                    render: function(data, type, row) {
                      return `<a href="#" onclick="openEditPickpointModal('${row._id}')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a href="#" onclick="deletePickpoint('${row._id}', '${currentBenefactorId}')"><i class="fa-solid fa-trash"></i></a>`;
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


  // Function to open modal and fetch benefactorId data
  window.openEditModal = (id) => {
    if (id) {
      // If benefactor ID is provided, make an AJAX request to fetch benefactor data
      $.ajax({
        url: "/benefactors/" + id,
        method: "GET",
        success: function (response) {
          // Populate form fields with retrieved benefactor data
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
          editIti.setNumber(response.phone);
          $("#editModal").modal("show");
          var form = document.getElementById("editBenefactorForm");
          //form.action = "update";
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);
        },
      });
    } else {
      console.error("Benefactor ID is missing.");
    }
  };

  // Form submission event handler for edit modal
  $("#editBenefactorForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    const benefactorData = {
      benefactorId: $("#editBenefactorId").val(),
      firstName: $("#editBenefactorName").val(),
      username: $("#editBenefactorUsername").val(),
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
      notify: $("#editNotify").is(":checked"),
    };

    const jsonData = JSON.stringify(benefactorData);
    $.ajax({
      url: "/benefactors/update", // Replace with your endpoint for updating benefactor
      type: "POST",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        console.log("Server response:", response);
        $("#editModal").modal("hide");
        table.ajax.reload();
      },
      error: function (error) {
        console.error("Error:", error);
      },
    });
    table.ajax.reload();
  });

  // Form submission event handler for create modal
  $("#createBenefactorForm").submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    const benefactorData = {
      name: $("#createName").val(),
      username: $("#createUsername").val(),
      email: $("#createEmail").val(),
      password: $("#createPassword").val(),
      banner: $("#createBanner").val(),
      logo: $("#createLogo").val(),
      description: $("#createDescription").val(),
      address: {
        street: $("#createStreet").val(),
        city: $("#createCity").val(),
        postalCode: $("#createPostalCode").val(),
        country: $("#createcountry").val(),
      },
      phone: createIti.getNumber(),
    };

    // Convert data object to JSON string
    const jsonData = JSON.stringify(benefactorData);
    // Send AJAX request
    console.log(benefactorData);

    $.ajax({
      url: "/benefactors/add",
      type: "POST",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",

      success: function (response) {
        console.log("Benefactor created successfully:", response);
        // Handle successful creation (e.g., close modal, show confirmation)
        $("#createModal").modal("hide");
        $("#createBenefactorForm")[0].reset();
      },

      error: function (error) {
        console.error("Error creating Benefactor:", error);
      },
    });

    table.ajax.reload();
  });

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

  $(document).on('submit', '#createPickpointForm', function(event) {
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
    console.log("Sending data: ", pickpointData);
  
    $.ajax({
      url: `/benefactors/${currentBenefactorId}/pickpoints/add`, // Use a variável global aqui
      type: "POST",
      data: jsonData,
      contentType: "application/json",
      dataType: "json",
  
      success: function(response) {
        console.log("Pickpoint created successfully:", response);
        // Handle successful creation (e.g., close modal, show confirmation)
        $("#newPickpointModal").modal("hide"); // Close the newPickpointModal
        $("#createPickpointForm")[0].reset();
  
        // Close the create modal and open the pickpoints modal
        $("#createModal").modal("hide");
        openPickpointModal(currentBenefactorId, $("#editBenefactorName").val());
      },
  
      error: function(error) {
        console.error("Error creating Pickpoint:", error);
        console.error("Server response:", error.responseText);
      },
    });
  
    table.ajax.reload();
  });

  window.deletePickpoint = (id, benefactorId) => {
    // Store the ID of the pickpoint to be deleted
    window.pickpointToDelete = id;
    window.currentBenefactorId = benefactorId;
    console.log(id)
    console.log(benefactorId)

    // Open the delete confirmation modal
    $('#deleteModal').modal('show');
};
$('#confirmDelete').on('click', function() {
  // Get the ID of the pickpoint to be deleted
  var id = window.pickpointToDelete;
  var benefactorId = window.currentBenefactorId;

  console.log(id)
  console.log(benefactorId)
  // Send DELETE request
  $.ajax({
    url: `/benefactors/${benefactorId}/pickpoints/${id}/delete`,
    method: 'DELETE',
    data: JSON.stringify({ id: id }),
    contentType: "application/json",
    success: function(response) {
        console.log('Pickpoint deleted successfully:', response);
        var table = $('#pickpointsTable').DataTable();
        table.row($(`a[onclick="deletePickpoint('${id}')"]`).parents('tr')).remove().draw();
        $('#deleteModal').modal('hide');
        
        table.ajax.reload();
    },
    error: function(xhr, status, error) {
        console.error('Failed to delete pickpoint:', xhr.responseText);
    }
});
});

});
