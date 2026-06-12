/**
 * auth.ts – Login & Registrierung
 * Sprint 1: SCRUM-54 (Login Formular), SCRUM-53 (Admin-User), SCRUM-52/51 (Registrierung)
 */

// TODO Sprint 1: login(), register(), logout(), checkLoginCookie()

interface LoginResponse {
  success?: boolean;
  error?: string;
  message?: string;
  userId?: number;
  role?: string;
  username?: string;
}

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

    const form = this as HTMLFormElement;
    // HTML5 Validierung ausführen - macht die roten Rahmen, wenn fehlende Felder erkannt werden
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Login-Daten aus dem Formular holen
    const identifier = ($("#login-identifier").val() as string).trim();
    const password = $("#login-password").val() as string;
    const remember = $("#remember-login").is(":checked");

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=users&method=login",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        identifier: identifier,
        password: password,
        remember: remember,
      }),
      success: function (response: LoginResponse) {
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
          window.location.href = "/itea/frontend/sites/admin/dashboard.html";
          return;
        } else {
          window.location.href = "/itea/frontend/index.html";
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

  $(document).on(
    "click",
    "#logout-button, #admin-logout-button",
    function (event) {
      event.preventDefault();

      $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=logout",
        type: "POST",
        dataType: "json",
        success: function () {
          window.location.href = "/itea/frontend/index.html";
        },
        error: function (xhr) {
          alert("Fehler: " + xhr.responseText);
        },
      });
    },
  );

  //Register
  $("#register-form").on("submit", function (event) {
    event.preventDefault();

    // 1. IMMER zuerst alles wegräumen — Animationen stoppen, Text löschen, verstecken
    $(
      "#password-error, #field-error, #database-error, #payment-error, #register-message",
    )
      .stop(true, true) // Stoppt alle laufenden Animationen (wichtig gegen "Nachladen" alter Fehler)
      .hide() // Versteckt die Boxen
      .text(""); // Löscht den Textinhalt (leert die Nachricht)

    const password = $("#password").val() as string;
    const passwordConfirm = $("#password-repeat").val() as string;

    // Flag ob es Fehler gibt
    let hasError = false;

    // Check 1: Passwörter
    if (password !== passwordConfirm) {
      $("#password-error").text("Passwords do not match").fadeIn(300);
      hasError = true;
    }

    // Alle Felder in ein User-Objekt packen
    const newUser: User = {
      id: 0, // assigned by the database
      salutation: $("#salutation").val() as string,
      firstname: $("#first-name").val() as string,
      lastname: $("#last-name").val() as string,
      address: $("#address").val() as string,
      zip: $("#zip").val() as string,
      city: $("#city").val() as string,
      email: $("#email").val() as string,
      username: $("#username").val() as string,
      password: password,
      passwordConfirm: passwordConfirm,
      role: "customer",
      active: true,
    };

    // Check 2: Zahlungsmethode
    const newPaymentMethod: PaymentMethod = {
      paymentName: ($("#payment-name").val() as string).trim(),
      paymentType: String($("#payment-type").val() ?? ""),
      cardNumber: ($("#payment-number").val() as string).replace(/[\s-]/g, ""),
    };

    if (
      newPaymentMethod.paymentType === "0" &&
      !luhnCheck(newPaymentMethod.cardNumber)
    ) {
      $("#payment-error").text("Invalid card number").fadeIn(300);
      hasError = true;
    } else if (
      newPaymentMethod.paymentType === "1" &&
      !ibanCheck(newPaymentMethod.cardNumber)
    ) {
      $("#payment-error")
        .text("Invalid IBAN (expected format e.g. AT12 3456 7890 1234 5678)")
        .fadeIn(300);
      hasError = true;
    }

    // Check 3: Pflichtfelders
    const missingFields: string[] = [];

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
      dataType: "json",
      data: JSON.stringify({ ...newUser, ...newPaymentMethod }),
      success: function (response) {
        // Falls das Backend trotzdem einen Fehler meldet (z.B. Email existiert schon)
        if (response.error) {
          $("#database-error").text(response.error).show();
          return;
        }

        $("#password-error, #field-error, #database-error").text("").hide();
        ($("#register-form")[0] as HTMLFormElement).reset();
        window.location.href =
          "/itea/frontend/sites/login.html?register=success";
      },

      error: function (xhr) {
        $("#database-error")
          .text("Registration failed: " + xhr.responseText)
          .show();
      },
    });
  });
});

function setupPasswordToggle(): void {
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
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

// Einfache IBAN-Formatprüfung: 2 Buchstaben, 2 Ziffern, bis zu 30 alphanumerische Zeichen
function ibanCheck(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(cleaned);
}

function checkLoginStatus(): JQuery.jqXHR {
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
function requireRole(requiredRole: string, onAuthorized?: () => void): void {
  checkLoginStatus().then(function (response) {
    if (response.role !== requiredRole) {
      window.location.href = "/itea/frontend/index.html";
      return;
    }
    if (onAuthorized) {
      onAuthorized();
    }
  });
}

function updateNavigation(response: any): void {
  $("#products-link").show();
  $("#cart-link").show();
  $("#cart-count").text(response.cartCount);

  if (response.loggedIn && response.role === "customer") {
    $("#login-link").hide();
    $(".customer-link").show();
    return;
  }
}
