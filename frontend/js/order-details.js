"use strict";
$(document).ready(function () {
    loadOrderDetails();
});
function loadOrderDetails() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("id");
    if (!orderId) {
        return;
    }
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=orders&method=getOrderById&id="
            + orderId,
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.error) {
                $("#order-error")
                    .removeClass("d-none")
                    .text(response.error);
                return;
            }
            $("#order-content")
                .removeClass("d-none");
            $("#order-id")
                .text(response.order.id);
            $("#order-date")
                .text(response.order.date);
            $("#order-invoice")
                .text(response.order.invoice_number);
            $("#order-total")
                .text("€ " +
                Number(response.order.total_price).toFixed(2));
            response.items.forEach((item) => {
                $("#order-items").append(`

          <div class="card mb-3">

            <div class="card-body d-flex align-items-center gap-3">

              <img src="/itea/backend/productpictures/${item.file_path}"
                   alt="${item.name}"
                   style="width: 80px; height: 80px; object-fit: cover;"
                   class="rounded">

              <div>

                <h6 class="mb-1">
                  ${item.name}
                </h6>

                <div class="text-muted">
                  Quantity: ${item.quantity}
                </div>

                <div>
                  € ${Number(item.price).toFixed(2)}
                </div>

              </div>

            </div>

          </div>

        `);
            });
        },
        error: function (xhr) {
            console.log(xhr.responseText);
            $("#order-error")
                .removeClass("d-none")
                .text("Failed to load order details.");
        },
    });
}
