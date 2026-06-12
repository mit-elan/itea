$(document).ready(function () {
  loadPaymentMethods();
  $(document).on("click", ".delete-payment", function () {
    const paymentId = Number($(this).data("id"));
    deletePaymentMethod(paymentId);
  });

  $("#payment-form").on("submit", function (e) {
    e.preventDefault();
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
        $("#payment-error").removeClass("d-none").text(response.error);
        return;
      }

      if (!response.paymentMethods || response.paymentMethods.length === 0) {
        $("#payment-list").append(`
          <div class="col-12">
            <div class="alert alert-info mb-0">
              No payment methods saved yet.
            </div>
          </div>
        `);

        return;
      }

      response.paymentMethods.forEach((payment: any) => {
        const type =
          payment.is_bank_account == 1 ? "Bank Account" : "Credit Card";

        const maskedNumber =
          payment.card_number.length > 4
            ? "•••• " + payment.card_number.slice(-4)
            : payment.card_number;

        const icon =
          payment.is_bank_account == 1 ? "bi-bank" : "bi-credit-card";

        $("#payment-list").append(`
          <div class="col-md-6">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 class="mb-1">
                      ${payment.label}
                    </h5>
                    <p class="text-muted mb-0">
                      ${type}
                    </p>
                  </div>
                  <i class="bi ${icon} fs-4"></i>
                </div>
                <div class="fw-semibold">
                  ${maskedNumber}
                </div>
                <button
                  class="btn btn-outline-danger btn-sm mt-3 delete-payment"
                  data-id="${payment.id}">
                  Remove
                </button>
              </div>
            </div>
          </div>
        `);
      });
    },

    error: function () {
      $("#payment-error")
        .removeClass("d-none")
        .text("Failed to load payment methods.");
    },
  });
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
    $("#payment-error")
      .removeClass("d-none")
      .text("Please fill in all fields.");

    return;
  }

  if (paymentData.paymentType === "0" && !luhnCheck(paymentNumber)) {
    $("#payment-error").removeClass("d-none").text("Invalid card number.");

    return;
  }

  if (paymentData.paymentType === "1" && !ibanCheck(paymentNumber)) {
    $("#payment-error").removeClass("d-none").text("Invalid IBAN.");

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
        $("#payment-error").removeClass("d-none").text(response.error);

        return;
      }

      ($("#payment-form")[0] as HTMLFormElement).reset();
      loadPaymentMethods();
    },

    error: function () {
      $("#payment-error")
        .removeClass("d-none")
        .text("Failed to create payment method.");
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
        $("#payment-error").removeClass("d-none").text(response.error);

        return;
      }

      loadPaymentMethods();
    },

    error: function () {
      $("#payment-error")
        .removeClass("d-none")
        .text("Failed to delete payment method.");
    },
  });
}
