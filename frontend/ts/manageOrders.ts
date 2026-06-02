
$(document).ready(function () {
  checkLoginStatus().then(function (response: User) {
    if (response.role !== "admin") {
      window.location.href = "/itea/frontend/index.php";
      return;
    }

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
          $("#modal-order-details").html(
            `<p class="text-danger">${response.error}</p>`
          );
          return;
        }

        const order = response.order;
        const items = response.items;

        let itemsHtml = "";

        if (items.length === 0) {
          itemsHtml = `
            <tr>
              <td colspan="5" class="text-muted">
                No visible products left in this order.
              </td>
            </tr>
          `;
        }

        items.forEach(function (item: OrderItem) {
          const itemTotal = Number(item.unit_price) * Number(item.quantity);

          itemsHtml += `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>€ ${Number(item.unit_price).toFixed(2)}</td>
              <td>€ ${itemTotal.toFixed(2)}</td>
              <td class="text-end">
                <button
                  class="btn btn-outline-danger btn-sm rounded-0 remove-order-item-btn"
                  data-order-id="${order.id}"
                  data-order-item-id="${item.id}"
                >
                  Remove product
                </button>
              </td>
            </tr>
          `;
        });

        const html = `
          <div class="mb-4">
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
                  ${formatDate(order.date)}
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
                    <th class="text-end">Action</th>
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
          `<p class="text-danger">Order details could not be loaded.</p>`
        );
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
});