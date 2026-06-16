/**
 * Order details page
 * Loads a single order, renders order items,
 * and generates the invoice PDF for download.
 */

let currentOrder: OrderDetailsResponse | null = null;

$(document).ready(function () {
  loadOrderDetails();
  showOrderSuccessMessage();

  $(document).on("click", "#download-invoice", function () {
    generateInvoicePdf();
  });
});

function showOrderSuccessMessage(): void {
  const params = new URLSearchParams(window.location.search);

  if (params.get("success") === "1") {
    $("#order-success").removeClass("d-none");
  }
}

function loadOrderDetails(): void {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");

  if (!orderId) {
    showOrderDetailsError("No order ID was provided.");
    return;
  }

  $.ajax({
    url:
      "/itea/backend/serviceHandler.php?handler=orders&method=getOrderById&id=" +
      orderId,
    type: "GET",
    dataType: "json",

    success: function (response: OrderDetailsResponse) {
      currentOrder = response;
      renderOrderDetails(response);
    },

    error: function (xhr: JQuery.jqXHR) {
      const errorMessage = getOrderDetailsBackendError(xhr);
      console.error("Error loading order details:", errorMessage);
      showOrderDetailsError(errorMessage);
    },
  });
}

function renderOrderDetails(response: OrderDetailsResponse): void {
  $("#order-content").removeClass("d-none");

  $("#order-id").text(response.order.id);
  $("#order-date").text(response.order.date);
  $("#order-invoice").text(response.order.invoice_number);
  $("#order-total").text(formatOrderDetailsCurrency(response.order.total_price));

  // Show voucher details only if the order used a voucher
  if (response.order.voucher_code) {
    $("#subtotal-heading").removeClass("d-none");
    $("#voucher-heading").removeClass("d-none");

    $("#order-voucher").text(
      `- ${formatOrderDetailsCurrency(response.order.voucher_discount ?? 0)}`,
    );

    $("#order-subtotal").text(
      formatOrderDetailsCurrency(response.order.initial_price ?? 0),
    );
  }

  $("#order-items").empty();

  response.items.forEach(function (item: OrderDetailsItem) {
    $("#order-items").append(createOrderItemCard(item));
  });
}

function createOrderItemCard(item: OrderDetailsItem): JQuery<HTMLElement> {
  const card = cloneOrderDetailsTemplate("order-item-card-template");

  card
    .find(".order-item-image")
    .attr("src", `/itea/backend/productpictures/${item.file_path}`)
    .attr("alt", item.name);

  card.find(".order-item-name").text(item.name);
  card.find(".order-item-quantity").text(item.quantity);
  card.find(".order-item-price").text(formatOrderDetailsCurrency(item.price));

  return card;
}

function generateInvoicePdf(): void {
  if (!currentOrder) {
    return;
  }

  const invoice = createInvoiceElement(currentOrder);

  html2pdf()
    .from(invoice)
    .save(`invoice-${currentOrder.order.invoice_number}.pdf`);
}

function createInvoiceElement(orderResponse: OrderDetailsResponse): HTMLElement {
  const order = orderResponse.order;
  const items = orderResponse.items;
  const invoice = cloneOrderDetailsTemplate("invoice-template");

  invoice
    .find(".invoice-customer-name")
    .text(`${order.first_name} ${order.last_name}`);

  invoice.find(".invoice-customer-address").text(order.address);
  invoice.find(".invoice-customer-city").text(`${order.zip} ${order.city}`);
  invoice.find(".invoice-customer-email").text(order.email);
  invoice.find(".invoice-number").text(order.invoice_number);
  invoice.find(".invoice-date").text(order.date);
  invoice
    .find(".invoice-total")
    .text(formatOrderDetailsCurrency(order.total_price));

  const invoiceItems = invoice.find(".invoice-items");

  items.forEach(function (item: OrderDetailsItem) {
    invoiceItems.append(createInvoiceItemRow(item));
  });

  // Add voucher section to invoice only if a voucher was used
  if (order.voucher_code) {
    invoice
      .find(".invoice-voucher-container")
      .append(createInvoiceVoucher(order));
  }

  return invoice.get(0) as HTMLElement;
}

function createInvoiceItemRow(item: OrderDetailsItem): JQuery<HTMLElement> {
  const row = cloneOrderDetailsTemplate("invoice-item-row-template");
  const itemTotal = Number(item.price) * Number(item.quantity);

  row.find(".invoice-item-name").text(item.name);
  row.find(".invoice-item-quantity").text(item.quantity);
  row
    .find(".invoice-item-unit-price")
    .text(formatOrderDetailsCurrency(item.price));
  row.find(".invoice-item-total").text(formatOrderDetailsCurrency(itemTotal));

  return row;
}

function createInvoiceVoucher(order: OrderDetailsOrder): JQuery<HTMLElement> {
  const voucher = cloneOrderDetailsTemplate("invoice-voucher-template");

  voucher
    .find(".invoice-voucher-subtotal")
    .text(formatOrderDetailsCurrency(order.initial_price ?? 0));

  voucher.find(".invoice-voucher-code").text(order.voucher_code ?? "");

  voucher
    .find(".invoice-voucher-discount")
    .text(`- ${formatOrderDetailsCurrency(order.voucher_discount ?? 0)}`);

  voucher
    .find(".invoice-voucher-remaining")
    .text(formatOrderDetailsCurrency(order.voucher_remaining_value ?? 0));

  return voucher;
}

function cloneOrderDetailsTemplate(templateId: string): JQuery<HTMLElement> {
  const template = document.getElementById(
    templateId,
  ) as HTMLTemplateElement | null;

  const templateElement = template?.content.firstElementChild;

  if (!templateElement) {
    return $();
  }

  return $(templateElement.cloneNode(true) as HTMLElement);
}

function formatOrderDetailsCurrency(value: number | string): string {
  return `€ ${Number(value).toFixed(2)}`;
}

function showOrderDetailsError(message: string): void {
  $("#order-error").removeClass("d-none").text(message);
}

function getOrderDetailsBackendError(xhr: JQuery.jqXHR): string {
  const fallbackMessage = "Failed to load order details.";

  try {
    const response = JSON.parse(xhr.responseText) as { error?: string };
    return response.error ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}