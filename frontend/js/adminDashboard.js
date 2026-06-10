"use strict";
/**
 * Admin dashboard - requires admin role to access
 */
$(document).ready(function () {
    requireRole("admin");
});
