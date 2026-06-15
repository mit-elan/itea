"use strict";
/**
 * Handles the dedicated admin order management page.
 * Loads all customer orders, displays order details in a modal,
 * and allows admins to remove individual items from an order.
 *
 * Access control is handled through requireRole("admin"), which redirects
 * unauthorized users before the page logic is initialized.
 */
$(document).ready(function () {
    requireRole("admin", function () {
        loadOrders();
    });
    $("#orders-table-body").on("click", ".view-order-details-btn", function () {
        const orderId = Number($(this).data("order-id"));
        loadOrderDetails(orderId, true);
    });
    $(document).on("click", ".remove-order-item-btn", function () {
        const orderId = Number($(this).data("order-id"));
        const orderItemId = Number($(this).data("order-item-id"));
        removeOrderItem(orderId, orderItemId);
    });
    function loadOrders() {
        $("#orders-table-body").empty();
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=admin&method=getAllOrders",
            type: "GET",
            dataType: "json",
            success: function (orders) {
                if (orders.error) {
                    showMessage(orders.error, "danger");
                    return;
                }
                orders.forEach(function (order) {
                    const row = `
            <tr>
              <td class="ps-4">#${order.id}</td>
              <td>${formatDate(order.date)}</td>
              <td>
                ${order.first_name} ${order.last_name}
                <div class="text-muted small">${order.email}</div>
              </td>
              <td>${order.invoice_number}</td>
              <td>€ ${Number(order.subtotal).toFixed(2)}</td>
              <td>€ ${Number(order.voucher).toFixed(2)}</td>
              <td>€ ${Number(order.total_price).toFixed(2)}</td>
              <td class="text-end pe-4">
                <button
                  class="btn btn-outline-dark btn-sm rounded-0 view-order-details-btn"
                  data-order-id="${order.id}"
                >
                  Details
                </button>
              </td>
            </tr>
          `;
                    $("#orders-table-body").append(row);
                });
            },
            error: function (xhr) {
                showBackendError(xhr);
            },
        });
    }
    function loadOrderDetails(orderId, showModal = false) {
        $("#orderDetailsModalLabel").text(`Order #${orderId}`);
        $("#modal-order-details").html("<p class='mb-0'>Loading order details...</p>");
        if (showModal) {
            const modalElement = document.getElementById("orderDetailsModal");
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        }
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=admin&method=getOrderDetails&orderId=" +
                orderId,
            type: "GET",
            dataType: "json",
            success: function (response) {
                if (response.error) {
                    showMessage(response.error, "danger");
                    showOrderDetailsError(response.error);
                    return;
                }
                renderOrderDetails(response.order, response.items);
            },
            error: function (xhr) {
                showBackendError(xhr);
                showOrderDetailsError("Order details could not be loaded.");
            },
        });
    }
    function removeOrderItem(orderId, orderItemId) {
        if (!confirm("Remove this product line from the order?")) {
            return;
        }
        $.ajax({
            url: "/itea/backend/serviceHandler.php?handler=admin&method=removeOrderItem",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                orderId: orderId,
                orderItemId: orderItemId,
            }),
            success: function (response) {
                showMessage(response.message || "Order item removed successfully.", "success");
                loadOrders();
                loadOrderDetails(orderId, false);
            },
            error: function (xhr) {
                showBackendError(xhr);
            },
        });
    }
    function formatDate(dateString) {
        const date = new Date(dateString.replace(" ", "T"));
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return date.toLocaleString("de-AT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    function showMessage(message, type) {
        $("#order-message")
            .removeClass("alert-success alert-danger")
            .addClass(`alert-${type}`)
            .text(message)
            .show();
    }
    function showBackendError(xhr) {
        let errorMessage = "An unexpected error occurred.";
        if (xhr.responseText) {
            try {
                const response = JSON.parse(xhr.responseText);
                errorMessage = response.error || errorMessage;
            }
            catch (_a) {
                errorMessage = xhr.responseText;
            }
        }
        showMessage(errorMessage, "danger");
    }
    // Renders order details using templates
    function renderOrderDetails(order, items) {
        const detailsElement = cloneAdminTemplate("order-details-template");
        // Fill order header
        detailsElement.find(".order-detail-title").text(`Order #${order.id}`);
        detailsElement
            .find(".order-detail-customer")
            .text(`${order.first_name} ${order.last_name} (${order.username})`);
        detailsElement.find(".order-detail-email").text(order.email);
        detailsElement
            .find(".order-detail-address")
            .text(`${order.address}, ${order.zip} ${order.city}`);
        detailsElement.find(".order-detail-invoice").text(order.invoice_number);
        detailsElement.find(".order-detail-date").text(formatDate(order.date));
        detailsElement
            .find(".order-detail-total")
            .text(`€ ${Number(order.total_price).toFixed(2)}`);
        // Fill order items
        const itemsBody = detailsElement.find(".order-detail-items-body");
        if (items.length === 0) {
            itemsBody.html(cloneAdminTemplate("order-detail-empty-row-template").html());
        }
        else {
            items.forEach((item) => {
                const itemRow = renderOrderDetailItem(item, order.id);
                itemsBody.append(itemRow);
            });
        }
        $("#modal-order-details").html(detailsElement.html());
    }
    // Renders a single order item row
    function renderOrderDetailItem(item, orderId) {
        const row = cloneAdminTemplate("order-detail-item-row-template");
        const itemTotal = Number(item.unit_price) * Number(item.quantity);
        row.find(".order-item-name").text(item.name);
        row.find(".order-item-quantity").text(item.quantity);
        row
            .find(".order-item-unit-price")
            .text(`€ ${Number(item.unit_price).toFixed(2)}`);
        row.find(".order-item-total").text(`€ ${itemTotal.toFixed(2)}`);
        row
            .find(".remove-order-item-btn")
            .data("order-id", orderId)
            .data("order-item-id", item.id);
        return row.html() || "";
    }
    // Displays error message in the order details modal
    function showOrderDetailsError(message) {
        const errorElement = cloneAdminTemplate("order-details-error-template");
        errorElement.find(".order-details-error-message").text(message);
        $("#modal-order-details").html(errorElement.html());
    }
    // Clones a template by ID and returns jQuery object
    function cloneAdminTemplate(templateId) {
        var _a;
        const template = document.getElementById(templateId);
        if (!template || !(template instanceof HTMLTemplateElement)) {
            return $();
        }
        const clone = (_a = template.content.firstElementChild) === null || _a === void 0 ? void 0 : _a.cloneNode(true);
        return clone ? $(clone) : $();
    }
});
