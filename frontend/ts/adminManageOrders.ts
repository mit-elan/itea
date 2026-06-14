/**
 * Handles the admin order management page.
 * Loads all customer orders, displays order details in a modal,
 * and allows admins to remove individual items from an order.
 */


interface AdminOrderOverview {
  id: number;
  user_id: number;
  date: string;
  subtotal: number;
  voucher: number;
  total_price: number;
  invoice_number: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}
interface AdminOrderDetailsResponse {
  order: OrderDetails;
  items: OrderItem[];
  error?: string;
}

interface AdminRemoveOrderItemResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

interface AdminOrderErrorResponse {
  success?: false;
  error: string;
}

interface BackendErrorResponse {
  error?: string;
}

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

  /**
   * Loads all orders for the admin order overview.
   */
  function loadOrders(): void {
    $("#orders-table-body").empty();

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=admin&method=getAllOrders",
      type: "GET",
      dataType: "json",

      success: function (
        response: AdminOrderOverview[] | AdminOrderErrorResponse,
      ) {
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

  /**
   * Creates a table row for one order overview entry.
   *
   * @param order Admin order overview data
   * @returns Table row element
   */
  function createOrderRow(order: AdminOrderOverview): JQuery<HTMLElement> {
    const row = cloneAdminOrderTemplate("order-row-template");

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

  /**
   * Loads details for one order and optionally opens the details modal.
   *
   * @param orderId Order identifier
   * @param showModal Whether the details modal should be opened
   */
  function loadOrderDetails(orderId: number, showModal: boolean = false): void {
    $("#orderDetailsModalLabel").text(`Order #${orderId}`);
    $("#modal-order-details")
      .empty()
      .append(cloneAdminOrderTemplate("order-details-loading-template"));

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

      success: function (response: AdminOrderDetailsResponse) {
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

  /**
   * Renders order details inside the modal.
   *
   * @param order Order detail data
   * @param items Order item data
   */
  function renderOrderDetails(order: OrderDetails, items: OrderItem[]): void {
    const details = cloneAdminOrderTemplate("order-details-template");

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
      itemContainer.append(
        cloneAdminOrderTemplate("order-detail-empty-row-template"),
      );
    } else {
      items.forEach(function (item: OrderItem) {
        itemContainer.append(createOrderItemRow(order.id, item));
      });
    }

    $("#modal-order-details").empty().append(details);
  }

  /**
   * Creates a table row for one order item.
   *
   * @param orderId Order identifier
   * @param item Order item data
   * @returns Table row element
   */
  function createOrderItemRow(
    orderId: number,
    item: OrderItem,
  ): JQuery<HTMLElement> {
    const row = cloneAdminOrderTemplate("order-detail-item-row-template");
    const itemTotal = Number(item.unit_price) * Number(item.quantity);

    row.find(".order-item-name").text(item.name);
    row.find(".order-item-quantity").text(item.quantity);
    row.find(".order-item-unit-price").text(formatCurrency(item.unit_price));
    row.find(".order-item-total").text(formatCurrency(itemTotal));

    row.find(".remove-order-item-btn").data("order-id", orderId);
    row.find(".remove-order-item-btn").data("order-item-id", item.id);

    return row;
  }

  /**
   * Removes one item from an order and reloads the overview and detail view.
   *
   * @param orderId Order identifier
   * @param orderItemId Order item identifier
   */
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

      success: function (response: AdminRemoveOrderItemResponse) {
        if (response.error) {
          showMessage(response.error, "danger");
          return;
        }

        showMessage(
          response.message ?? "Order item removed successfully.",
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

  /**
   * Shows an error message inside the order details modal.
   *
   * @param message Error message to display
   */
  function showOrderDetailsError(message: string): void {
    const errorTemplate = cloneAdminOrderTemplate("order-details-error-template");

    errorTemplate.find(".order-details-error-message").text(message);

    $("#modal-order-details").empty().append(errorTemplate);
  }

  /**
   * Clones a template element by ID.
   *
   * @param templateId Template element ID
   * @returns Cloned template content
   */
  function cloneAdminOrderTemplate(templateId: string): JQuery<HTMLElement> {
    const template = document.getElementById(
      templateId,
    ) as HTMLTemplateElement | null;

    if (!template || !template.content.firstElementChild) {
      return $();
    }

    return $(template.content.firstElementChild.cloneNode(true) as HTMLElement);
  }

  /**
   * Formats a numeric value as Euro currency.
   *
   * @param value Numeric value
   * @returns Formatted currency string
   */
  function formatCurrency(value: number | string | null): string {
    return `€ ${Number(value ?? 0).toFixed(2)}`;
  }

  /**
   * Formats a backend date string for display.
   *
   * @param dateString Backend date string
   * @returns Formatted date and time
   */
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

  /**
   * Displays a page-level admin order message.
   *
   * @param message Message text
   * @param type Bootstrap alert type
   */
  function showMessage(message: string, type: "success" | "danger"): void {
    $("#order-message")
      .removeClass("alert-success alert-danger")
      .addClass(`alert-${type}`)
      .text(message)
      .show();
  }

  /**
   * Checks whether a response contains a backend error.
   *
   * @param response Unknown response payload
   * @returns True if the response is an admin order error response
   */
  function isAdminOrderErrorResponse(
    response: unknown,
  ): response is AdminOrderErrorResponse {
    return (
      typeof response === "object" &&
      response !== null &&
      "error" in response &&
      typeof (response as AdminOrderErrorResponse).error === "string"
    );
  }

  /**
   * Extracts and displays a backend error message from an AJAX error response.
   *
   * @param xhr jQuery AJAX error response
   */
  function showBackendError(xhr: JQuery.jqXHR): void {
    let errorMessage = "An unexpected error occurred.";

    if (xhr.responseText) {
      try {
        const response = JSON.parse(xhr.responseText) as BackendErrorResponse;
        errorMessage = response.error ?? errorMessage;
      } catch {
        errorMessage = xhr.responseText;
      }
    }

    showMessage(errorMessage, "danger");
  }
});