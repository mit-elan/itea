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

  function loadOrders(): void {
    $("#orders-table-body").empty();

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=admin&method=getAllOrders",
      type: "GET",
      dataType: "json",
      success: function (orders: AdminOrderOverview[]) {
        if ((orders as any).error) {
          showMessage((orders as any).error, "danger");
          return;
        }

        orders.forEach(function (order: AdminOrderOverview) {
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
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

  function loadOrderDetails(orderId: number, showModal: boolean = false): void {
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
      url:
        "/itea/backend/serviceHandler.php?handler=admin&method=getOrderDetails&orderId=" +
        orderId,
      type: "GET",
      dataType: "json",
      success: function (response: {
        order: OrderDetails;
        items: OrderItem[];
        error?: string;
      }) {
        if (response.error) {
          showMessage(response.error, "danger");
          showOrderDetailsError(response.error);
          return;
        }

        renderOrderDetails(response.order, response.items);
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
        showOrderDetailsError("Order details could not be loaded.");
      },
    });
  }

  function removeOrderItem(orderId: number, orderItemId: number): void {
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
      success: function (response: { message?: string }) {
        showMessage(
          response.message || "Order item removed successfully.",
          "success"
        );

        loadOrders();
        loadOrderDetails(orderId, false);
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

  function formatDate(dateString: string): string {
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

  function showMessage(message: string, type: "success" | "danger"): void {
    $("#order-message")
      .removeClass("alert-success alert-danger")
      .addClass(`alert-${type}`)
      .text(message)
      .show();
  }

  function showBackendError(xhr: JQuery.jqXHR): void {
    let errorMessage = "An unexpected error occurred.";

    if (xhr.responseText) {
      try {
        const response = JSON.parse(xhr.responseText);
        errorMessage = response.error || errorMessage;
      } catch {
        errorMessage = xhr.responseText;
      }
    }

    showMessage(errorMessage, "danger");
  }

  // Renders order details using templates
  function renderOrderDetails(order: OrderDetails, items: OrderItem[]): void {
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
    } else {
      items.forEach((item) => {
        const itemRow = renderOrderDetailItem(item, order.id);
        itemsBody.append(itemRow);
      });
    }

    $("#modal-order-details").html(detailsElement.html());
  }

  // Renders a single order item row
  function renderOrderDetailItem(item: OrderItem, orderId: number): string {
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
  function showOrderDetailsError(message: string): void {
    const errorElement = cloneAdminTemplate("order-details-error-template");
    errorElement.find(".order-details-error-message").text(message);
    $("#modal-order-details").html(errorElement.html());
  }

  // Clones a template by ID and returns jQuery object
  function cloneAdminTemplate(templateId: string): JQuery {
    const template = document.getElementById(templateId);
    if (!template || !(template instanceof HTMLTemplateElement)) {
      return $();
    }
    const clone = template.content.firstElementChild?.cloneNode(true);
    return clone ? $(clone as HTMLElement) : $();
  }
});