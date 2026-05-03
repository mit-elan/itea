<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>
<script src="/itea/frontend/js/checkout.js"></script>

<main class="cart-page py-5">
    <div class="container">
        <!-- Header -->
        <div class="cart-header mb-5 text-center">
            <h1 class="cart-title">Order Summary</h1>
        </div>

        <div class="row justify-content-center">
            <div class="col-lg-8">
                <!-- Der zentrale Rechnungs-Block -->
                <div class="cart-summary p-4 p-md-5">

                    <!-- 1. Container für die Produkte -->
                    <h2 class="h5 fw-bold mb-4 text-uppercase border-bottom pb-2">Your Items</h2>
                    <div id="cart-items-container"></div> <!-- ← NEU, hardcodierte Produkte löschen -->

                    <!-- 2. Subtotal Wert -->
                    <div class="cart-summary-row d-flex justify-content-between mb-2">
                        <span>Subtotal</span>
                        <span id="subtotal-value">€0.00</span> <!-- ← id hinzufügen -->
                    </div>

                    <div class="cart-actions">
                        <div class="cart-coupon">
                            <input type="text" class="cart-coupon-input" placeholder="Voucher code">
                            <button class="btn cart-coupon-button">Apply voucher</button>
                        </div>
                    </div>


                    <!-- 3. Voucher Applied (standardmäßig versteckt) -->
                    <div class="cart-summary-row d-flex justify-content-between mb-2 text-success fw-bold" id="voucher-row" style="display:none !important">
                        <span>Voucher Applied</span>
                        <span id="voucher-value">- €0.00</span>
                    </div>

                    <!-- 4. Total Wert -->
                    <div class="cart-summary-total d-flex justify-content-between mt-4 mb-5">
                        <span>Total Amount</span>
                        <span id="total-value">€0.00</span> <!-- ← id hinzufügen -->
                    </div>

                    <!-- 3. Payment Sektion -->
                    <div class="mb-4">
                        <h2 class="h5 fw-bold mb-3 text-uppercase">Payment Method</h2>

                        <div class="form-check mb-3">
                            <input class="form-check-input" type="radio" name="payment" id="pay1" checked>
                            <label class="form-check-label w-100" for="pay1">
                                <span class="fw-bold d-block">Credit Card</span>
                                <span class="small text-muted">Visa / Mastercard ending in XX45</span>
                            </label>
                        </div>

                        <div class="form-check mb-3">
                            <input class="form-check-input" type="radio" name="payment" id="pay2">
                            <label class="form-check-label w-100" for="pay2">
                                <span class="fw-bold d-block">Bank Transfer (IBAN)</span>
                                <span class="small text-muted">DE XXXX XXXX XXXX XX89</span>
                            </label>
                        </div>

                        <a href="/iTEA/frontend/sites/profile.php" class="small text-decoration-none text-dark d-block mt-2 opacity-75">
                            Payment method missing? Add it in your profile.
                        </a>
                    </div>

                    <!-- Button: Zahlungspflichtig bestellen -->
                    <button type="submit" class="cart-checkout-button w-100 py-3 border-0">
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../layouts/footer.php'; ?>