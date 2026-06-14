/**
 * Admin user management page
 * Loads all users, manages active/inactive status,
 * and displays order history with order details.
 */

interface AdminUserActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

interface AdminUserOrderDetailsResponse {
  order: OrderDetails;
  items: OrderItem[];
  error?: string;
}

interface AdminUserBackendErrorResponse {
  error?: string;
}

interface AdminUserOrdersErrorResponse {
  success?: false;
  error: string;
}

$(document).ready(function () {
  // Admin access only
  requireRole("admin", function () {
    loadUsers();
  });

  // Toggle customer active/inactive status
  $("#user-table-body").on("click", ".toggle-user-status-btn", function () {
    const userId = Number($(this).data("user-id"));
    const currentActive = String($(this).data("active")) === "true";

    setUserActive(userId, !currentActive);
  });

  // Open order history for selected user
  $("#user-table-body").on("click", ".view-orders-btn", function () {
    const userId = Number($(this).data("user-id"));
    const userName = String($(this).data("user-name"));

    loadUserOrders(userId, userName);
  });

  // Load details for selected order inside the modal
  $(document).on("click", ".view-order-details-btn", function () {
    const orderId = Number($(this).data("order-id"));

    loadOrderDetails(orderId);
  });

  // Remove selected item from an order
  $(document).on("click", ".remove-order-item-btn", function () {
    const orderId = Number($(this).data("order-id"));
    const orderItemId = Number($(this).data("order-item-id"));

    removeOrderItem(orderId, orderItemId);
  });

  /**
   * Loads all users for the admin table.
   */
  function loadUsers(): void {
    $("#user-table-body").empty();

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=admin&method=getUsers",
      type: "GET",
      dataType: "json",

      success: function (response: User[] | AdminUserOrdersErrorResponse) {
        if (isAdminUserOrdersErrorResponse(response)) {
          showMessage(response.error, "danger");
          return;
        }

        response.forEach(function (user: User) {
          $("#user-table-body").append(createUserRow(user));
        });
      },

      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

  /**
   * Creates one user row from the user template.
   */
  function createUserRow(user: User): JQuery<HTMLElement> {
    const row = cloneAdminUserTemplate("user-row-template");

    const statusClass = user.active ? "bg-success" : "bg-danger";
    const statusText = user.active ? "Active" : "Inactive";
    const buttonClass = user.active
      ? "btn-outline-danger"
      : "btn-outline-success";
    const buttonText = user.active ? "Deactivate" : "Activate";
    const fullName = `${user.firstname} ${user.lastname}`;

    row.find(".user-id").text(user.id);
    row.find(".user-name").text(fullName);
    row.find(".user-username").text(user.username);
    row.find(".user-email").text(user.email);
    row.find(".user-role").text(user.role);

    row
      .find(".user-status")
      .removeClass("bg-success bg-danger")
      .addClass(statusClass)
      .text(statusText);

    row
      .find(".view-orders-btn")
      .data("user-id", user.id)
      .data("user-name", fullName);

    row
      .find(".toggle-user-status-btn")
      .removeClass("btn-outline-danger btn-outline-success")
      .addClass(buttonClass)
      .data("user-id", user.id)
      .data("active", user.active)
      .text(buttonText);

    // Admin users cannot be deactivated from this view
    if (user.role === "admin") {
      row.find(".toggle-user-status-btn").prop("disabled", true);
    }

    return row;
  }

  /**
   * Updates the active status of a user.
   */
  function setUserActive(userId: number, active: boolean): void {
    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=admin&method=setUserActive",
      type: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        id: userId,
        active: active,
      }),

      success: function (response: AdminUserActionResponse) {
        if (response.error) {
          showMessage(response.error, "danger");
          return;
        }

        showMessage(
          response.message ?? "User status updated successfully.",
          "success",
        );

        loadUsers();
      },

      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

  /**
   * Loads all orders for a selected user and opens the order modal.
   */
  function loadUserOrders(userId: number, userName: string): void {
    $("#userOrdersModalLabel").text(`Orders from ${userName}`);
    showModalLoading("#modal-user-orders", "Loading orders...");
    $("#modal-order-details").empty();
    $("#modal-order-details-wrapper").hide();

    const modalElement = document.getElementById("userOrdersModal");

    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }

    $.ajax({
      url:
        "/itea/backend/serviceHandler.php?handler=admin&method=getUserOrders&userId=" +
        userId,
      type: "GET",
      dataType: "json",

      success: function (
        response: OrderSummary[] | AdminUserOrdersErrorResponse,
      ) {
        if (isAdminUserOrdersErrorResponse(response)) {
          showMessage(response.error, "danger");
          showModalError("#modal-user-orders", response.error);
          return;
        }

        if (response.length === 0) {
          showUserOrdersEmpty(userName);
          return;
        }

        renderUserOrders(response);
      },

      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
        showModalError("#modal-user-orders", "Orders could not be loaded.");
      },
    });
  }

  /**
   * Renders the selected user's orders inside the modal.
   */
  function renderUserOrders(orders: OrderSummary[]): void {
    const table = cloneAdminUserTemplate("user-orders-table-template");
    const tableBody = table.find(".user-orders-table-body");

    orders.forEach(function (order: OrderSummary) {
      tableBody.append(createUserOrderRow(order));
    });

    $("#modal-user-orders").empty().append(table);
  }

  function createUserOrderRow(order: OrderSummary): JQuery<HTMLElement> {
    const row = cloneAdminUserTemplate("user-order-row-template");

    row.find(".user-order-id").text(`#${order.id}`);
    row.find(".user-order-date").text(formatAdminUserDate(order.date));
    row.find(".user-order-invoice").text(order.invoice_number);
    row
      .find(".user-order-total")
      .text(formatAdminUserCurrency(order.total_price));
    row.find(".view-order-details-btn").data("order-id", order.id);

    return row;
  }

  function showUserOrdersEmpty(userName: string): void {
    const emptyMessage = cloneAdminUserTemplate("user-orders-empty-template");

    emptyMessage.find(".user-orders-empty-name").text(userName);

    $("#modal-user-orders").empty().append(emptyMessage);
  }

  /**
   * Loads details for one selected order.
   */
  function loadOrderDetails(orderId: number): void {
    $("#modal-order-details-wrapper").show();
    showModalLoading("#modal-order-details", "Loading order details...");

    $.ajax({
      url:
        "/itea/backend/serviceHandler.php?handler=admin&method=getOrderDetails&orderId=" +
        orderId,
      type: "GET",
      dataType: "json",

      success: function (response: AdminUserOrderDetailsResponse) {
        if (response.error) {
          showMessage(response.error, "danger");
          showModalError("#modal-order-details", response.error);
          return;
        }

        renderOrderDetails(response.order, response.items);
      },

      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
        showModalError(
          "#modal-order-details",
          "Order details could not be loaded.",
        );
      },
    });
  }

  /**
   * Renders order details below the selected user's order list.
   */
  function renderOrderDetails(order: OrderDetails, items: OrderItem[]): void {
    const details = cloneAdminUserTemplate("user-order-details-template");

    details.find(".user-order-detail-title").text(`Order #${order.id}`);
    details
      .find(".user-order-detail-customer")
      .text(`${order.first_name} ${order.last_name} (${order.username})`);
    details.find(".user-order-detail-email").text(order.email);
    details
      .find(".user-order-detail-address")
      .text(`${order.address}, ${order.zip} ${order.city}`);
    details.find(".user-order-detail-invoice").text(order.invoice_number);
    details
      .find(".user-order-detail-date")
      .text(formatAdminUserDate(order.date));
    details
      .find(".user-order-detail-total")
      .text(formatAdminUserCurrency(order.total_price));

    const itemContainer = details.find(".user-order-detail-items-body");

    if (items.length === 0) {
      itemContainer.append(
        cloneAdminUserTemplate("user-order-detail-empty-row-template"),
      );
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
    const row = cloneAdminUserTemplate("user-order-detail-item-row-template");
    const itemTotal = Number(item.unit_price) * Number(item.quantity);

    row.find(".user-order-item-name").text(item.name);
    row.find(".user-order-item-quantity").text(item.quantity);
    row
      .find(".user-order-item-unit-price")
      .text(formatAdminUserCurrency(item.unit_price));
    row.find(".user-order-item-total").text(formatAdminUserCurrency(itemTotal));

    row
      .find(".remove-order-item-btn")
      .data("order-id", orderId)
      .data("order-item-id", item.id);

    return row;
  }

  /**
   * Marks one order item as removed and reloads the order details.
   */
  function removeOrderItem(orderId: number, orderItemId: number): void {
    if (!confirm("Remove this product from the order?")) {
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

      success: function (response: AdminUserActionResponse) {
        if (response.error) {
          showMessage(response.error, "danger");
          return;
        }

        showMessage(
          response.message ?? "Order item removed successfully.",
          "success",
        );

        loadOrderDetails(orderId);
      },

      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

  function showModalLoading(containerSelector: string, message: string): void {
    const loadingMessage = cloneAdminUserTemplate("modal-loading-template");

    loadingMessage.find(".modal-loading-message").text(message);

    $(containerSelector).empty().append(loadingMessage);
  }

  function showModalError(containerSelector: string, message: string): void {
    const errorMessage = cloneAdminUserTemplate("modal-error-template");

    errorMessage.find(".modal-error-message").text(message);

    $(containerSelector).empty().append(errorMessage);
  }

  function cloneAdminUserTemplate(templateId: string): JQuery<HTMLElement> {
    const template = document.getElementById(
      templateId,
    ) as HTMLTemplateElement | null;

    if (!template || !template.content.firstElementChild) {
      return $();
    }

    return $(template.content.firstElementChild.cloneNode(true) as HTMLElement);
  }

  function formatAdminUserCurrency(value: number | string | null): string {
    return `€ ${Number(value ?? 0).toFixed(2)}`;
  }

  function formatAdminUserDate(dateString: string): string {
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
    $("#user-message")
      .removeClass("alert-success alert-danger")
      .addClass(`alert-${type}`)
      .text(message)
      .show();
  }

  function isAdminUserOrdersErrorResponse(
    response: unknown,
  ): response is AdminUserOrdersErrorResponse {
    return (
      typeof response === "object" &&
      response !== null &&
      "error" in response &&
      typeof (response as AdminUserOrdersErrorResponse).error === "string"
    );
  }

  function showBackendError(xhr: JQuery.jqXHR): void {
    let errorMessage = "An unexpected error occurred.";

    if (xhr.responseText) {
      try {
        const response = JSON.parse(
          xhr.responseText,
        ) as AdminUserBackendErrorResponse;

        errorMessage = response.error ?? errorMessage;
      } catch {
        errorMessage = xhr.responseText;
      }
    }

    showMessage(errorMessage, "danger");
  }
});