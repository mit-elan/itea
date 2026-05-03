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

                    <div class="cart-summary-row d-flex justify-content-between">
                        <span>Subtotal</span>
                        <span id="subtotal-value">€0.00</span>
                    </div>


                    <!-- VOUCHER HIER IN DER SUMMARY -->
                    <div class="cart-coupon mt-4 mb-4">
                        <div class="d-flex w-100">
                            <input type="text" class="cart-coupon-input flex-grow-1" placeholder="Voucher code" style="min-width: 0;">
                            <button class="btn cart-coupon-button">Apply</button>
                        </div>
                    </div>

                    <div class="cart-summary-divider"></div>

                    <div class="cart-summary-total d-flex justify-content-between">
                        <span>Total</span>
                        <span id="total-value">€0.00</span>
                    </div>

                    <a href="/iTEA/frontend/sites/checkout.php" class="cart-checkout-button text-center d-block">
                        Proceed to checkout
                    </a>
                </aside>
            </div>

        </div> <!-- Ende der Haupt-Row -->
    </div>
</main>

<?php include __DIR__ . '/../layouts/footer.php'; ?>