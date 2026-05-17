<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>

<main class="container py-5">

    <div class="row justify-content-center">
        <div class="col-lg-10">

            <div class="card shadow-sm">
                <div class="card-body p-4">

                    <h1 class="h3 mb-4">
                        My Orders
                    </h1>

                    <div id="orders-error" class="alert alert-danger d-none">
                    </div>

                    <div id="orders-empty" class="alert alert-info d-none">

                        <h5 class="mb-2">
                            No orders yet
                        </h5>

                        <p class="mb-3">
                            You have not placed any orders yet.
                        </p>

                        <a href="/itea/frontend/sites/products.php" class="btn btn-dark btn-sm">

                            Browse Products

                        </a>

                    </div>

                    <div id="orders-content" class="d-none">

                        <div id="orders-list">
                        </div>

                    </div>

                </div>
            </div>

        </div>
    </div>

</main>

<script src="/itea/frontend/js/orders.js"></script>

<?php include __DIR__ . '/../layouts/footer.php'; ?>