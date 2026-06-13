$(document).ready(function () {
  loadPaymentMethods();

  $(document).on("click", ".delete-payment", function () {
    const paymentId = Number($(this).data("id"));

    deletePaymentMethod(paymentId);
  });

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
    success: function (response) {
      $("#payment-error").addClass("d-none").text("");
      $("#payment-list").empty();

      if (response.error) {
        showPaymentError(response.error);
        return;
      }

      if (!response.paymentMethods || response.paymentMethods.length === 0) {
        $("#payment-list").append(clonePaymentTemplate("payment-empty-template"));
        return;
      }

      response.paymentMethods.forEach(function (payment: any) {
        $("#payment-list").append(createPaymentMethodCard(payment));
      });
    },

    error: function () {
      showPaymentError("Failed to load payment methods.");
    },
  });
}

function createPaymentMethodCard(payment: any): JQuery<HTMLElement> {
  const card = clonePaymentTemplate("payment-method-card-template");

  const type = payment.is_bank_account == 1 ? "Bank Account" : "Credit Card";

  const iconClass =
    payment.is_bank_account == 1 ? "bi-bank" : "bi-credit-card";

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

  const paymentData = {
    paymentType: $("#payment-type").val(),
    cardNumber: $("#payment-number").val(),
    paymentName: $("#payment-label").val(),
  };

  const paymentNumber = String(paymentData.cardNumber).replace(/[\s-]/g, "");
  const paymentLabel = String(paymentData.paymentName).trim();

  if (!paymentLabel || !paymentNumber) {
    showPaymentError("Please fill in all fields.");
    return;
  }

  if (paymentData.paymentType === "0" && !luhnCheck(paymentNumber)) {
    showPaymentError("Invalid card number.");
    return;
  }

  if (paymentData.paymentType === "1" && !ibanCheck(paymentNumber)) {
    showPaymentError("Invalid IBAN.");
    return;
  }

  const paymentRequest = {
    paymentType: String(paymentData.paymentType),
    cardNumber: paymentNumber,
    paymentName: paymentLabel,
  };

  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=payment&method=createPaymentMethod",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(paymentRequest),
    dataType: "json",
    success: function (response) {
      if (!response.success) {
        showPaymentError(response.error);
        return;
      }

      ($("#payment-form")[0] as HTMLFormElement).reset();
      loadPaymentMethods();
    },

    error: function () {
      showPaymentError("Failed to create payment method.");
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
    success: function (response) {
      if (!response.success) {
        showPaymentError(response.error);
        return;
      }

      loadPaymentMethods();
    },

    error: function () {
      showPaymentError("Failed to delete payment method.");
    },
  });
}

function clonePaymentTemplate(templateId: string): JQuery<HTMLElement> {
  const template = document.getElementById(templateId) as HTMLTemplateElement | null;

  if (!template || !template.content.firstElementChild) {
    return $();
  }

  return $(template.content.firstElementChild.cloneNode(true) as HTMLElement);
}

function showPaymentError(message: string): void {
  $("#payment-error").removeClass("d-none").text(message);
}
