"use strict";
/**
 * Handles authentication, registration, logout, role checks, and navigation updates.
 */
$(document).ready(function () {
    checkLoginStatus().then(function (response) {
        updateNavigation(response);
    });
    setupPasswordToggle();
    showRegistrationSuccessMessage();
    $("#login-form").on("submit", function (event) {
        event.preventDefault();
        handleLoginSubmit(this);
    });
    $(document).on("click", "#logout-button, #admin-logout-button", function (event) {
        event.preventDefault();
        logout();
    });
    $("#register-form").on("submit", function (event) {
        event.preventDefault();
        handleRegisterSubmit();
    });
});
function showRegistrationSuccessMessage() {
    // Show success message if the user was redirected after successful registration
    const params = new URLSearchParams(window.location.search);
    const registerStatus = params.get("register");
    if (registerStatus === "success") {
        $("#registration-message").fadeIn(500);
    }
}
function handleLoginSubmit(form) {
    clearLoginMessage();
    // Run HTML5 validation before sending login data
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }
    // Read login data from the form
    const identifier = getAuthInputValue("#login-identifier").trim();
    const password = getAuthInputValue("#login-password");
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
        success: function (response) {
            showLoginMessage("Login successful!", "success");
            // Role and user ID are provided by the backend and stored in the session
            if (response.role === "admin") {
                window.location.href = "/itea/frontend/sites/admin/dashboard.html";
                return;
            }
            window.location.href = "/itea/frontend/index.html";
        },
        error: function (xhr) {
            showLoginMessage(getAuthBackendError(xhr), "danger");
        },
    });
}
function logout() {
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=logout",
        type: "POST",
        dataType: "json",
        success: function () {
            window.location.href = "/itea/frontend/index.html";
        },
        error: function (xhr) {
            alert(getAuthBackendError(xhr));
        },
    });
}
function handleRegisterSubmit() {
    var _a;
    const form = $("#register-form")[0];
    // Run HTML5 validation before proceeding
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }
    // Always clear old validation and backend messages first
    $("#password-error, #field-error, #database-error, #payment-error, #register-message")
        .stop(true, true)
        .hide()
        .text("");
    const password = getAuthInputValue("#password");
    const passwordConfirm = getAuthInputValue("#password-repeat");
    let hasError = false;
    // Check 1: Password confirmation
    if (password !== passwordConfirm) {
        $("#password-error").text("Passwords do not match").fadeIn(300);
        hasError = true;
    }
    // Collect user registration data
    const newUser = {
        id: 0,
        salutation: getAuthInputValue("#salutation"),
        firstname: getAuthInputValue("#first-name"),
        lastname: getAuthInputValue("#last-name"),
        address: getAuthInputValue("#address"),
        zip: getAuthInputValue("#zip"),
        city: getAuthInputValue("#city"),
        email: getAuthInputValue("#email"),
        username: getAuthInputValue("#username"),
        password: password,
        passwordConfirm: passwordConfirm,
        role: "customer",
        active: true,
    };
    // Collect payment method data
    const newPaymentMethod = {
        paymentName: getAuthInputValue("#payment-name").trim(),
        paymentType: String((_a = $("#payment-type").val()) !== null && _a !== void 0 ? _a : ""),
        cardNumber: getAuthInputValue("#payment-number").replace(/[\s-]/g, ""),
    };
    // Check 2: Payment method validation
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
    // Check 3: Required fields
    const missingFields = getMissingRegistrationFields(newUser, newPaymentMethod);
    if (missingFields.length > 0) {
        $("#field-error")
            .text("Missing fields: " + missingFields.join(", "))
            .fadeIn(300);
        hasError = true;
    }
    if (hasError) {
        return;
    }
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=register",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(Object.assign(Object.assign({}, newUser), newPaymentMethod)),
        success: function () {
            $("#password-error, #field-error, #database-error").text("").hide();
            $("#register-form")[0].reset();
            window.location.href = "/itea/frontend/sites/login.html?register=success";
        },
        error: function (xhr) {
            $("#database-error").text(getAuthBackendError(xhr)).show();
        },
    });
}
// Validates that all required user and payment fields are populated
// Excludes fields that are auto-assigned (id, role, active)
function getMissingRegistrationFields(user, paymentMethod) {
    const missingFields = [];
    Object.entries(user).forEach(([key, value]) => {
        if (!value && key !== "id" && key !== "role" && key !== "active") {
            missingFields.push(key);
        }
    });
    Object.entries(paymentMethod).forEach(([key, value]) => {
        if (value === "" || value == null) {
            missingFields.push(key);
        }
    });
    return missingFields;
}
function setupPasswordToggle() {
    const toggleButton = $("#toggle-login-password");
    const passwordInput = $("#login-password");
    // Skip setup if the login password toggle is not present on the current page
    if (toggleButton.length === 0 || passwordInput.length === 0) {
        return;
    }
    toggleButton.on("click", function (event) {
        event.preventDefault();
        if (passwordInput.attr("type") === "password") {
            passwordInput.attr("type", "text");
            toggleButton.text("Hide");
            return;
        }
        passwordInput.attr("type", "password");
        toggleButton.text("Show");
    });
}
// Validates card numbers using the Luhn algorithm (industry standard for credit/debit cards)
// Checks: card length (13-19 digits) and sum validation (right-to-left, doubling every other digit)
function luhnCheck(cardNumber) {
    const digits = cardNumber.replace(/[\s-]/g, "");
    // Card numbers must be 13-19 digits
    if (!/^\d{13,19}$/.test(digits)) {
        return false;
    }
    let sum = 0;
    let shouldDouble = false;
    // Iterate right-to-left, doubling every other digit from the right
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);
        if (shouldDouble) {
            digit *= 2;
            // If doubling results in > 9, subtract 9 (equivalent to summing the digits)
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}
// Validates IBAN format: 2-letter country code + 2 check digits + account identifier
// Does not perform checksum validation, only format validation
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
 * Role-based access guard.
 * Redirects to home if the current user does not have the required role.
 *
 * @param requiredRole Role required to access the page
 * @param onAuthorized Optional callback executed after successful authorization
 */
function requireRole(requiredRole, onAuthorized) {
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
// Shows/hides navigation elements based on login status and user role
function updateNavigation(response) {
    var _a;
    // Always visible links (products and cart)
    $("#products-link").show();
    $("#cart-link").show();
    $("#cart-count").text((_a = response.cartCount) !== null && _a !== void 0 ? _a : 0);
    // Default state: show login link, hide role-specific links
    $("#login-link").show();
    $(".customer-link").hide();
    $(".admin-link").hide();
    // Exit early if user is not logged in
    if (!response.loggedIn) {
        return;
    }
    // User is logged in: hide login link and show role-specific content
    $("#login-link").hide();
    if (response.role === "customer") {
        $(".customer-link").show();
        return;
    }
    if (response.role === "admin") {
        $(".admin-link").show();
    }
}
function getAuthInputValue(selector) {
    const value = $(selector).val();
    return typeof value === "string" ? value : "";
}
function clearLoginMessage() {
    $("#login-message")
        .hide()
        .removeClass("alert-success alert-danger")
        .text("");
}
function showLoginMessage(message, type) {
    $("#login-message")
        .removeClass("alert-success alert-danger")
        .addClass(`alert-${type}`)
        .text(message)
        .show();
}
function getAuthBackendError(xhr) {
    var _a;
    const fallbackMessage = "An unexpected error occurred.";
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
