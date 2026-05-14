"use strict";
/**
 * account.ts – Kundenkonto, Bestellhistorie, Rechnung
 * Sprint 2: SCRUM-62, SCRUM-63, SCRUM-64, SCRUM-65
 */
$(document).ready(function () {
    loadProfile();
    $("#account-form").on("submit", function (event) {
        event.preventDefault();
        updateProfile();
    });
});
function loadProfile() {
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
function updateProfile() {
    $("#account-error").addClass("d-none").text("");
    $("#account-success").addClass("d-none").text("");
    const updatedUser = {
        firstname: $("#account-firstname").val(),
        lastname: $("#account-lastname").val(),
        email: $("#account-email").val(),
        address: $("#account-address").val(),
        zip: $("#account-zip").val(),
        city: $("#account-city").val(),
        password: $("#account-password").val(),
    };
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=updateProfile",
        type: "POST",
        dataType: "json",
        data: updatedUser,
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
