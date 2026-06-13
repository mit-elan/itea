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
      success: function (response: AdminOrderOverview[] | AdminOrderErrorResponse) {
        if (isAdminOrderErrorResponse(response)) {
          showMessage(response.error, "danger");
          return;
        }

        response.forEach(function (order: AdminOrderOverview) {
          $("#orders-table-body").append(createOrderRow(order));
        });
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

  function createOrderRow(order: AdminOrderOverview): JQuery<HTMLElement> {
    const row = cloneTemplate("order-row-template");

    row.find(".order-id").text(`#${order.id}`);
    row.find(".order-date").text(formatDate(order.date));
    row
      .find(".order-customer-name")
      .text(`${order.first_name} ${order.last_name}`);
    row.find(".order-customer-email").text(order.email);
    row.find(".order-invoice").text(order.invoice_number);
    row.find(".order-subtotal").text(formatCurrency(order.subtotal));
    row.find(".order-voucher").text(formatCurrency(order.voucher));
    row.find(".order-total").text(formatCurrency(order.total_price));

    row.find(".view-order-details-btn").data("order-id", order.id);

    return row;
  }

  function loadOrderDetails(orderId: number, showModal: boolean = false): void {
    $("#orderDetailsModalLabel").text(`Order #${orderId}`);
    $("#modal-order-details")
      .empty()
      .append(cloneTemplate("order-details-loading-template"));

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

  function renderOrderDetails(order: OrderDetails, items: OrderItem[]): void {
    const details = cloneTemplate("order-details-template");

    details.find(".order-detail-title").text(`Order #${order.id}`);
    details
      .find(".order-detail-customer")
      .text(`${order.first_name} ${order.last_name} (${order.username})`);
    details.find(".order-detail-email").text(order.email);
    details
      .find(".order-detail-address")
      .text(`${order.address}, ${order.zip} ${order.city}`);
    details.find(".order-detail-invoice").text(order.invoice_number);
    details.find(".order-detail-date").text(formatDate(order.date));
    details.find(".order-detail-total").text(formatCurrency(order.total_price));

    const itemContainer = details.find(".order-detail-items-body");

    if (items.length === 0) {
      itemContainer.append(cloneTemplate("order-detail-empty-row-template"));
    } else {
      items.forEach(function (item: OrderItem) {
        itemContainer.append(createOrderItemRow(order.id, item));
      });
    }

    $("#modal-order-details").empty().append(details);
  }

  function createOrderItemRow(
    orderId: number,
    item: OrderItem,
  ): JQuery<HTMLElement> {
    const row = cloneTemplate("order-detail-item-row-template");
    const itemTotal = Number(item.unit_price) * Number(item.quantity);

    row.find(".order-item-name").text(item.name);
    row.find(".order-item-quantity").text(item.quantity);
    row.find(".order-item-unit-price").text(formatCurrency(item.unit_price));
    row.find(".order-item-total").text(formatCurrency(itemTotal));

    row.find(".remove-order-item-btn").data("order-id", orderId);
    row.find(".remove-order-item-btn").data("order-item-id", item.id);

    return row;
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
          "success",
        );

        loadOrders();
        loadOrderDetails(orderId, false);
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

  function showOrderDetailsError(message: string): void {
    const errorTemplate = cloneTemplate("order-details-error-template");

    errorTemplate.find(".order-details-error-message").text(message);

    $("#modal-order-details").empty().append(errorTemplate);
  }

  function cloneTemplate(templateId: string): JQuery<HTMLElement> {
    const template = document.getElementById(
      templateId,
    ) as HTMLTemplateElement | null;

    if (!template || !template.content.firstElementChild) {
      return $();
    }

    return $(template.content.firstElementChild.cloneNode(true) as HTMLElement);
  }

  function formatCurrency(value: number | string | null): string {
    return `€ ${Number(value ?? 0).toFixed(2)}`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString.replace(" ", "T"));

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  function isAdminOrderErrorResponse(response: unknown): response is AdminOrderErrorResponse {
    return (
      typeof response === "object" &&
      response !== null &&
      "error" in response &&
      typeof (response as AdminOrderErrorResponse).error === "string"
    );
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
});
