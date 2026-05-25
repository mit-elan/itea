<?php include __DIR__ . '/../../layouts/header.php'; ?>

<!-- Navigation -->
<nav class="navbar navbar-expand-lg site-navbar fixed-top">
    <div class="container">
        <!-- Brand -->
        <a class="navbar-brand" href="/itea/frontend/admin/admin-dashboard.php">iTEA</a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar"
            aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/itea/frontend/admin/admin-dashboard.php">Admin Dashboard</a>
                </li>
            </ul>

            <ul class="navbar-nav align-items-lg-center">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle account-toggle" href="#" id="adminMenuDropdown" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Menu
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="adminMenuDropdown">
                        <li><a class="dropdown-item" href="/itea/frontend/sites/admin-upload.php">Upload Product</a></li>
                        <li><a class="dropdown-item" href="/itea/frontend/sites/admin-products.php">Edit Products</a></li>
                        <li><a class="dropdown-item" href="/itea/frontend/sites/admin-users.php">Manage Users</a></li>
                        <li><a class="dropdown-item" href="/itea/frontend/sites/admin-orders.php">Manage Orders</a></li>
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

<!-- Main Content -->
<main class="products-page py-5">
    <div class="container">
        <div class="row mb-5">
            <div class="col-12 mt-4">
                <h1 class="products-title">Admin Dashboard</h1>
                <p class="hero-subtitle">Select a category to manage your shop</p>
            </div>
        </div>

        <div class="row g-4">

            <!-- Upload Products -->
            <div class="col-md-6 col-lg-3">
                <a href="/itea/frontend/sites/admin-upload.php" class="admin-card-link">
                    <div class="tea-card h-100 text-center">
                        <div class="tea-card-image-wrapper">
                            <i class="bi bi-plus-circle admin-dashboard-icon"></i>
                        </div>
                        <div class="tea-card-body">
                            <h3 class="tea-card-title">Upload Products</h3>
                            <p class="tea-card-description">Add new tea varieties to the shop.</p>
                        </div>
                    </div>
                </a>
            </div>

            <!-- Edit Products -->
            <div class="col-md-6 col-lg-3">
                <a href="/itea/frontend/sites/admin-products.php" class="admin-card-link">
                    <div class="tea-card h-100 text-center">
                        <div class="tea-card-image-wrapper">
                            <i class="bi bi-pencil-square admin-dashboard-icon"></i>
                        </div>
                        <div class="tea-card-body">
                            <h3 class="tea-card-title">Edit Products</h3>
                            <p class="tea-card-description">Update or delete existing products.</p>
                        </div>
                    </div>
                </a>
            </div>

            <!-- Manage Users -->
            <div class="col-md-6 col-lg-3">
                <a href="/itea/frontend/sites/admin-users.php" class="admin-card-link">
                    <div class="tea-card h-100 text-center">
                        <div class="tea-card-image-wrapper">
                            <i class="bi bi-people admin-dashboard-icon"></i>
                        </div>
                        <div class="tea-card-body">
                            <h3 class="tea-card-title">Manage Users</h3>
                            <p class="tea-card-description">View customer accounts, manage roles and user permissions.</p>
                        </div>
                    </div>
                </a>
            </div>

            <!-- Manage Orders -->
            <div class="col-md-6 col-lg-3">
                <a href="/itea/frontend/sites/admin-orders.php" class="admin-card-link">
                    <div class="tea-card h-100 text-center">
                        <div class="tea-card-image-wrapper">
                            <i class="bi bi-cart-check admin-dashboard-icon"></i>
                        </div>
                        <div class="tea-card-body">
                            <h3 class="tea-card-title">Manage Orders</h3>
                            <p class="tea-card-description">Track sales, update orders and view history.</p>
                        </div>
                    </div>
                </a>
            </div>

        </div>
    </div>
</main>

<?php include __DIR__ . '/../../layouts/footer.php'; ?>