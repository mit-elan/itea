let currentOrder: any = null;

declare const html2pdf: any;

$(document).ready(function () {
  loadOrderDetails();
  const params = new URLSearchParams(window.location.search);

  if (params.get("success") === "1") {
    $("#order-success").removeClass("d-none");
  }

  $(document).on("click", "#download-invoice", function () {
    generateInvoicePdf();
  });
});

function loadOrderDetails(): void {
  const params = new URLSearchParams(window.location.search);

  const orderId = params.get("id");

  if (!orderId) {
    return;
  }

  $.ajax({
    url:
      "/itea/backend/serviceHandler.php?handler=orders&method=getOrderById&id=" +
      orderId,

    type: "GET",

    dataType: "json",

    success: function (response) {
      currentOrder = response;

      if (response.error) {
        $("#order-error").removeClass("d-none").text(response.error);

        return;
      }

      $("#order-content").removeClass("d-none");

      $("#order-id").text(response.order.id);

      $("#order-date").text(response.order.date);

      $("#order-invoice").text(response.order.invoice_number);

      $("#order-total").text(
        "€ " + Number(response.order.total_price).toFixed(2),
      );

      response.items.forEach((item: any) => {
        $("#order-items").append(`

          <div class="card mb-3">

            <div class="card-body d-flex align-items-center gap-3">

              <img
                src="/itea/backend/productpictures/${item.file_path}"
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

function generateInvoicePdf(): void {
  if (!currentOrder) {
    return;
  }

  const order = currentOrder.order;

  const items = currentOrder.items;

  let itemsHtml = "";

  items.forEach((item: any) => {
    const itemTotal = Number(item.price) * Number(item.quantity);

    itemsHtml += `

      <tr>

        <td style="padding: 12px; border-bottom: 1px solid #ddd;">
          ${item.name}
        </td>

        <td style="padding: 12px; border-bottom: 1px solid #ddd;">
          ${item.quantity}
        </td>

        <td style="padding: 12px; border-bottom: 1px solid #ddd;">
          € ${Number(item.price).toFixed(2)}
        </td>

        <td style="padding: 12px; border-bottom: 1px solid #ddd;">
          € ${itemTotal.toFixed(2)}
        </td>

      </tr>

    `;
  });

  const invoice = document.createElement("div");

  invoice.innerHTML = `

    <div style="padding: 50px; font-family: Arial, sans-serif; color: #111;">

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:40px;
          margin-bottom:50px;
        ">

        <div>

          <h1 style="margin:0;">
            Invoice
          </h1>

          <h3 style="margin-top:30px; margin-bottom:10px;">
            iTEA Webshop
          </h3>

          <p style="margin:0;">
            Tea Street 12
          </p>

          <p style="margin:0;">
            1010 Vienna
          </p>

          <p style="margin-top:10px;">
            support@itea.com
          </p>

        </div>

        <div style="text-align:right;">

          <h3 style="margin-top:0; margin-bottom:15px;">
            Billing Address
          </h3>

          <p style="margin:0;">
            ${order.first_name} ${order.last_name}
          </p>

          <p style="margin:0;">
            ${order.address}
          </p>

          <p style="margin:0;">
            ${order.zip} ${order.city}
          </p>

          <p style="margin-top:10px;">
            ${order.email}
          </p>

        </div>

      </div>

      <div style="margin-bottom:40px;">

        <p style="margin-bottom:5px;">

          <strong>Invoice Number:</strong>

          ${order.invoice_number}

        </p>

        <p style="margin:0;">

          <strong>Date:</strong>

          ${order.date}

        </p>

      </div>

      <table
        style="
          width:100%;
          border-collapse:collapse;
          margin-top:20px;
        ">

        <thead>

          <tr style="background:#f5f5f5;">

            <th style="padding:12px; text-align:left;">
              Product
            </th>

            <th style="padding:12px; text-align:left;">
              Quantity
            </th>

            <th style="padding:12px; text-align:left;">
              Unit Price
            </th>

            <th style="padding:12px; text-align:left;">
              Total
            </th>

          </tr>

        </thead>

        <tbody>

          ${itemsHtml}

        </tbody>

      </table>

      <div style="margin-top:40px; text-align:right;">

        <h2>

          Total:
          € ${Number(order.total_price).toFixed(2)}

        </h2>

      </div>

    </div>

  `;

  html2pdf().from(invoice).save(`invoice-${order.invoice_number}.pdf`);
}
