<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>

<main class="container py-5">

    <div class="row justify-content-center">
        <div class="col-lg-10">

            <div class="card shadow-sm">
                <div class="card-body p-4">
                    <div id="order-success" class="alert alert-success d-none">

                        Order placed successfully!

                    </div>
                    <div id="order-error" class="alert alert-danger d-none">
                    </div>

                    <div id="order-content" class="d-none">

                        <div class="mb-4">

                            <h1 class="h3 mb-2">
                                Order Details
                            </h1>

                            <p class="text-muted mb-0">
                                Order #<span id="order-id"></span>
                            </p>

                        </div>

                        <div class="row mb-4">

                            <div class="col-md-4">

                                <strong>Date:</strong>

                                <div id="order-date"></div>

                            </div>

                            <div class="col-md-4">

                                <strong>Invoice:</strong>

                                <div class="d-flex align-items-center gap-2 mt-1">

                                    <span id="order-invoice">
                                    </span>

                                    <button id="download-invoice" class="btn btn-outline-dark btn-sm">

                                        <i class="bi bi-download"></i>

                                    </button>

                                </div>

                            </div>

                            <div class="col-md-4">

                                <strong>Total:</strong>

                                <div id="order-total"></div>

                            </div>

                        </div>

                        <hr class="my-4">

                        <h5 class="mb-3">
                            Ordered Products
                        </h5>

                        <div id="order-items">
                        </div>

                    </div>

                </div>
            </div>

        </div>
    </div>

</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script src="/itea/frontend/js/order-details.js"></script>

<?php include __DIR__ . '/../layouts/footer.php'; ?>