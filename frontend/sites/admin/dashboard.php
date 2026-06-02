<?php include __DIR__ . '/../../layouts/header.php'; ?>
<?php include __DIR__ . '/../../layouts/adminNav.php'; ?>
<script src="/itea/frontend/ts/dashboard.js"></script>

<!-- Main Content -->
<main class="products-page py-5">
    <div class="container">
        <div class="row mb-5">
            <div class="col-12 mt-4">
                <h1 class="products-title">Admin Dashboard</h1>
                <p class="hero-subtitle">Select a category to manage your shop</p>
            </div>
        </div>

        <div class="row g-4 justify-content-center">

            <!-- Upload Products -->
            <div class="col">
                <a href="/itea/frontend/sites/admin/productUpload.php" class="admin-card-link">
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
            <div class="col">
                <a href="/itea/frontend/sites/admin/productOverview.php" class="admin-card-link">
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
            <div class="col">
                <a href="/itea/frontend/sites/admin/manageUsers.php" class="admin-card-link">
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
            <div class="col">
                <a href="/itea/frontend/sites/admin/manageOrders.php" class="admin-card-link">
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

            <!-- Manage Vouchers -->
            <div class="col">
                <a href="/itea/frontend/sites/admin/voucherManagement.php" class="admin-card-link">
                    <div class="tea-card h-100 text-center">
                        <div class="tea-card-image-wrapper">
                            <i class="bi bi-wallet-fill admin-dashboard-icon"></i>
                        </div>
                        <div class="tea-card-body">
                            <h3 class="tea-card-title">Manage Vouchers</h3>
                            <p class="tea-card-description">Generate new discout codes and review expired or redeemed vouchers. </p>
                        </div>
                    </div>
                </a>
            </div>

        </div>
    </div>
</main>

<?php include __DIR__ . '/../../layouts/footer.php'; ?>