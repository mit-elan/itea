<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>

<main class="cart-page py-5">
    <div class="container">
        <div class="cart-header mb-5">
            <h1 class="cart-title">Cart</h1>
        </div>

        <div class="row g-5">
            <div class="col-lg-8">
                <section class="cart-items-section">
                    <div class="cart-table-header d-none d-md-grid">
                        <span>Product</span>
                        <span>Price</span>
                        <span>Quantity</span>
                        <span>Subtotal</span>
                    </div>

                    <article class="cart-item">
                        <div class="cart-item-main">
                            <button class="cart-remove" aria-label="Remove item">×</button>

                            <div class="cart-item-image-wrapper">
                                <img src="/iTEA/frontend/assets/img/japanFukamushiBIO.webp" alt="Japan Fukamushi BIO" class="cart-item-image">
                            </div>

                            <div class="cart-item-details">
                                <h2 class="cart-item-title">Japan Fukamushi BIO - 100g</h2>
                                <p class="cart-item-description">
                                    Deep-steamed sencha with an intensely green cup and smooth umami notes.
                                </p>
                            </div>
                        </div>

                        <div class="cart-item-price">€33.00</div>

                        <div class="cart-item-quantity">
                            <input type="number" value="1" min="1" class="cart-quantity-input">
                        </div>

                        <div class="cart-item-subtotal">€33.00</div>
                    </article>

                    <article class="cart-item">
                        <div class="cart-item-main">
                            <button class="cart-remove" aria-label="Remove item">×</button>

                            <div class="cart-item-image-wrapper">
                                <img src="/iTEA/frontend/assets/img/dragonfruitCranberry.webp" alt="Dragonfruit Cranberry" class="cart-item-image">
                            </div>

                            <div class="cart-item-details">
                                <h2 class="cart-item-title">Dragonfruit Cranberry - 200g</h2>
                                <p class="cart-item-description">
                                    Exotic fruit infusion with a vivid cup and sweet-tart berry notes.
                                </p>
                            </div>
                        </div>

                        <div class="cart-item-price">€12.00</div>

                        <div class="cart-item-quantity">
                            <input type="number" value="1" min="1" class="cart-quantity-input">
                        </div>

                        <div class="cart-item-subtotal">€12.00</div>
                    </article>

                    <div class="cart-actions">
                        <div class="cart-coupon">
                            <input type="text" class="cart-coupon-input" placeholder="Voucher code">
                            <button class="btn cart-coupon-button">Apply voucher</button>
                        </div>
                    </div>
                </section>
            </div>

            <div class="col-lg-4">
                <aside class="cart-summary">
                    <h2 class="cart-summary-title">Cart Summary</h2>

                    <div class="cart-summary-row">
                        <span>Subtotal</span>
                        <span>€45.00</span>
                    </div>

                    <div class="cart-summary-row">
                        <span>Shipping</span>
                        <span>€4.90</span>
                    </div>

                    <div class="cart-summary-row">
                        <span>Voucher</span>
                        <span>€0.00</span>
                    </div>

                    <div class="cart-summary-divider"></div>

                    <div class="cart-summary-total">
                        <span>Total</span>
                        <span>€49.90</span>
                    </div>

                    <a href="/iTEA/frontend/sites/login.php" class="btn cart-checkout-button">
                        Proceed to checkout
                    </a>
                </aside>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../layouts/footer.php'; ?>