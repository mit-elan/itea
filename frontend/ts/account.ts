/**
 * account.ts – Kundenkonto, Bestellhistorie, Rechnung
 * Sprint 2: SCRUM-62, SCRUM-63, SCRUM-64, SCRUM-65
 */

// TODO Sprint 2: loadProfile(), updateProfile(), loadOrders(), printInvoice()

interface UpdateProfileRequest {
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  zip: string;
  city: string;
  password: string;
}

$(document).ready(function () {
  loadProfile();
  $("#account-form").on("submit", function (event) {
    event.preventDefault();

    updateProfile();
  });
});

function loadProfile(): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=users&method=getProfile",
    type: "GET",
    dataType: "json",

    success: function (response) {
      if (response.error) {
        window.location.href = "/itea/frontend/sites/login.php";

        return;
      }

      $("#account-content").removeClass("d-none");

      $("#account-firstname").val(response.firstname);

      $("#account-lastname").val(response.lastname);

      $("#account-email").val(response.email);

      $("#account-address").val(response.address);

      $("#account-zip").val(response.zip);

      $("#account-city").val(response.city);
    },

    error: function () {
      $("#account-error")
        .removeClass("d-none")
        .text("Failed to load account data.");
    },
  });
}

function updateProfile(): void {
  $("#account-error").addClass("d-none").text("");

  $("#account-success").addClass("d-none").text("");
  
  const updatedUser: UpdateProfileRequest = {
    firstname: $("#account-firstname").val() as string,
    lastname: $("#account-lastname").val() as string,
    email: $("#account-email").val() as string,
    address: $("#account-address").val() as string,
    zip: $("#account-zip").val() as string,
    city: $("#account-city").val() as string,
    password: $("#account-password").val() as string,
  };

  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=users&method=updateProfile",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(updatedUser),

    success: function (response) {
      if (response.error) {
        $("#account-error").removeClass("d-none").text(response.error);

        return;
      }

      $("#account-success")
        .removeClass("d-none")
        .text("Profile updated successfully.");

      $("#account-error").addClass("d-none").text("");

      $("#account-password").val("");
    },

    error: function () {
      $("#account-error")
        .removeClass("d-none")
        .text("Failed to update profile.");
    },
  });
}
