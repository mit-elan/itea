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
                <li class="nav-item">
                    <a class="nav-link" href="/itea/frontend/sites/products.php">Products</a>
                </li>
            </ul>

            <ul class="navbar-nav align-items-lg-center">
                <li class="nav-item">
                    <a class="nav-link" href="/itea/frontend/sites/login.php">Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/itea/frontend/sites/register.php">Register</a>
                </li>
                <li class="nav-item ms-lg-3">
                    <a class="btn btn-outline-light position-relative" href="/itea/frontend/sites/cart.php">
                        Cart
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cart-count">
                            0
                        </span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>