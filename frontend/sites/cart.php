<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>
<script src="/itea/frontend/js/cart.js"></script>

<main class="cart-page py-5">
    <div class="container">
        <div class="cart-header mb-5">
            <h1 class="cart-title">Cart</h1>
        </div>

        <!-- Start der Haupt-Row -->
        <div class="row g-5">

            <!-- LINKE SPALTE: Produkte & Voucher -->
            <div class="col-lg-8">
                <section class="cart-items-section">

                    <!-- Tabellen-Header (Spalten müssen mit den Backend-Items übereinstimmen) -->
                    <div class="cart-table-header d-none d-md-block">
                        <div class="row align-items-center m-0">
                            <div class="col-md-6 ps-0">Product</div>
                            <div class="col-md-2 text-center text-nowrap">Price | 100g</div>
                            <div class="col-md-2 text-center">Quantity</div>
                            <div class="col-md-2 text-end pe-0">Subtotal</div>
                        </div>
                    </div>

                    <!-- Hier werden die Produkte aus dem Backend/JS geladen -->
                    <div id="cart-items-container">
                        <!-- Die Artikel werden hier dynamisch eingefügt -->
                    </div>
                </section>
            </div>

            <!-- RECHTE SPALTE: Zusammenfassung & Voucher -->
            <div class="col-lg-4">
                <aside class="cart-summary">
                    <h2 class="cart-summary-title">Cart Summary</h2>

                    <div class="cart-summary-total d-flex justify-content-between">
                        <span>Subtotal</span>
                        <span id="subtotal-value">€0.00</span>
                    </div>

                    <div class="cart-summary-divider"></div>

                    <p id="checkout-hint" class="text-muted small text-center mt-1" style="display:none;">
                    </p>
                    <a id="checkout-button" href="/iTEA/frontend/sites/checkout.php"
                        class="cart-checkout-button text-center d-block">
                        Proceed to checkout
                    </a>
                </aside>
            </div>

        </div> <!-- Ende der Haupt-Row -->
    </div>
</main>

<template id="cart-item-template">
    <article class="cart-item">
        <div class="row align-items-center">
            <div class="col-md-6 col-12">
                <div class="cart-item-main">
                    <button class="cart-remove" aria-label="Remove item">×</button>
                    <div class="cart-item-image-wrapper">
                        <img src="" alt="" class="cart-item-image">
                    </div>
                    <div class="cart-item-details">
                        <h2 class="cart-item-title"></h2>
                    </div>
                </div>
            </div>
            <div class="col-md-2 col-4 mt-3 mt-md-0 text-md-center">
                <div class="cart-item-price"></div>
            </div>
            <div class="col-md-2 col-4 mt-3 mt-md-0 d-flex flex-column align-items-md-center">
                <div class="cart-item-quantity">
                    <input type="number" min="1" class="cart-quantity-input">
                </div>
            </div>
            <div class="col-md-2 col-4 mt-3 mt-md-0 text-end">
                <span class="d-md-none d-block small text-muted">Subtotal</span>
                <div class="cart-item-subtotal"></div>
            </div>
        </div>
    </article>
</template>

<?php include __DIR__ . '/../layouts/footer.php'; ?>