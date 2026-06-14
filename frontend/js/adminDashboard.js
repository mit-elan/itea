"use strict";
/**
 * Admin dashboard page
 * Protects the dashboard so only admin users can access it.
 */
$(document).ready(function () {
    requireRole("admin");
});
