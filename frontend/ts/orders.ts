$(document).ready(function () {
  loadOrders();
});

function loadOrders(): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=orders&method=getOrders",
    type: "GET",
    dataType: "json",

    success: function (response: OrderSummary[] | OrdersErrorResponse) {
      $("#orders-error").addClass("d-none").text("");
      $("#orders-empty").addClass("d-none");
      $("#orders-content").addClass("d-none");
      $("#orders-list").empty();

      if (isOrdersErrorResponse(response)) {
        window.location.href = "/itea/frontend/sites/login.html";
        return;
      }

      if (response.length === 0) {
        $("#orders-empty").removeClass("d-none");
        return;
      }

      $("#orders-content").removeClass("d-none");

      response.forEach(function (order: OrderSummary) {
        $("#orders-list").append(createOrderCard(order));
      });
    },

    error: function (xhr) {
      console.log(xhr.responseText);

      $("#orders-error")
        .removeClass("d-none")
        .text("Failed to load orders.");
    },
  });
}

function createOrderCard(order: OrderSummary): JQuery<HTMLElement> {
  const card = cloneOrdersTemplate("order-card-template");

  card.find(".order-id").text(order.id);
  card.find(".order-date").text(order.date);
  card.find(".order-total").text(formatOrdersCurrency(order.total_price));
  card.find(".order-invoice").text(order.invoice_number);

  card
    .find(".view-order-link")
    .attr("href", `/itea/frontend/sites/orderDetails.html?id=${order.id}`);

  return card;
}

function isOrdersErrorResponse(
  response: unknown,
): response is OrdersErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as OrdersErrorResponse).error === "string"
  );
}

function cloneOrdersTemplate(templateId: string): JQuery<HTMLElement> {
  const template = document.getElementById(templateId) as HTMLTemplateElement | null;

  if (!template || !template.content.firstElementChild) {
    return $();
  }

  return $(template.content.firstElementChild.cloneNode(true) as HTMLElement);
}

function formatOrdersCurrency(value: number | string | null): string {
  return `€ ${Number(value ?? 0).toFixed(2)}`;
}