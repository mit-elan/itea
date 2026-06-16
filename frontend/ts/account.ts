/**
 * Handles customer account profile loading and profile updates.
 */

interface AccountProfileResponse {
  id: number;
  salutation: string;
  firstname: string;
  lastname: string;
  address: string;
  zip: string;
  city: string;
  email: string;
  username: string;
  role: string;
  active: boolean;
}

interface UpdateProfileRequest {
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  zip: string;
  city: string;
  password: string;
}

interface UpdateProfileResponse {
  message: string;
}

$(document).ready(function () {
  loadProfile();

  $("#account-form").on("submit", function (event) {
    event.preventDefault();
    updateProfile();
  });
});

/**
 * Loads the current customer's profile data and fills the account form.
 */
function loadProfile(): void {
  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=users&method=getProfile",
    type: "GET",
    dataType: "json",

    success: function (response: AccountProfileResponse) {
      $("#account-content").removeClass("d-none");

      $("#account-firstname").val(response.firstname);
      $("#account-lastname").val(response.lastname);
      $("#account-email").val(response.email);
      $("#account-address").val(response.address);
      $("#account-zip").val(response.zip);
      $("#account-city").val(response.city);
    },

    error: function (xhr: JQuery.jqXHR) {
      const errorMessage = xhr.responseText || "Failed to load account data.";
      showAccountError(errorMessage);
    },
  });
}

/**
 * Sends the updated profile data to the backend.
 */
function updateProfile(): void {
  clearAccountMessages();

  const updatedUser: UpdateProfileRequest = {
    firstname: getInputValue("#account-firstname"),
    lastname: getInputValue("#account-lastname"),
    email: getInputValue("#account-email"),
    address: getInputValue("#account-address"),
    zip: getInputValue("#account-zip"),
    city: getInputValue("#account-city"),
    password: getInputValue("#account-password"),
  };

  // Validate all required fields are filled
  const missingFields: string[] = [];
  if (!updatedUser.firstname) missingFields.push("First Name");
  if (!updatedUser.lastname) missingFields.push("Last Name");
  if (!updatedUser.email) missingFields.push("Email");
  if (!updatedUser.address) missingFields.push("Address");
  if (!updatedUser.zip) missingFields.push("ZIP");
  if (!updatedUser.city) missingFields.push("City");
  if (!updatedUser.password) missingFields.push("Password");

  if (missingFields.length > 0) {
    showAccountError(`Missing fields: ${missingFields.join(", ")}`);
    return;
  }

  $.ajax({
    url: "/itea/backend/serviceHandler.php?handler=users&method=updateProfile",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(updatedUser),

    success: function (response: UpdateProfileResponse) {
      $("#account-success")
        .removeClass("d-none")
        .text(response.message);

      $("#account-password").val("");
    },

    error: function (xhr: JQuery.jqXHR) {
      const errorMessage = getAccountError(xhr);
      showAccountError(errorMessage);
    },
  });
}

/**
 * Reads an input value as a string.
 *
 * @param selector Input selector
 * @returns Input value or an empty string
 */
function getInputValue(selector: string): string {
  const value = $(selector).val();

  return typeof value === "string" ? value : "";
}

/**
 * Extracts error message from backend API error response
 *
 * @param xhr jQuery AJAX error response object
 * @returns Error message from backend or fallback message
 */
function getAccountError(xhr: JQuery.jqXHR): string {
  const fallbackMessage = "Failed to update profile.";

  if (!xhr.responseText) {
    return fallbackMessage;
  }

  try {
    const response = JSON.parse(xhr.responseText) as ApiErrorResponse;
    return response.error ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

/**
 * Hides account feedback messages.
 */
function clearAccountMessages(): void {
  $("#account-error").addClass("d-none").text("");
  $("#account-success").addClass("d-none").text("");
}

/**
 * Displays an account error message.
 *
 * @param message Error message to display
 */
function showAccountError(message: string): void {
  $("#account-error").removeClass("d-none").text(message);
  $("#account-success").addClass("d-none").text("");
}