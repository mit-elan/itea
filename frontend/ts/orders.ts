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
        window.location.href = "/itea/frontend/sites/login.html";
        return;
      }

      if (response.length === 0) {
        $("#orders-empty").removeClass("d-none");
        return;
      }

      $("#orders-content").removeClass("d-none");

      response.forEach(function (order: any) {
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

function createOrderCard(order: any): JQuery<HTMLElement> {
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
