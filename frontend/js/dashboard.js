"use strict";
$(document).ready(function () {
    checkLoginStatus().then(function (response) {
        if (response.role !== "admin") {
            window.location.href = "/itea/frontend/index.php";
        }
    });
});
