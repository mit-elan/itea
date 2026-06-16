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
            $("#account-content").removeClass("d-none");
            $("#account-firstname").val(response.firstname);
            $("#account-lastname").val(response.lastname);
            $("#account-email").val(response.email);
            $("#account-address").val(response.address);
            $("#account-zip").val(response.zip);
            $("#account-city").val(response.city);
        },
        error: function (xhr) {
            const errorMessage = xhr.responseText || "Failed to load account data.";
            showAccountError(errorMessage);
        },
    });
}
/**
 * Sends the updated profile data to the backend.
 */
function updateProfile() {
    const form = $("#account-form")[0];

    // Run HTML5 validation before proceeding
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

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
    // Validate all required fields are filled
    const missingFields = [];
    if (!updatedUser.firstname)
        missingFields.push("First Name");
    if (!updatedUser.lastname)
        missingFields.push("Last Name");
    if (!updatedUser.email)
        missingFields.push("Email");
    if (!updatedUser.address)
        missingFields.push("Address");
    if (!updatedUser.zip)
        missingFields.push("ZIP");
    if (!updatedUser.city)
        missingFields.push("City");
    if (!updatedUser.password)
        missingFields.push("Password");
    if (missingFields.length > 0) {
        showAccountError(`Missing fields: ${missingFields.join(", ")}`);
        return;
    }
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=updateProfile",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(updatedUser),
        success: function (response) {
            $("#account-success")
                .removeClass("d-none")
                .text(response.message);
            $("#account-password").val("");
        },
        error: function (xhr) {
            const errorMessage = getAccountError(xhr);
            showAccountError(errorMessage);
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
 * Extracts error message from backend API error response
 *
 * @param xhr jQuery AJAX error response object
 * @returns Error message from backend or fallback message
 */
function getAccountError(xhr) {
    var _a;
    const fallbackMessage = "Failed to update profile.";
    if (!xhr.responseText) {
        return fallbackMessage;
    }
    try {
        const response = JSON.parse(xhr.responseText);
        return (_a = response.error) !== null && _a !== void 0 ? _a : fallbackMessage;
    }
    catch (_b) {
        return fallbackMessage;
    }
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
