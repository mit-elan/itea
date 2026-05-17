$(document).ready(function () {
  loadOrders();
});

function loadOrders(): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=orders&method=getOrders",
    type: "GET",
    dataType: "json",

    success: function (response) {
      $("#orders-error").addClass("d-none").text("");

      $("#orders-empty").addClass("d-none");

      $("#orders-content").addClass("d-none");

      $("#orders-list").empty();

      if (response.error) {
        window.location.href = "/itea/frontend/sites/login.php";

        return;
      }

      if (response.length === 0) {
        $("#orders-empty").removeClass("d-none");

        return;
      }

      $("#orders-content").removeClass("d-none");

      response.forEach((order: any) => {
        $("#orders-list").append(`

          <div class="card shadow-sm mb-4">

            <div class="card-body">

              <div class="d-flex justify-content-between align-items-start mb-3">

                <div>

                  <h5 class="mb-1">
                    Order #${order.id}
                  </h5>

                  <p class="text-muted mb-0">
                    Placed on ${order.date}
                  </p>

                </div>

                <span class="badge text-bg-success">
                  Ordered
                </span>

              </div>

              <div class="mb-3">

                <strong>Total:</strong>
                € ${Number(order.total_price).toFixed(2)}

              </div>

              <div class="mb-4">

                <strong>Invoice:</strong>
                ${order.invoice_number}

              </div>

              <div class="d-flex gap-2">

                <a href="/itea/frontend/sites/order-details.php?id=${order.id}"
   class="btn btn-dark btn-sm">

  View Order

</a>

                <button class="btn btn-outline-secondary btn-sm"
                        disabled>

                  Track Parcel

                </button>

              </div>

            </div>

          </div>

        `);
      });
    },

    error: function (xhr) {
      console.log(xhr.responseText);

      $("#orders-error").removeClass("d-none").text("Failed to load orders.");
    },
  });
}
