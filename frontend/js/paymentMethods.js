"use strict";
/**
 * Payment methods page
 * Loads saved payment methods, creates new payment methods,
 * and allows customers to delete existing payment methods.
 */
$(document).ready(function () {
    loadPaymentMethods();
    // Delete selected payment method
    $(document).on("click", ".delete-payment", function () {
        const paymentId = Number($(this).data("id"));
        deletePaymentMethod(paymentId);
    });
    // Create a new payment method from the form
    $("#payment-form").on("submit", function (event) {
        event.preventDefault();
        createPaymentMethod();
    });
});
function loadPaymentMethods() {
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=payment&method=getPaymentMethods",
        type: "GET",
        dataType: "json",
        success: function (response) {
            var _a;
            $("#payment-error").addClass("d-none").text("");
            $("#payment-list").empty();
            if (isPaymentActionErrorResponse(response)) {
                showPaymentError((_a = response.error) !== null && _a !== void 0 ? _a : "Failed to load payment methods.");
                return;
            }
            if (!response.paymentMethods || response.paymentMethods.length === 0) {
                $("#payment-list").append(clonePaymentTemplate("payment-empty-template"));
                return;
            }
            response.paymentMethods.forEach(function (payment) {
                $("#payment-list").append(createPaymentMethodCard(payment));
            });
        },
        error: function (xhr) {
            showPaymentError(getPaymentBackendError(xhr));
        },
    });
}
function createPaymentMethodCard(payment) {
    const card = clonePaymentTemplate("payment-method-card-template");
    const isBankAccount = String(payment.is_bank_account) === "1";
    const type = isBankAccount ? "Bank Account" : "Credit Card";
    const iconClass = isBankAccount ? "bi-bank" : "bi-credit-card";
    const maskedNumber = payment.card_number.length > 4
        ? "•••• " + payment.card_number.slice(-4)
        : payment.card_number;
    card.find(".payment-label").text(payment.label);
    card.find(".payment-type").text(type);
    card.find(".payment-number").text(maskedNumber);
    card
        .find(".payment-icon")
        .removeClass("bi-bank bi-credit-card")
        .addClass(iconClass);
    card.find(".delete-payment").data("id", payment.id);
    return card;
}
function createPaymentMethod() {
    var _a, _b, _c;
    $("#payment-error").addClass("d-none").text("");
    const paymentType = String((_a = $("#payment-type").val()) !== null && _a !== void 0 ? _a : "");
    const paymentNumber = String((_b = $("#payment-number").val()) !== null && _b !== void 0 ? _b : "").replace(/[\s-]/g, "");
    const paymentLabel = String((_c = $("#payment-label").val()) !== null && _c !== void 0 ? _c : "").trim();
    if (!paymentLabel || !paymentNumber) {
        showPaymentError("Please fill in all fields.");
        return;
    }
    // Validate card number or IBAN based on selected payment type
    if (paymentType === "0" && !luhnCheck(paymentNumber)) {
        showPaymentError("Invalid card number.");
        return;
    }
    if (paymentType === "1" && !ibanCheck(paymentNumber)) {
        showPaymentError("Invalid IBAN.");
        return;
    }
    const paymentRequest = {
        paymentType: paymentType,
        cardNumber: paymentNumber,
        paymentName: paymentLabel,
    };
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=payment&method=createPaymentMethod",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(paymentRequest),
        dataType: "json",
        success: function (response) {
            var _a;
            if (!response.success) {
                showPaymentError((_a = response.error) !== null && _a !== void 0 ? _a : "Failed to create payment method.");
                return;
            }
            $("#payment-form")[0].reset();
            loadPaymentMethods();
        },
        error: function (xhr) {
            showPaymentError(getPaymentBackendError(xhr));
        },
    });
}
function deletePaymentMethod(paymentId) {
    if (!confirm("Do you really want to delete this payment method?")) {
        return;
    }
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=payment&method=deletePaymentMethod",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ paymentId: paymentId }),
        success: function (response) {
            var _a;
            if (!response.success) {
                showPaymentError((_a = response.error) !== null && _a !== void 0 ? _a : "Failed to delete payment method.");
                return;
            }
            loadPaymentMethods();
        },
        error: function (xhr) {
            showPaymentError(getPaymentBackendError(xhr));
        },
    });
}
function isPaymentActionErrorResponse(response) {
    return ("success" in response &&
        response.success === false &&
        typeof response.error === "string");
}
function clonePaymentTemplate(templateId) {
    const template = document.getElementById(templateId);
    const templateElement = template === null || template === void 0 ? void 0 : template.content.firstElementChild;
    if (!templateElement) {
        return $();
    }
    return $(templateElement.cloneNode(true));
}
function showPaymentError(message) {
    $("#payment-error").removeClass("d-none").text(message);
}
function getPaymentBackendError(xhr) {
    var _a;
    const fallbackMessage = "Failed to process payment method request.";
    if (!xhr.responseText) {
        return fallbackMessage;
    }
    try {
        const response = JSON.parse(xhr.responseText);
        return (_a = response.error) !== null && _a !== void 0 ? _a : fallbackMessage;
    }
    catch (_b) {
        return xhr.responseText;
    }
}
