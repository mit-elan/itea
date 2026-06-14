/**
 * Payment methods page
 * Loads saved payment methods, creates new payment methods,
 * and allows customers to delete existing payment methods.
 */

interface PaymentMethodRequest {
  paymentType: string;
  cardNumber: string;
  paymentName: string;
}

interface PaymentBackendErrorResponse {
  error?: string;
}

interface PaymentActionResponse {
  success: boolean;
  error?: string;
}


$(document).ready(function () {
  loadPaymentMethods();

  // Delete selected payment method
  $(document).on("click", ".delete-payment", function () {
    const paymentId = Number($(this).data("id"));

    deletePaymentMethod(paymentId);
  });

  // Create a new payment method from the form
  $("#payment-form").on("submit", function (event) {
    event.preventDefault();

    createPaymentMethod();
  });
});

function loadPaymentMethods(): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=payment&method=getPaymentMethods",
    type: "GET",
    dataType: "json",

    success: function (
      response: PaymentMethodsResponse | PaymentActionResponse,
    ) {
      $("#payment-error").addClass("d-none").text("");
      $("#payment-list").empty();

      if (isPaymentActionErrorResponse(response)) {
        showPaymentError(response.error ?? "Failed to load payment methods.");
        return;
      }

      if (!response.paymentMethods || response.paymentMethods.length === 0) {
        $("#payment-list").append(
          clonePaymentTemplate("payment-empty-template"),
        );
        return;
      }

      response.paymentMethods.forEach(function (payment: SavedPaymentMethod) {
        $("#payment-list").append(createPaymentMethodCard(payment));
      });
    },

    error: function (xhr: JQuery.jqXHR) {
      showPaymentError(getPaymentBackendError(xhr));
    },
  });
}

function createPaymentMethodCard(
  payment: SavedPaymentMethod,
): JQuery<HTMLElement> {
  const card = clonePaymentTemplate("payment-method-card-template");

  const isBankAccount = String(payment.is_bank_account) === "1";
  const type = isBankAccount ? "Bank Account" : "Credit Card";
  const iconClass = isBankAccount ? "bi-bank" : "bi-credit-card";

  const maskedNumber =
    payment.card_number.length > 4
      ? "•••• " + payment.card_number.slice(-4)
      : payment.card_number;

  card.find(".payment-label").text(payment.label);
  card.find(".payment-type").text(type);
  card.find(".payment-number").text(maskedNumber);

  card
    .find(".payment-icon")
    .removeClass("bi-bank bi-credit-card")
    .addClass(iconClass);

  card.find(".delete-payment").data("id", payment.id);

  return card;
}

function createPaymentMethod(): void {
  $("#payment-error").addClass("d-none").text("");

  const paymentType = String($("#payment-type").val() ?? "");
  const paymentNumber = String($("#payment-number").val() ?? "").replace(
    /[\s-]/g,
    "",
  );
  const paymentLabel = String($("#payment-label").val() ?? "").trim();

  if (!paymentLabel || !paymentNumber) {
    showPaymentError("Please fill in all fields.");
    return;
  }

  // Validate card number or IBAN based on selected payment type
  if (paymentType === "0" && !luhnCheck(paymentNumber)) {
    showPaymentError("Invalid card number.");
    return;
  }

  if (paymentType === "1" && !ibanCheck(paymentNumber)) {
    showPaymentError("Invalid IBAN.");
    return;
  }

  const paymentRequest: PaymentMethodRequest = {
    paymentType: paymentType,
    cardNumber: paymentNumber,
    paymentName: paymentLabel,
  };

  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=payment&method=createPaymentMethod",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(paymentRequest),
    dataType: "json",

    success: function (response: PaymentActionResponse) {
      if (!response.success) {
        showPaymentError(response.error ?? "Failed to create payment method.");
        return;
      }

      ($("#payment-form")[0] as HTMLFormElement).reset();
      loadPaymentMethods();
    },

    error: function (xhr: JQuery.jqXHR) {
      showPaymentError(getPaymentBackendError(xhr));
    },
  });
}

function deletePaymentMethod(paymentId: number): void {
  if (!confirm("Do you really want to delete this payment method?")) {
    return;
  }

  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=payment&method=deletePaymentMethod",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ paymentId: paymentId }),

    success: function (response: PaymentActionResponse) {
      if (!response.success) {
        showPaymentError(response.error ?? "Failed to delete payment method.");
        return;
      }

      loadPaymentMethods();
    },

    error: function (xhr: JQuery.jqXHR) {
      showPaymentError(getPaymentBackendError(xhr));
    },
  });
}

function isPaymentActionErrorResponse(
  response: PaymentMethodsResponse | PaymentActionResponse,
): response is PaymentActionResponse {
  return (
    "success" in response &&
    response.success === false &&
    typeof response.error === "string"
  );
}

function clonePaymentTemplate(templateId: string): JQuery<HTMLElement> {
  const template = document.getElementById(
    templateId,
  ) as HTMLTemplateElement | null;

  const templateElement = template?.content.firstElementChild;

  if (!templateElement) {
    return $();
  }

  return $(templateElement.cloneNode(true) as HTMLElement);
}

function showPaymentError(message: string): void {
  $("#payment-error").removeClass("d-none").text(message);
}

function getPaymentBackendError(xhr: JQuery.jqXHR): string {
  const fallbackMessage = "Failed to process payment method request.";

  if (!xhr.responseText) {
    return fallbackMessage;
  }

  try {
    const response = JSON.parse(xhr.responseText) as PaymentBackendErrorResponse;

    return response.error ?? fallbackMessage;
  } catch {
    return xhr.responseText;
  }
}