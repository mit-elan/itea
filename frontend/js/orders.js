"use strict";
/**
 * Customer orders page
 * Loads the current customer's order history
 * and links each order to its detail page.
 */
$(document).ready(function () {
    loadOrders();
});
function loadOrders() {
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=orders&method=getOrders",
        type: "GET",
        dataType: "json",
        success: function (response) {
            clearOrdersView();
            if (response.length === 0) {
                $("#orders-empty").removeClass("d-none");
                return;
            }
            $("#orders-content").removeClass("d-none");
            response.forEach(function (order) {
                $("#orders-list").append(createOrderCard(order));
            });
        },
        error: function (xhr) {
            console.error("Error loading orders:", getOrdersBackendError(xhr));
            $("#orders-error")
                .removeClass("d-none")
                .text("Failed to load orders.");
        },
    });
}
function createOrderCard(order) {
    const card = cloneOrdersTemplate("order-card-template");
    card.find(".order-id").text(order.id);
    card.find(".order-date").text(order.date);
    card.find(".order-total").text(formatOrdersCurrency(order.total_price));
    card.find(".order-invoice").text(order.invoice_number);
    card
        .find(".view-order-link")
        .attr("href", `/itea/frontend/sites/orderDetails.html?id=${order.id}`);
    return card;
}
function clearOrdersView() {
    $("#orders-error").addClass("d-none").text("");
    $("#orders-empty").addClass("d-none");
    $("#orders-content").addClass("d-none");
    $("#orders-list").empty();
}
function cloneOrdersTemplate(templateId) {
    const template = document.getElementById(templateId);
    const templateElement = template === null || template === void 0 ? void 0 : template.content.firstElementChild;
    if (!templateElement) {
        return $();
    }
    return $(templateElement.cloneNode(true));
}
function formatOrdersCurrency(value) {
    return `€ ${Number(value !== null && value !== void 0 ? value : 0).toFixed(2)}`;
}
function getOrdersBackendError(xhr) {
    var _a;
    const fallbackMessage = "Failed to load orders.";
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
