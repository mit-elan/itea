"use strict";
/**
 * auth.ts – Login & Registrierung
 * Sprint 1: SCRUM-54 (Login Formular), SCRUM-53 (Admin-User), SCRUM-52/51 (Registrierung)
 */
//Login
$(document).ready(function () {
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
    });
    setupPasswordToggle();
    //Parameter aus der URL lesen, falls User von Registration weitergeleitet wurde, wird Success Meesage ausgespielt
    const params = new URLSearchParams(window.location.search);
    const registerStatus = params.get("register");
    if (registerStatus === "success") {
        $("#registration-message").fadeIn(500);
    }
    $("#login-form").on("submit", function (event) {
        event.preventDefault();
        $("#login-message")
            .hide()
            .removeClass("alert-success alert-danger")
            .text("");
        const form = this;
        // HTML5 Validierung ausführen - macht die roten Rahmen, wenn fehlende Felder erkannt werden
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }
        // Login-Daten aus dem Formular holen
        const identifier = $("#login-identifier").val().trim();
        const password = $("#login-password").val();
        const remember = $("#remember-login").is(":checked");
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=users&method=login",
            type: "POST",
            dataType: "json",
            data: {
                identifier: identifier,
                password: password,
                remember: remember,
            },
            success: function (response) {
                if (response.error) {
                    $("#login-message")
                        .addClass("alert-danger")
                        .text(response.error)
                        .show();
                    return;
                }
                $("#login-message")
                    .addClass("alert-success")
                    .text("Login successful!")
                    .show();
                // Rolle und User-ID werden vom Backend geliefert und dort in der Session gespeichert
                if (response.role === "admin") {
                    window.location.href = "/itea/frontend/sites/admin/dashboard.php";
                    return;
                }
                else {
                    window.location.href = "/itea/frontend/index.php";
                }
            },
            error: function (xhr) {
                $("#login-message")
                    .addClass("alert-danger")
                    .text("Fehler: " + xhr.responseText)
                    .show();
            },
        });
    });
    $("#logout-button, #admin-logout-button").on("click", function (event) {
        event.preventDefault();
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=users&method=logout",
            type: "POST",
            dataType: "json",
            success: function () {
                window.location.href = "/itea/frontend/index.php";
            },
            error: function (xhr) {
                alert("Fehler: " + xhr.responseText);
            },
        });
    });
    //Register
    $("#register-form").on("submit", function (event) {
        var _a;
        event.preventDefault();
        // 1. IMMER zuerst alles wegräumen — Animationen stoppen, Text löschen, verstecken
        $("#password-error, #field-error, #database-error, #payment-error, #register-message")
            .stop(true, true) // Stoppt alle laufenden Animationen (wichtig gegen "Nachladen" alter Fehler)
            .hide() // Versteckt die Boxen
            .text(""); // Löscht den Textinhalt (leert die Nachricht)
        const password = $("#password").val();
        const passwordConfirm = $("#password-repeat").val();
        // Flag ob es Fehler gibt
        let hasError = false;
        // Check 1: Passwörter
        if (password !== passwordConfirm) {
            $("#password-error").text("Passwords do not match").fadeIn(300);
            hasError = true;
        }
        // Alle Felder in ein User-Objekt packen
        const newUser = {
            id: 0, // assigned by the database
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
        // Check 2: Zahlungsmethode
        const newPaymentMethod = {
            paymentName: $("#payment-name").val().trim(),
            paymentType: String((_a = $("#payment-type").val()) !== null && _a !== void 0 ? _a : ""),
            cardNumber: $("#payment-number").val().replace(/[\s-]/g, ""),
        };
        if (newPaymentMethod.paymentType === "0" &&
            !luhnCheck(newPaymentMethod.cardNumber)) {
            $("#payment-error").text("Invalid card number").fadeIn(300);
            hasError = true;
        }
        else if (newPaymentMethod.paymentType === "1" &&
            !ibanCheck(newPaymentMethod.cardNumber)) {
            $("#payment-error")
                .text("Invalid IBAN (expected format e.g. AT12 3456 7890 1234 5678)")
                .fadeIn(300);
            hasError = true;
        }
        // Check 3: Pflichtfelders
        const missingFields = [];
        Object.entries(newUser).forEach(([key, value]) => {
            if (!value && key !== "id" && key !== "role" && key !== "active") {
                missingFields.push(key);
            }
        });
        Object.entries(newPaymentMethod).forEach(([key, value]) => {
            if (value === "" || value == null) {
                missingFields.push(key);
            }
        });
        if (missingFields.length > 0) {
            $("#field-error")
                .text("Missing fields: " + missingFields.join(", "))
                .fadeIn(300);
            hasError = true;
        }
        // Erst hier abbrechen wenn irgendein Fehler vorhanden
        if (hasError) {
            return;
        }
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=users&method=register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(Object.assign(Object.assign({}, newUser), newPaymentMethod)),
            success: function (response) {
                // Falls das Backend trotzdem einen Fehler meldet (z.B. Email existiert schon)
                if (response.error) {
                    $("#database-error").text(response.error).show();
                    return;
                }
                $("#password-error, #field-error, #database-error").text("").hide();
                $("#register-form")[0].reset();
                window.location.href =
                    "/itea/frontend/sites/login.php?register=success";
            },
            error: function (xhr) {
                $("#database-error")
                    .text("Registration failed: " + xhr.responseText)
                    .show();
            },
        });
    });
});
function setupPasswordToggle() {
    const $toggleButton = $("#toggle-login-password");
    const $passwordInput = $("#login-password");
    // Prüfen ob Elemente existieren
    if ($toggleButton.length === 0 || $passwordInput.length === 0) {
        return;
    }
    $toggleButton.on("click", function (event) {
        event.preventDefault();
        if ($passwordInput.attr("type") === "password") {
            $passwordInput.attr("type", "text");
            $toggleButton.text("Hide");
            return;
        }
        $passwordInput.attr("type", "password");
        $toggleButton.text("Show");
    });
}
// Luhn-Algorithmus: prüft ob eine Kartennummer rechnerisch gültig ist
function luhnCheck(cardNumber) {
    const digits = cardNumber.replace(/[\s-]/g, "");
    if (!/^\d{13,19}$/.test(digits))
        return false;
    let sum = 0;
    let double = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);
        if (double) {
            digit *= 2;
            if (digit > 9)
                digit -= 9;
        }
        sum += digit;
        double = !double;
    }
    return sum % 10 === 0;
}
// Einfache IBAN-Formatprüfung: 2 Buchstaben, 2 Ziffern, bis zu 30 alphanumerische Zeichen
function ibanCheck(iban) {
    const cleaned = iban.replace(/\s/g, "").toUpperCase();
    return /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(cleaned);
}
function checkLoginStatus() {
    return $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=status",
        type: "GET",
        dataType: "json",
    });
}
/**
 * Role-based access guard: redirects to home if user doesn't have required role
 * Used on protected pages (e.g., admin dashboard)
 *
 * @param requiredRole Role required to access the page (e.g., "admin")
 * @param onAuthorized Optional callback executed only if user has required role
 */
function requireRole(requiredRole, onAuthorized) {
    checkLoginStatus().then(function (response) {
        if (response.role !== requiredRole) {
            window.location.href = "/itea/frontend/index.php";
            return;
        }
        if (onAuthorized) {
            onAuthorized();
        }
    });
}
function updateNavigation(response) {
    $("#products-link").show();
    $("#cart-link").show();
    $("#cart-count").text(response.cartCount);
    if (response.loggedIn && response.role === "customer") {
        $("#login-link").hide();
        $(".customer-link").show();
        return;
    }
}
