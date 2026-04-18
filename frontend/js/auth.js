"use strict";
/**
 * auth.ts – Login & Registrierung
 * Sprint 1: SCRUM-54 (Login Formular), SCRUM-53 (Admin-User), SCRUM-52/51 (Registrierung)
 */
$(document).ready(function () {
    $("#register-form").on("submit", function (event) {
        event.preventDefault();
        $("#password-error").hide().text("");
        $("#field-error").hide().text("");
        const password = $("#password").val();
        const passwordConfirm = $("#password-repeat").val();
        // Flag ob es Fehler gibt
        let hasError = false;
        // Check 1: Passwörter
        if (password !== passwordConfirm) {
            $("#password-error").text("Passwords do not match").show();
            hasError = true; // kein return – weitermachen mit nächstem Check
        }
        // Alle Felder in ein User-Objekt packen
        const newUser = {
            id: 0, // ID wird vom Server vergeben
            salutation: $("#salutation").val(),
            firstname: $("#first-name").val(),
            lastname: $("#last-name").val(),
            address: $("#address").val(),
            zip: $("#zip").val(),
            city: $("#city").val(),
            email: $("#email").val(),
            username: $("#username").val(),
            password: password,
            role: "customer",
            active: true,
        };
        // Check 2: Pflichtfelder
        const missingFields = [];
        Object.entries(newUser).forEach(([key, value]) => {
            if (!value && key !== "id" && key !== "role" && key !== "active") {
                missingFields.push(key);
            }
        });
        if (missingFields.length > 0) {
            $("#field-error")
                .text("Missing fields: " + missingFields.join(", "))
                .show();
            hasError = true;
        }
        // Erst hier abbrechen wenn irgendein Fehler vorhanden
        if (hasError) {
            return;
        }
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=users&method=register",
            type: "POST",
            data: newUser,
            success: function (response) {
                if (response.error) {
                    $("#database-error").text(response.error).show();
                }
                else {
                    alert("Registrierung erfolgreich!");
                }
            },
            error: function (xhr) {
                alert("Fehler: " + xhr.responseText);
            },
        });
    });
});
