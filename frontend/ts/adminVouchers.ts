/**
 * Admin voucher management page logic
 * Protects the admin voucher management page so only admin users can access it.
 * Loads all vouchers, renders the voucher table, and handles voucher creation.
 */

interface VouchersResponse {
  vouchers: Voucher[];
}

interface VoucherActionResponse {
  message: string;
  voucherCode: string;
}

$(document).ready(function () {
  requireRole("admin", function () {
    loadAdminVouchers();

    $("#create-voucher-form").on("submit", function (event) {
      event.preventDefault();
      createAdminVoucher();
    });
  });
});

function loadAdminVouchers(): void {
  $.ajax({
    url: `/itea/backend/serviceHandler.php?handler=vouchers&method=getAll`,
    type: "GET",
    dataType: "json",

    success: function (response: VouchersResponse) {
      renderAdminVoucherTable(response.vouchers);
    },

    error: function (xhr: JQuery.jqXHR) {
      console.error("Error loading vouchers:", xhr);
      showAdminVoucherError("Failed to load vouchers.");
    },
  });
}

function renderAdminVoucherTable(vouchers: Voucher[]): void {
  const tableBody = $("#voucher-table-body");
  tableBody.empty();

  if (vouchers.length === 0) {
    return;
  }

  vouchers.forEach(function (voucher: Voucher) {
    const template = document.getElementById("voucher-row-template") as HTMLTemplateElement;
    const rowClone = $(template.content.cloneNode(true)).children();

    rowClone.find(".voucher-code").text(voucher.code);
    rowClone.find(".voucher-value").text(`€ ${Number(voucher.value).toFixed(2)}`);
    rowClone.find(".voucher-remaining-value").text(`€ ${Number(voucher.remainingValue).toFixed(2)}`);
    rowClone.find(".voucher-date").text(new Date(voucher.expiryDate).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }));
    rowClone.find(".voucher-assigned-user").text(voucher.userId ? `${voucher.userId}` : "Unassigned");

    const badge = rowClone.find(".voucher-status");
    badge.removeClass("bg-success bg-secondary bg-danger");
    if (voucher.status === "active") {
      badge.text("Active").addClass("bg-success");
    } else if (voucher.status === "redeemed") {
      badge.text("Redeemed").addClass("bg-secondary");
    } else {
      badge.text("Expired").addClass("bg-danger");
    }

    tableBody.append(rowClone);
  });
}

function createAdminVoucher(): void {
  clearAdminVoucherMessages();

  const value = parseFloat(String($("#voucher-value").val() ?? ""));
  const validUntil = String($("#voucher-valid-until").val() ?? "");

  if (isNaN(value) || value <= 0) {
    showAdminVoucherError("Please enter a valid voucher value greater than 0.");
    return;
  }

  if (!validUntil) {
    showAdminVoucherError("Please select a valid expiration date.");
    return;
  }

  if (new Date(validUntil) <= new Date()) {
    showAdminVoucherError("The expiry date must be in the future.");
    return;
  }

  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=vouchers&method=create",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ value, validUntil }),

    success: function (response: VoucherActionResponse) {
      showAdminVoucherSuccess(`Voucher ${response.voucherCode} created successfully!`);
      loadAdminVouchers();
      ($("#create-voucher-form")[0] as HTMLFormElement).reset();
    },

    error: function (xhr: JQuery.jqXHR) {
      showAdminVoucherError(getAdminErrorMessage(xhr));
    },
  });
}

function clearAdminVoucherMessages(): void {
  $("#voucher-error").text("").addClass("d-none");
  $("#voucher-success").text("").addClass("d-none");
}

function showAdminVoucherError(message: string): void {
  $("#voucher-error").text(message).removeClass("d-none");
}

function showAdminVoucherSuccess(message: string): void {
  $("#voucher-success").text(message).removeClass("d-none");
}

function getAdminErrorMessage(xhr: JQuery.jqXHR): string {
  try {
    const response = JSON.parse(xhr.responseText) as ApiErrorResponse;
    return response.error ?? "An unexpected error occurred.";
  } catch {
    return "An unexpected error occurred.";
  }
}
