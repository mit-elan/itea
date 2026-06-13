"use strict";
$(document).ready(function () {
    loadOrders();
});
function loadOrders() {
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=orders&method=getOrders",
        type: "GET",
        dataType: "json",
        success: function (response) {
            $("#orders-error").addClass("d-none").text("");
            $("#orders-empty").addClass("d-none");
            $("#orders-content").addClass("d-none");
            $("#orders-list").empty();
            if (isOrdersErrorResponse(response)) {
                window.location.href = "/itea/frontend/sites/login.html";
                return;
            }
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
            console.log(xhr.responseText);
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
function isOrdersErrorResponse(response) {
    return (typeof response === "object" &&
        response !== null &&
        "error" in response &&
        typeof response.error === "string");
}
function cloneOrdersTemplate(templateId) {
    const template = document.getElementById(templateId);
    if (!template || !template.content.firstElementChild) {
        return $();
    }
    return $(template.content.firstElementChild.cloneNode(true));
}
function formatOrdersCurrency(value) {
    return `€ ${Number(value !== null && value !== void 0 ? value : 0).toFixed(2)}`;
}
