"use strict";
/**
 * account.ts – Kundenkonto, Bestellhistorie, Rechnung
 * Sprint 2: SCRUM-62, SCRUM-63, SCRUM-64, SCRUM-65
 */
// TODO Sprint 2: loadProfile(), updateProfile(), loadOrders(), printInvoice()
$(document).ready(function () {
    loadProfile();
});
function loadProfile() {
    $.ajax({
        url: "/itea/backend/serviceHandler.php?handler=users&method=getProfile",
        type: "GET",
        dataType: "json",
        success: function (response) {
            if (response.error) {
                window.location.href = "/itea/frontend/sites/login.php";
                return;
            }
            $("#account-content").removeClass("d-none");
            $("#account-name").text(response.firstname + " " + response.lastname);
            $("#account-email").text(response.email);
            $("#account-username").text(response.username);
            $("#account-address").text(response.address);
            $("#account-city").text(response.zip + " " + response.city);
        },
        error: function () {
            $("#account-error")
                .removeClass("d-none")
                .text("Failed to load account data.");
        },
    });
}
