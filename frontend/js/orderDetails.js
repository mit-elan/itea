"use strict";
/**
 * Order details page
 * Loads a single order, renders order items,
 * and generates the invoice PDF for download.
 */
let currentOrder = null;
$(document).ready(function () {
    loadOrderDetails();
    showOrderSuccessMessage();
    $(document).on("click", "#download-invoice", function () {
        generateInvoicePdf();
    });
});
function showOrderSuccessMessage() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
        $("#order-success").removeClass("d-none");
    }
}
function loadOrderDetails() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("id");
    if (!orderId) {
        showOrderDetailsError("No order ID was provided.");
        return;
    }
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=orders&method=getOrderById&id=" +
            orderId,
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (isOrderDetailsErrorResponse(response)) {
                showOrderDetailsError(response.error);
                return;
            }
            currentOrder = response;
            renderOrderDetails(response);
        },
        error: function (xhr) {
            console.error("Error loading order details:", getOrderDetailsBackendError(xhr));
            showOrderDetailsError("Failed to load order details.");
        },
    });
}
function renderOrderDetails(response) {
    var _a, _b;
    $("#order-content").removeClass("d-none");
    $("#order-id").text(response.order.id);
    $("#order-date").text(response.order.date);
    $("#order-invoice").text(response.order.invoice_number);
    $("#order-total").text(formatOrderDetailsCurrency(response.order.total_price));
    // Show voucher details only if the order used a voucher
    if (response.order.voucher_code) {
        $("#subtotal-heading").removeClass("d-none");
        $("#voucher-heading").removeClass("d-none");
        $("#order-voucher").text(`- ${formatOrderDetailsCurrency((_a = response.order.voucher_discount) !== null && _a !== void 0 ? _a : 0)}`);
        $("#order-subtotal").text(formatOrderDetailsCurrency((_b = response.order.initial_price) !== null && _b !== void 0 ? _b : 0));
    }
    $("#order-items").empty();
    response.items.forEach(function (item) {
        $("#order-items").append(createOrderItemCard(item));
    });
}
function createOrderItemCard(item) {
    const card = cloneOrderDetailsTemplate("order-item-card-template");
    card
        .find(".order-item-image")
        .attr("src", `/itea/backend/productpictures/${item.file_path}`)
        .attr("alt", item.name);
    card.find(".order-item-name").text(item.name);
    card.find(".order-item-quantity").text(item.quantity);
    card.find(".order-item-price").text(formatOrderDetailsCurrency(item.price));
    return card;
}
function generateInvoicePdf() {
    if (!currentOrder) {
        return;
    }
    const invoice = createInvoiceElement(currentOrder);
    html2pdf()
        .from(invoice)
        .save(`invoice-${currentOrder.order.invoice_number}.pdf`);
}
function createInvoiceElement(orderResponse) {
    const order = orderResponse.order;
    const items = orderResponse.items;
    const invoice = cloneOrderDetailsTemplate("invoice-template");
    invoice
        .find(".invoice-customer-name")
        .text(`${order.first_name} ${order.last_name}`);
    invoice.find(".invoice-customer-address").text(order.address);
    invoice.find(".invoice-customer-city").text(`${order.zip} ${order.city}`);
    invoice.find(".invoice-customer-email").text(order.email);
    invoice.find(".invoice-number").text(order.invoice_number);
    invoice.find(".invoice-date").text(order.date);
    invoice
        .find(".invoice-total")
        .text(formatOrderDetailsCurrency(order.total_price));
    const invoiceItems = invoice.find(".invoice-items");
    items.forEach(function (item) {
        invoiceItems.append(createInvoiceItemRow(item));
    });
    // Add voucher section to invoice only if a voucher was used
    if (order.voucher_code) {
        invoice
            .find(".invoice-voucher-container")
            .append(createInvoiceVoucher(order));
    }
    return invoice.get(0);
}
function createInvoiceItemRow(item) {
    const row = cloneOrderDetailsTemplate("invoice-item-row-template");
    const itemTotal = Number(item.price) * Number(item.quantity);
    row.find(".invoice-item-name").text(item.name);
    row.find(".invoice-item-quantity").text(item.quantity);
    row
        .find(".invoice-item-unit-price")
        .text(formatOrderDetailsCurrency(item.price));
    row.find(".invoice-item-total").text(formatOrderDetailsCurrency(itemTotal));
    return row;
}
function createInvoiceVoucher(order) {
    var _a, _b, _c, _d;
    const voucher = cloneOrderDetailsTemplate("invoice-voucher-template");
    voucher
        .find(".invoice-voucher-subtotal")
        .text(formatOrderDetailsCurrency((_a = order.initial_price) !== null && _a !== void 0 ? _a : 0));
    voucher.find(".invoice-voucher-code").text((_b = order.voucher_code) !== null && _b !== void 0 ? _b : "");
    voucher
        .find(".invoice-voucher-discount")
        .text(`- ${formatOrderDetailsCurrency((_c = order.voucher_discount) !== null && _c !== void 0 ? _c : 0)}`);
    voucher
        .find(".invoice-voucher-remaining")
        .text(formatOrderDetailsCurrency((_d = order.voucher_remaining_value) !== null && _d !== void 0 ? _d : 0));
    return voucher;
}
function isOrderDetailsErrorResponse(response) {
    return (typeof response === "object" &&
        response !== null &&
        "error" in response &&
        typeof response.error === "string");
}
function cloneOrderDetailsTemplate(templateId) {
    const template = document.getElementById(templateId);
    const templateElement = template === null || template === void 0 ? void 0 : template.content.firstElementChild;
    if (!templateElement) {
        return $();
    }
    return $(templateElement.cloneNode(true));
}
function formatOrderDetailsCurrency(value) {
    return `€ ${Number(value !== null && value !== void 0 ? value : 0).toFixed(2)}`;
}
function showOrderDetailsError(message) {
    $("#order-error").removeClass("d-none").text(message);
}
function getOrderDetailsBackendError(xhr) {
    var _a;
    const fallbackMessage = "Failed to load order details.";
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
