<nav class="navbar navbar-expand-lg site-navbar fixed-top">
    <div class="container">
        <!-- Brand -->
        <a class="navbar-brand" href="/itea/frontend/sites/admin/dashboard.php">iTEA</a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar"
            aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/itea/frontend/sites/admin/dashboard.php">Admin Dashboard</a>
                </li>
            </ul>

            <ul class="navbar-nav align-items-lg-center">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle account-toggle" href="#" id="adminMenuDropdown" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Menu
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="adminMenuDropdown">
                        <li><a class="dropdown-item" href="/itea/frontend/sites/admin/productUpload.php">Upload Product</a></li>
                        <li><a class="dropdown-item" href="/itea/frontend/sites/admin/productOverview.php">Edit Products</a></li>
                        <li><a class="dropdown-item" href="/itea/frontend/sites/admin/manageUsers.php">Manage Users</a></li>
                        <li><a class="dropdown-item" href="/itea/frontend/sites/admin/manageOrders.php">Manage Orders</a></li>
                        <li><a class="dropdown-item" href="/itea/frontend/sites/admin/manageVouchers.php">Manage Vouchers</a></li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li><a class="dropdown-item" href="#" id="admin-logout-button">Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>