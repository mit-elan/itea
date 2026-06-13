"use strict";
$(document).ready(function () {
    $("#footer-placeholder").load("/itea/frontend/partials/footer.html");
    checkLoginStatus().then(function (response) {
        const navPath = response.role === "admin"
            ? "/itea/frontend/partials/admin-nav.html"
            : "/itea/frontend/partials/nav.html";
        $("#nav-placeholder").load(navPath, function () {
            updateNavigation(response);
        });
    });
});
