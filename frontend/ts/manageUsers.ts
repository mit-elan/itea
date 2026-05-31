declare const bootstrap: any;

$(document).ready(function () {
  checkLoginStatus().then(function (response: User) {
    if (response.role !== "admin") {
      window.location.href = "/itea/frontend/index.php";
      return;
    }

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

  function loadUsers(): void {
    $("#user-table-body").empty();

    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=admin&method=getUsers",
      type: "GET",
      dataType: "json",
      success: function (users: User[]) {
        users.forEach(function (user: User) {
          const statusClass = user.active ? "bg-success" : "bg-danger";
          const statusText = user.active ? "Active" : "Inactive";

          const buttonClass = user.active
            ? "btn-outline-danger"
            : "btn-outline-success";

          const buttonText = user.active ? "Deactivate" : "Activate";

          const disabled = user.role === "admin" ? "disabled" : "";

          const row = `
            <tr>
              <td class="ps-4">${user.id}</td>
              <td>${user.firstname} ${user.lastname}</td>
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>
                <span class="badge rounded-0 py-2 px-3 bg-secondary">
                  ${user.role}
                </span>
              </td>
              <td>
                <span class="badge rounded-0 py-2 px-3 ${statusClass}">
                  ${statusText}
                </span>
              </td>
              <td class="text-end pe-4">
                <button
                  class="btn btn-outline-dark btn-sm rounded-0 view-orders-btn me-2"
                  data-user-id="${user.id}"
                  data-user-name="${user.firstname} ${user.lastname}"
                >
                  View Orders
                </button>

                <button
                  class="btn btn-sm rounded-0 ${buttonClass} toggle-user-status-btn"
                  data-user-id="${user.id}"
                  data-active="${user.active}"
                  ${disabled}
                >
                  ${buttonText}
                </button>
              </td>
            </tr>
          `;

          $("#user-table-body").append(row);
        });
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
      },
    });
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
          "success",
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
    $("#modal-user-orders").html("<p class='mb-0'>Loading orders...</p>");
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
          $("#modal-user-orders").html(
            `<p class="text-danger">${(orders as any).error}</p>`,
          );
          return;
        }

        if (orders.length === 0) {
          $("#modal-user-orders").html(
            `<p class="mb-0">No orders found for ${userName}.</p>`,
          );
          return;
        }

        let html = `
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="bg-light">
        <tr>
          <th class="ps-3">Order</th>
          <th>Date</th>
          <th>Invoice</th>
          <th>Total</th>
          <th class="text-end pe-3">Action</th>
        </tr>
      </thead>
      <tbody>
`;

        orders.forEach(function (order: OrderSummary) {
          html += `
  <tr>
    <td class="ps-3">#${order.id}</td>
    <td>${formatDate(order.date)}</td>
    <td>${order.invoice_number}</td>
    <td>€ ${Number(order.total_price).toFixed(2)}</td>
    <td class="text-end pe-3">
      <button
        class="btn btn-outline-dark btn-sm rounded-0 view-order-details-btn"
        data-order-id="${order.id}"
      >
        Details
      </button>
    </td>
  </tr>
`;
        });

        html += `
              </tbody>
            </table>
          </div>
        `;

        $("#modal-user-orders").html(html);
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
        $("#modal-user-orders").html(
          `<p class="text-danger">Orders could not be loaded.</p>`,
        );
      },
    });
  }

  function loadOrderDetails(orderId: number): void {
    $("#modal-order-details-wrapper").show();
    $("#modal-order-details").html(
      "<p class='mb-0'>Loading order details...</p>",
    );

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
          $("#modal-order-details").html(
            `<p class="text-danger">${response.error}</p>`,
          );
          return;
        }

        const order = response.order;
        const items = response.items;

        let itemsHtml = "";

        items.forEach(function (item: OrderItem) {
          const itemTotal = Number(item.unit_price) * Number(item.quantity);

          itemsHtml += `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>€ ${Number(item.unit_price).toFixed(2)}</td>
              <td>€ ${itemTotal.toFixed(2)}</td>
            </tr>
          `;
        });

        const html = `
          <div class="mt-4">
            <h3 class="h5 mb-3">Order #${order.id}</h3>

            <div class="row mb-3">
              <div class="col-md-6">
                <p class="mb-1">
                  <strong>Customer:</strong>
                  ${order.first_name} ${order.last_name} (${order.username})
                </p>
                <p class="mb-1">
                  <strong>Email:</strong>
                  ${order.email}
                </p>
                <p class="mb-0">
                  <strong>Address:</strong>
                  ${order.address}, ${order.zip} ${order.city}
                </p>
              </div>

              <div class="col-md-6">
                <p class="mb-1">
                  <strong>Invoice:</strong>
                  ${order.invoice_number}
                </p>
                <p class="mb-1">
                  <strong>Date:</strong>
                  ${order.date}
                </p>
                <p class="mb-0">
                  <strong>Total:</strong>
                  € ${Number(order.total_price).toFixed(2)}
                </p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
          </div>
        `;

        $("#modal-order-details").html(html);
      },
      error: function (xhr: JQuery.jqXHR) {
        showBackendError(xhr);
        $("#modal-order-details").html(
          `<p class="text-danger">Order details could not be loaded.</p>`,
        );
      },
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
});
