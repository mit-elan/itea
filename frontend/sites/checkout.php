<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>
<script src="/itea/frontend/js/checkout.js"></script>

<main class="cart-page py-5">
    <div class="container">

        <div class="mb-5 text-center">
            <h1 class="cart-title">Final Review & Order</h1>
        </div>

        <div class="checkout-container shadow-sm">

            <!-- STEP 1: REVIEW ITEMS -->
            <div class="checkout-step-header">
                <span>Review Your Selection</span>
                <i class="bi bi-bag-check"></i>
            </div>
            <div class="checkout-content-block">
                <div id="cart-items-container">
                    <!-- Items via Template -->
                </div>
            </div>

            <!-- STEP 2: PAYMENT METHOD -->
            <div class="checkout-step-header">
                <span>Payment Method</span>
                <i class="bi bi-credit-card"></i>
            </div>
            <div class="checkout-content-block">
                <div id="payment-methods-container">
                    <!-- Payment Methods via Template -->
                </div>
                <div class="mt-3">
                    <p class="text-dark small fw-600">
                        Payment method missing?
                        <a href="/iTEA/frontend/sites/payment-methods.php" class="text-decoration-underline">
                            Add it in your profile
                        </a>
                    </p>
                </div>
            </div>

            <!-- STEP 3: VOUCHER & TOTALS -->
            <div class="checkout-step-header">
                <span>Voucher & Final Amount</span>
                <i class="bi bi-cash-stack"></i>
            </div>

            <div class="checkout-footer-bg">
                <div class="row justify-content-between align-items-center mb-4">
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-uppercase">Have a voucher?</label>
                        <div class="input-group">
                            <input type="text" class="form-control cart-voucher-input rounded-0 border-dark" placeholder="Code">
                            <button class="btn btn-dark rounded-0 px-4" id="apply-voucher-button">Apply</button>
                        </div>
                        <div id="checkout-voucher-error" class="alert alert-danger rounded-0 mt-2 small d-none"></div>
                    </div>
                    <div class="col-md-5 mt-4 mt-md-0">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">Subtotal:</span>
                            <span id="subtotal-value" class="fw-600">€0.00</span>
                        </div>

                        <!-- Voucher Row -->
                        <div id="voucher-row" class="d-none justify-content-between mb-2 text-success fw-bold">
                            <span>Voucher:</span>
                            <div class="d-flex align-items-center gap-2">
                                <span id="voucher-value">- €0.00</span>
                                <button id="remove-voucher" class="btn-close" style="font-size: 0.6rem;"></button>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between final-total-row mt-3">
                            <span>Total:</span>
                            <span id="total-value">€0.00</span>
                        </div>
                    </div>
                </div>

                <!-- ORDER ERROR MESSAGE -->
                <div id="checkout-order-error" class="alert alert-danger rounded-0 mb-3 d-none"></div>

                <!-- FINAL ACTION -->
                <button type="submit" class="btn-place-order rounded-0" id="order-button">
                    Place Order
                </button>
            </div>
        </div>
    </div>
</main>

<!-- TEMPLATES -->

<template id="checkout-item-template">
    <div class="row align-items-center mb-3 pb-3 border-bottom border-light mx-0">
        <div class="col-2 px-0">
            <div class="border p-1 bg-white" style="width: 60px; height: 60px;">
                <img src="" alt="" class="cart-item-image w-100 h-100 object-fit-contain">
            </div>
        </div>
        <div class="col-6">
            <h3 class="cart-item-title h6 mb-0 fw-bold text-dark"></h3>
            <span class="text-muted small cart-item-quantity"></span>
        </div>
        <div class="col-4 text-end">
            <span class="cart-item-subtotal fw-600"></span>
        </div>
    </div>
</template>

<template id="payment-method-template">
    <div class="position-relative">
        <!-- Radio Input hidden but functional -->
        <input class="payment-radio-hidden" type="radio" name="payment">
        <div class="payment-option-wrapper">
            <div class="d-flex align-items-center">
                <i class="bi bi-check-circle-fill text-dark me-3" style="font-size: 1.2rem;"></i>
                <div>
                    <span class="fw-bold d-block payment-type-label h6 mb-1"></span>
                    <span class="small text-muted payment-sub-label"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<?php include __DIR__ . '/../layouts/footer.php'; ?>