<nav class="navbar navbar-expand-lg site-navbar fixed-top">
    <div class="container">
        <a class="navbar-brand" href="/itea/frontend/index.php">iTEA</a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/itea/frontend/index.php">Home</a>
                </li>

                <li class="nav-item" id="products-link">
                    <a class="nav-link" href="/itea/frontend/sites/products.php">Products</a>
                </li>

                <li class="nav-item admin-link" style="display:none;">
                    <a class="nav-link" href="/itea/frontend/sites/admin-products.php">Edit Products</a>
                </li>

                <li class="nav-item admin-link" style="display:none;">
                    <a class="nav-link" href="/itea/frontend/sites/admin-customers.php">Manage Customers</a>
                </li>

                <li class="nav-item admin-link" style="display:none;">
                    <a class="nav-link" href="/itea/frontend/sites/admin-vouchers.php">Manage Vouchers</a>
                </li>
            </ul>

            <ul class="navbar-nav align-items-lg-center">
                <li class="nav-item" id="login-link">
                    <a class="nav-link" href="/itea/frontend/sites/login.php">Login</a>
                </li>

                <li class="nav-item" id="register-link">
                    <a class="nav-link" href="/itea/frontend/sites/register.php">Register</a>
                </li>

                <li class="nav-item dropdown customer-link" style="display:none;">
                    <a class="nav-link dropdown-toggle account-toggle"
                        href="#"
                        id="accountDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false">
                        My Account
                    </a>

                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                        <li>
                            <a class="dropdown-item" href="/itea/frontend/sites/account.php">My Profile</a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="/itea/frontend/sites/orders.php">Orders</a>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <a class="dropdown-item" href="#" id="logout-button">Logout</a>
                        </li>
                    </ul>
                </li>

                <li class="nav-item ms-lg-3" id="cart-link">
                    <a class="btn btn-outline-light position-relative" href="/itea/frontend/sites/cart.php">
                        Cart
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cart-count">
                    0    
                    </span>
                    </a>
                </li>

                <li class="nav-item admin-link" style="display:none;">
                    <a class="nav-link" href="#" id="admin-logout-button">Logout</a>
                </li>
            </ul>
        </div>
    </div>
</nav>