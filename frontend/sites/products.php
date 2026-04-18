<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>

<main class="products-page py-5">
    <div class="container">

        <section class="products-toolbar mb-4">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <h1 class="products-title mb-0">Products</h1>
                <input type="text" class="form-control products-search" id="search-input" placeholder="Search tea...">
            </div>

            <div class="category-filter d-flex flex-wrap gap-3">
                <button type="button" class="category-chip active" data-category="all">All Tea</button>
                <button type="button" class="category-chip" data-category="black">Black Tea</button>
                <button type="button" class="category-chip" data-category="green">Green Tea</button>
                <button type="button" class="category-chip" data-category="fruit">Fruit Tea</button>
                <button type="button" class="category-chip" data-category="herbal">Herbal Tea</button>
            </div>
        </section>

        <section class="products-grid">
            <div class="row g-4" id="product-list">

                <div class="col-md-6 col-xl-4" data-category="black">
                    <article class="tea-card h-100">
                        <div class="tea-card-image-wrapper">
                            <img src="/iTEA/frontend/assets/img/darjeelingRoyalFlush.webp" class="tea-card-image" alt="Darjeeling Royal Flush">
                        </div>

                        <div class="tea-card-body d-flex flex-column">
                            <h2 class="tea-card-title">Darjeeling Royal Flush</h2>
                            <p class="tea-card-description">
                                Fresh first flush Darjeeling with a bright cup and elegant character.
                            </p>
                            <p class="tea-card-rating mb-3">★★★★★</p>

                            <div class="tea-card-footer mt-auto d-flex justify-content-between align-items-center gap-3">
                                <p class="tea-card-price mb-0">€12.00</p>
                                <button class="btn tea-card-button add-to-cart-btn">Add to cart</button>
                            </div>
                        </div>
                    </article>
                </div>

                <div class="col-md-6 col-xl-4" data-category="green">
                    <article class="tea-card h-100">
                        <div class="tea-card-image-wrapper">
                            <img src="/iTEA/frontend/assets/img/japanFukamushiBIO.webp" class="tea-card-image" alt="Japan Fukamushi BIO">
                        </div>

                        <div class="tea-card-body d-flex flex-column">
                            <h2 class="tea-card-title">Japan Fukamushi BIO</h2>
                            <p class="tea-card-description">
                                Deep-steamed sencha with an intensely green cup and smooth umami notes.
                            </p>
                            <p class="tea-card-rating mb-3">★★★★★</p>

                            <div class="tea-card-footer mt-auto d-flex justify-content-between align-items-center gap-3">
                                <p class="tea-card-price mb-0">€33.00</p>
                                <button class="btn tea-card-button add-to-cart-btn">Add to cart</button>
                            </div>
                        </div>
                    </article>
                </div>

                <div class="col-md-6 col-xl-4" data-category="fruit">
                    <article class="tea-card h-100">
                        <div class="tea-card-image-wrapper">
                            <img src="/iTEA/frontend/assets/img/dragonfruitCranberry.webp" class="tea-card-image" alt="Dragonfruit Cranberry">
                        </div>

                        <div class="tea-card-body d-flex flex-column">
                            <h2 class="tea-card-title">Dragonfruit Cranberry</h2>
                            <p class="tea-card-description">
                                Exotic fruit infusion with a vivid cup and sweet-tart berry notes.
                            </p>
                            <p class="tea-card-rating mb-3">★★★★☆</p>

                            <div class="tea-card-footer mt-auto d-flex justify-content-between align-items-center gap-3">
                                <p class="tea-card-price mb-0">€12.00</p>
                                <button class="btn tea-card-button add-to-cart-btn">Add to cart</button>
                            </div>
                        </div>
                    </article>
                </div>

                <div class="col-md-6 col-xl-4" data-category="herbal">
                    <article class="tea-card h-100">
                        <div class="tea-card-image-wrapper">
                            <img src="/iTEA/frontend/assets/img/avurvedaFreshBIO.webp" class="tea-card-image" alt="Ayurveda Fresh BIO">
                        </div>

                        <div class="tea-card-body d-flex flex-column">
                            <h2 class="tea-card-title">Ayurveda Fresh BIO</h2>
                            <p class="tea-card-description">
                                Refreshing herbal blend with a light cup and lively, balanced aroma.
                            </p>
                            <p class="tea-card-rating mb-3">★★★★☆</p>

                            <div class="tea-card-footer mt-auto d-flex justify-content-between align-items-center gap-3">
                                <p class="tea-card-price mb-0">€8.00</p>
                                <button class="btn tea-card-button add-to-cart-btn">Add to cart</button>
                            </div>
                        </div>
                    </article>
                </div>

                <div class="col-md-6 col-xl-4" data-category="black">
                    <article class="tea-card h-100">
                        <div class="tea-card-image-wrapper">
                            <img src="/iTEA/frontend/assets/img/chinaKeemunCongou.webp" class="tea-card-image" alt="China Keemun Congou">
                        </div>

                        <div class="tea-card-body d-flex flex-column">
                            <h2 class="tea-card-title">China Keemun Congou</h2>
                            <p class="tea-card-description">
                                Mild Chinese black tea with soft spice notes and a smooth finish.
                            </p>
                            <p class="tea-card-rating mb-3">★★★★☆</p>

                            <div class="tea-card-footer mt-auto d-flex justify-content-between align-items-center gap-3">
                                <p class="tea-card-price mb-0">€5.00</p>
                                <button class="btn tea-card-button add-to-cart-btn">Add to cart</button>
                            </div>
                        </div>
                    </article>
                </div>

                <div class="col-md-6 col-xl-4" data-category="herbal">
                    <article class="tea-card h-100">
                        <div class="tea-card-image-wrapper">
                            <img src="/iTEA/frontend/assets/img/masalaChai.webp" class="tea-card-image" alt="Masala Chai">
                        </div>

                        <div class="tea-card-body d-flex flex-column">
                            <h2 class="tea-card-title">Masala Chai</h2>
                            <p class="tea-card-description">
                                Warming spiced tea with cinnamon, ginger, cardamom, and clove.
                            </p>
                            <p class="tea-card-rating mb-3">★★★★★</p>

                            <div class="tea-card-footer mt-auto d-flex justify-content-between align-items-center gap-3">
                                <p class="tea-card-price mb-0">€14.00</p>
                                <button class="btn tea-card-button add-to-cart-btn">Add to cart</button>
                            </div>
                        </div>
                    </article>
                </div>

            </div>
        </section>
    </div>
</main>

<?php include __DIR__ . '/../layouts/footer.php'; ?>