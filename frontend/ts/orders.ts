/**
 * Customer orders page
 * Loads the current customer's order history
 * and links each order to its detail page.
 */

$(document).ready(function () {
  loadOrders();
});

function loadOrders(): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=orders&method=getOrders",
    type: "GET",
    dataType: "json",

    success: function (response: OrderSummary[]) {
      clearOrdersView();

      if (response.length === 0) {
        $("#orders-empty").removeClass("d-none");
        return;
      }

      $("#orders-content").removeClass("d-none");

      response.forEach(function (order: OrderSummary) {
        $("#orders-list").append(createOrderCard(order));
      });
    },

    error: function (xhr: JQuery.jqXHR) {
      console.error("Error loading orders:", getOrdersBackendError(xhr));

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

function clearOrdersView(): void {
  $("#orders-error").addClass("d-none").text("");
  $("#orders-empty").addClass("d-none");
  $("#orders-content").addClass("d-none");
  $("#orders-list").empty();
}

function cloneOrdersTemplate(templateId: string): JQuery<HTMLElement> {
  const template = document.getElementById(
    templateId,
  ) as HTMLTemplateElement | null;

  const templateElement = template?.content.firstElementChild;

  if (!templateElement) {
    return $();
  }

  return $(templateElement.cloneNode(true) as HTMLElement);
}

function formatOrdersCurrency(value: number | string | null): string {
  return `€ ${Number(value ?? 0).toFixed(2)}`;
}

function getOrdersBackendError(xhr: JQuery.jqXHR): string {
  const fallbackMessage = "Failed to load orders.";

  if (!xhr.responseText) {
    return fallbackMessage;
  }

  try {
    const response = JSON.parse(xhr.responseText) as ApiErrorResponse;

    return response.error ?? fallbackMessage;
  } catch {
    return xhr.responseText;
  }
}