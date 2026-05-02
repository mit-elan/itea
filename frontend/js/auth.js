"use strict";
/**
 * auth.ts – Login & Registrierung
 * Sprint 1: SCRUM-54 (Login Formular), SCRUM-53 (Admin-User), SCRUM-52/51 (Registrierung)
 */
//Login
$(document).ready(function () {
    checkLoginStatus();
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
                window.location.href = "/itea/frontend/index.php";
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
        event.preventDefault();
        // 1. IMMER zuerst alles wegräumen — Animationen stoppen, Text löschen, verstecken
        $("#password-error, #field-error, #database-error, #register-message")
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
            dataType: "json",
            data: newUser,
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
/*
function setupPasswordToggle(): void {
  const toggleButton = document.getElementById(
    "toggle-login-password",
  ) as HTMLButtonElement | null;
  const passwordInput = document.getElementById(
    "login-password",
  ) as HTMLInputElement | null;

  if (!toggleButton || !passwordInput) {
    return;
  }

  toggleButton.addEventListener("click", function (event) {
    event.preventDefault();

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleButton.textContent = "Hide";
      return;
    }

    passwordInput.type = "password";
    toggleButton.textContent = "Show";
  });
}*/
function checkLoginStatus() {
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=status",
        type: "GET",
        dataType: "json",
        success: function (response) {
            $(".customer-link").hide();
            $(".admin-link").hide();
            $("#login-link").show();
            $("#register-link").show();
            $("#products-link").show();
            $("#cart-link").show();
            if (response.loggedIn && response.role === "customer") {
                $("#login-link").hide();
                $("#register-link").hide();
                $(".customer-link").show();
                return;
            }
            if (response.loggedIn && response.role === "admin") {
                $("#login-link").hide();
                $("#register-link").hide();
                $("#products-link").hide();
                $("#cart-link").hide();
                $(".admin-link").show();
            }
        },
    });
}
