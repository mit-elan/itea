/**
 * Loads shared page layout partials.
 * The navigation depends on the current user role.
 */

$(document).ready(function () {
  loadFooter();
  loadNavigation();
});

function loadFooter(): void {
  $("#footer-placeholder").load("/itea/frontend/partials/footer.html");
}

function loadNavigation(): void {
  checkLoginStatus()
    .then(function (response: LoginStatusResponse) {
      const navPath = getNavigationPath(response);

      $("#nav-placeholder").load(navPath, function () {
        updateNavigation(response);
      });
    })
    .fail(function () {
      $("#nav-placeholder").load("/itea/frontend/partials/nav.html");
    });
}

function getNavigationPath(response: LoginStatusResponse): string {
  if (response.role === "admin") {
    return "/itea/frontend/partials/admin-nav.html";
  }

  return "/itea/frontend/partials/nav.html";
}