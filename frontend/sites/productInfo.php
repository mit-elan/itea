<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>
<script src="/itea/frontend/js/productInfo.js"></script>

<main class="container my-5">
    <div class="text-center p-5" style="display: none" id="no-tea-found">
        <p class="mb-4 text-muted">We couldn't find what you were looking for, but we have plenty of other blends waiting for you.</p>
        <hr>
        <a href="products.php" class="btn btn-outline-dark px-4">
            Back to all teas
        </a>
    </div>

    <div class="row align-items-center" id="product-details">
        <!-- Links: Bild -->
        <div class="col-md-6 mb-4 mb-md-0" id="product-image">
            <div class="tea-style-container p-4">
                <img src="" class="img-fluid object-fit-contain" alt="Produktbild" style="max-height: 100%;">
            </div>
        </div>

        <!-- Rechts: Infos -->
        <div class="col-md-6 ps-md-5" id="product-info">
            <!-- Breadcrumbs 
            <nav aria-label="breadcrumb" class="mb-2">
                <ol class="breadcrumb mb-0 text-uppercase small letter-spacing-1">
                    <li class="breadcrumb-item"><a href="#" class="text-decoration-none text-muted">All Tea</a></li>
                    <li class="breadcrumb-item"><a href="#" class="text-decoration-none text-muted">Black Tea</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Assam</li>
                </ol>
            </nav>
            -->

            <!-- Titel: display-6 für modernes, fettes Design -->
            <h1 class="display-6 fw-bold mb-3" id="product-title"></h1>

            <div class="d-flex align-items-center mb-3">
                <div id="product-rating" class="text-warning fs-5">
                </div>
                <span class="text-muted small" id="star-rating"></span>
                <span class="text-muted small ms-2" id="rating-text"></span>
            </div>

            <!-- Beschreibung: lead für bessere Lesbarkeit -->
            <p class="lead text-muted mb-4" id="product-description"></p>

            <!-- Preis: h3 für deutliche Sichtbarkeit -->
            <div class="h3 fw-bold mb-1" id="product-price"></div>

            <!-- Quantity & Cart Buttons -->
            <div class="d-flex align-items-center flex-wrap gap-3 mt-4">

                <!-- Quantity Selector (Input Group für perfekte Ausrichtung) -->
                <div class="input-group" style="width: 140px;">
                    <button class="btn btn-outline-dark rounded-0 border-2" type="button" id="button-minus">−</button>

                    <input type="number"
                        class="form-control text-center border-dark border-2 bg-transparent fw-bold rounded-0"
                        value="1"
                        id="quantity-input"
                        readonly>

                    <button class="btn btn-outline-dark rounded-0 border-2" type="button" id="button-plus">+</button>
                </div>

                <!-- Add to Cart Button: btn-dark und rounded-0 für den modernen Look -->
                <button class="btn btn-dark rounded-0 px-5 py-2 fw-bold text-uppercase add-to-cart-btn">
                    Add to cart
                </button>

            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../layouts/footer.php'; ?>