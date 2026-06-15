/**
 * Voucher page logic
 * Loads vouchers based on user role, renders the voucher table,
 * and handles voucher creation or voucher assignment to a customer profile.
 */

interface VoucherActionResponse {
  success?: boolean;
  voucherCode?: string;
  error?: string;
}

interface VoucherBackendErrorResponse {
  error?: string;
}

$(function () {
  checkLoginStatus().then(function (response) {
    const userRole = response.role ?? "guest";

    loadAndRenderVouchers(userRole);

    $("#create-voucher-form").on("submit", function (event) {
      event.preventDefault();
      createVoucher(userRole);
    });

    $("#voucher-form").on("submit", function (event) {
      event.preventDefault();
      addVoucherToProfile(userRole);
    });
  });
});

function fetchVouchers(role: string): Promise<Voucher[]> {
  const method = role === "admin" ? "getAll" : "getByUserId";

  return new Promise(function (resolve, reject) {
    $.ajax({
      url: `/itea/backend/serviceHandler.php?handler=vouchers&method=${method}`,
      type: "GET",
      dataType: "json",

      success: function (response: Voucher[] | VoucherBackendErrorResponse) {
        if (isVoucherBackendErrorResponse(response)) {
          reject(response.error);
          return;
        }

        resolve(response);
      },

      error: function (xhr: JQuery.jqXHR) {
        reject(getVoucherBackendError(xhr));
      },
    });
  });
}

function loadAndRenderVouchers(userRole: string): void {
  fetchVouchers(userRole)
    .then(function (vouchers: Voucher[]) {
      renderVoucherTable(vouchers);
    })
    .catch(function (error: string) {
      console.error("Error loading vouchers:", error);
      showVoucherError("Failed to load vouchers.");
    });
}

function renderVoucherTable(vouchers: Voucher[]): void {
  const tableBody = $("#voucher-table-body");
  tableBody.empty();

  if (vouchers.length === 0) {
    $("#voucher-table-card").addClass("d-none");
    $("#voucher-empty").removeClass("d-none");
    return;
  }

  $("#voucher-empty").addClass("d-none");
  $("#voucher-table-card").removeClass("d-none");

  vouchers.forEach(function (voucher: Voucher) {
    tableBody.append(createVoucherRow(voucher));
  });
}

function createVoucherRow(voucher: Voucher): JQuery<HTMLElement> {
  const row = cloneVoucherTemplate("voucher-row-template");

  row.find(".voucher-code").text(voucher.code);
  row.find(".voucher-value").text(formatVoucherCurrency(voucher.value));
  row
    .find(".voucher-remaining-value")
    .text(formatVoucherCurrency(voucher.remainingValue));

  row.find(".voucher-date").text(formatVoucherDate(voucher.expiryDate));

  row
    .find(".voucher-assigned-user")
    .text(voucher.userId ? `${voucher.userId}` : "Unassigned");

  renderVoucherStatusBadge(row, voucher.status);

  return row;
}

function renderVoucherStatusBadge(
  row: JQuery<HTMLElement>,
  status: string,
): void {
  const badge = row.find(".voucher-status");

  badge.removeClass("bg-success bg-secondary bg-danger");

  if (status === "active") {
    badge.text("Active").addClass("bg-success");
    return;
  }

  if (status === "redeemed") {
    badge.text("Redeemed").addClass("bg-secondary");
    return;
  }

  badge.text("Expired").addClass("bg-danger");
}

function createVoucher(userRole: string): void {
  clearVoucherMessages();

  const value = parseFloat(String($("#voucher-value").val() ?? ""));
  const validUntil = String($("#voucher-valid-until").val() ?? "");

  if (isNaN(value) || value <= 0) {
    showVoucherError("Please enter a valid voucher value greater than 0.");
    return;
  }

  if (!validUntil) {
    showVoucherError("Please select a valid expiration date.");
    return;
  }

  if (new Date(validUntil) <= new Date()) {
    showVoucherError("The expiry date must be in the future.");
    return;
  }

  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=vouchers&method=create",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ value, validUntil }),

    success: function (response: VoucherActionResponse) {
      if (response.error) {
        showVoucherError(response.error);
        return;
      }

      showVoucherSuccess(
        `Voucher ${response.voucherCode ?? ""} created successfully!`,
      );

      loadAndRenderVouchers(userRole);
    },

    // Try to read the backend error message. If no defined response is available, show generic error message.
    error: function (xhr: JQuery.jqXHR) {
      showVoucherError(getVoucherBackendError(xhr));
    },
  });
}

function addVoucherToProfile(userRole: string): void {
  clearVoucherMessages();

  const code = String($("#voucher-code").val() ?? "").trim().toUpperCase();

  if (!code) {
    showVoucherError("Please enter a voucher code.");
    return;
  }

  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=vouchers&method=addToProfile",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ code }),

    success: function (response: VoucherActionResponse) {
      if (response.error) {
        showVoucherError(response.error);
        return;
      }

      showVoucherSuccess(
        `Voucher ${response.voucherCode ?? code} added to profile successfully!`,
      );

      loadAndRenderVouchers(userRole);
    },

    error: function (xhr: JQuery.jqXHR) {
      showVoucherError(getVoucherBackendError(xhr));
    },
  });
}

function cloneVoucherTemplate(templateId: string): JQuery<HTMLElement> {
  const template = document.getElementById(
    templateId,
  ) as HTMLTemplateElement | null;

  const templateElement = template?.content.firstElementChild;

  if (!templateElement) {
    return $();
  }

  return $(templateElement.cloneNode(true) as HTMLElement);
}

function formatVoucherCurrency(value: number | string | null): string {
  return `€ ${Number(value ?? 0).toFixed(2)}`;
}

function formatVoucherDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function clearVoucherMessages(): void {
  $("#voucher-error").text("").addClass("d-none");
  $("#voucher-success").text("").addClass("d-none");
}

function showVoucherError(message: string): void {
  $("#voucher-error").text(message).removeClass("d-none");
}

function showVoucherSuccess(message: string): void {
  $("#voucher-success").text(message).removeClass("d-none");
}

function isVoucherBackendErrorResponse(
  response: unknown,
): response is VoucherBackendErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as VoucherBackendErrorResponse).error === "string"
  );
}

// Extracts error message from AJAX response, handling various response formats
function getVoucherBackendError(xhr: JQuery.jqXHR): string {
  const fallback = "An unexpected error occurred.";
  try {
    return JSON.parse(xhr.responseText).error || fallback;
  } catch {
    return xhr.responseText || fallback;
  }
}