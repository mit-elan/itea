"use strict";
/**
 * Handles customer account profile loading and profile updates.
 */
$(document).ready(function () {
    loadProfile();
    $("#account-form").on("submit", function (event) {
        event.preventDefault();
        updateProfile();
    });
});
/**
 * Loads the current customer's profile data and fills the account form.
 */
function loadProfile() {
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=getProfile",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.error) {
                window.location.href = "/itea/frontend/sites/login.html";
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
            showAccountError("Failed to load account data.");
        },
    });
}
/**
 * Sends the updated profile data to the backend.
 */
function updateProfile() {
    clearAccountMessages();
    const updatedUser = {
        firstname: getInputValue("#account-firstname"),
        lastname: getInputValue("#account-lastname"),
        email: getInputValue("#account-email"),
        address: getInputValue("#account-address"),
        zip: getInputValue("#account-zip"),
        city: getInputValue("#account-city"),
        password: getInputValue("#account-password"),
    };
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=updateProfile",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(updatedUser),
        success: function (response) {
            var _a;
            if (response.error) {
                showAccountError(response.error);
                return;
            }
            $("#account-success")
                .removeClass("d-none")
                .text((_a = response.message) !== null && _a !== void 0 ? _a : "Profile updated successfully.");
            $("#account-password").val("");
        },
        error: function () {
            showAccountError("Failed to update profile.");
        },
    });
}
/**
 * Reads an input value as a string.
 *
 * @param selector Input selector
 * @returns Input value or an empty string
 */
function getInputValue(selector) {
    const value = $(selector).val();
    return typeof value === "string" ? value : "";
}
/**
 * Hides account feedback messages.
 */
function clearAccountMessages() {
    $("#account-error").addClass("d-none").text("");
    $("#account-success").addClass("d-none").text("");
}
/**
 * Displays an account error message.
 *
 * @param message Error message to display
 */
function showAccountError(message) {
    $("#account-error").removeClass("d-none").text(message);
    $("#account-success").addClass("d-none").text("");
}
