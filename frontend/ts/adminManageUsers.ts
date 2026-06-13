$(document).ready(function () {
  // Admin access only - initialize page if authorized
  requireRole("admin", function () {
    loadUsers();
  });

  $("#user-table-body").on("click", ".toggle-user-status-btn", function () {
    const userId = Number($(this).data("user-id"));
    const currentActive = String($(this).data("active")) === "true";

    setUserActive(userId, !currentActive);
  });

  $("#user-table-body").on("click", ".view-orders-btn", function () {
    const userId = Number($(this).data("user-id"));
    const userName = String($(this).data("user-name"));

    loadUserOrders(userId, userName);
  });

  $(document).on("click", ".view-order-details-btn", function () {
    const orderId = Number($(this).data("order-id"));

    loadOrderDetails(orderId);
  });

  $(document).on("click", ".remove-order-item-btn", function () {
    const orderId = Number($(this).data("order-id"));
    const orderItemId = Number($(this).data("order-item-id"));

    removeOrderItem(orderId, orderItemId);
  });

  function loadUsers(): void {
    $("#user-table-body").empty();

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=admin&method=getUsers",
      type: "GET",
      dataType: "json",
      success: function (users: User[]) {
        users.forEach(function (user: User) {
          $("#user-table-body").append(createUserRow(user));
        });
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

  function createUserRow(user: User): JQuery<HTMLElement> {
    const row = cloneTemplate("user-row-template");

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

    if (user.role === "admin") {
      row.find(".toggle-user-status-btn").prop("disabled", true);
    }

    return row;
  }

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
      success: function (response: { message?: string }) {
        showMessage(
          response.message || "User status updated successfully.",
          "success"
        );

        loadUsers();
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

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
      success: function (orders: OrderSummary[]) {
        if ((orders as any).error) {
          showMessage((orders as any).error, "danger");
          showModalError("#modal-user-orders", (orders as any).error);
          return;
        }

        if (orders.length === 0) {
          showUserOrdersEmpty(userName);
          return;
        }

        renderUserOrders(orders);
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
        showModalError("#modal-user-orders", "Orders could not be loaded.");
      },
    });
  }

  function renderUserOrders(orders: OrderSummary[]): void {
    const table = cloneTemplate("user-orders-table-template");
    const tableBody = table.find(".user-orders-table-body");

    orders.forEach(function (order: OrderSummary) {
      tableBody.append(createUserOrderRow(order));
    });

    $("#modal-user-orders").empty().append(table);
  }

  function createUserOrderRow(order: OrderSummary): JQuery<HTMLElement> {
    const row = cloneTemplate("user-order-row-template");

    row.find(".user-order-id").text(`#${order.id}`);
    row.find(".user-order-date").text(formatDate(order.date));
    row.find(".user-order-invoice").text(order.invoice_number);
    row.find(".user-order-total").text(formatCurrency(order.total_price));
    row.find(".view-order-details-btn").data("order-id", order.id);

    return row;
  }

  function showUserOrdersEmpty(userName: string): void {
    const emptyMessage = cloneTemplate("user-orders-empty-template");

    emptyMessage.find(".user-orders-empty-name").text(userName);

    $("#modal-user-orders").empty().append(emptyMessage);
  }

  function loadOrderDetails(orderId: number): void {
    $("#modal-order-details-wrapper").show();
    showModalLoading("#modal-order-details", "Loading order details...");

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
          showModalError("#modal-order-details", response.error);
          return;
        }

        renderOrderDetails(response.order, response.items);
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
        showModalError("#modal-order-details", "Order details could not be loaded.");
      },
    });
  }

  function renderOrderDetails(order: OrderDetails, items: OrderItem[]): void {
    const details = cloneTemplate("user-order-details-template");

    details.find(".user-order-detail-title").text(`Order #${order.id}`);
    details
      .find(".user-order-detail-customer")
      .text(`${order.first_name} ${order.last_name} (${order.username})`);
    details.find(".user-order-detail-email").text(order.email);
    details
      .find(".user-order-detail-address")
      .text(`${order.address}, ${order.zip} ${order.city}`);
    details.find(".user-order-detail-invoice").text(order.invoice_number);
    details.find(".user-order-detail-date").text(formatDate(order.date));
    details.find(".user-order-detail-total").text(formatCurrency(order.total_price));

    const itemContainer = details.find(".user-order-detail-items-body");

    if (items.length === 0) {
      itemContainer.append(cloneTemplate("user-order-detail-empty-row-template"));
    } else {
      items.forEach(function (item: OrderItem) {
        itemContainer.append(createOrderItemRow(order.id, item));
      });
    }

    $("#modal-order-details").empty().append(details);
  }

  function createOrderItemRow(
    orderId: number,
    item: OrderItem
  ): JQuery<HTMLElement> {
    const row = cloneTemplate("user-order-detail-item-row-template");
    const itemTotal = Number(item.unit_price) * Number(item.quantity);

    row.find(".user-order-item-name").text(item.name);
    row.find(".user-order-item-quantity").text(item.quantity);
    row.find(".user-order-item-unit-price").text(formatCurrency(item.unit_price));
    row.find(".user-order-item-total").text(formatCurrency(itemTotal));

    row
      .find(".remove-order-item-btn")
      .data("order-id", orderId)
      .data("order-item-id", item.id);

    return row;
  }

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
      success: function (response: { message?: string }) {
        showMessage(
          response.message || "Order item removed successfully.",
          "success"
        );

        loadOrderDetails(orderId);
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
  }

  function showModalLoading(containerSelector: string, message: string): void {
    const loadingMessage = cloneTemplate("modal-loading-template");

    loadingMessage.find(".modal-loading-message").text(message);

    $(containerSelector).empty().append(loadingMessage);
  }

  function showModalError(containerSelector: string, message: string): void {
    const errorMessage = cloneTemplate("modal-error-template");

    errorMessage.find(".modal-error-message").text(message);

    $(containerSelector).empty().append(errorMessage);
  }

  function cloneTemplate(templateId: string): JQuery<HTMLElement> {
    const template = document.getElementById(templateId) as HTMLTemplateElement | null;

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