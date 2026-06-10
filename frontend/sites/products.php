<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>
<script src="/itea/frontend/js/products.js"></script>
<script src="/itea/frontend/js/cart.js"></script>

<!-- Fixed drop zone that appears during drag and fades out with the success message
     #drag-drop-zone-fixed = Container (Ein/Aus)
     .drag-drop-zone-default/success/error = Inhalte (Welche Message anzeigen) -->
<div id="drag-drop-zone-fixed">
  <div class="drag-drop-zone-default">
    <i class="bi bi-bag-plus"></i>
    <span>Drop here to add to cart</span>
  </div>
  <div class="drag-drop-zone-success" style="display: none;">
    <i class="bi bi-check-circle-fill"></i>
    <span>Product added to cart</span>
  </div>
  <div class="drag-drop-zone-error" style="display: none;">
    <i class="bi bi-exclamation-circle-fill"></i>
    <span>Failed to add to cart. Please try again.</span>
  </div>
</div>

<main class="products-page py-5">
    <div class="container">

        <section class="products-toolbar mb-4">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <h1 class="products-title mb-0">Products</h1>
                <input type="text" class="form-control products-search" id="search-input" placeholder="Search tea...">
            </div>
            <div class="category-filter d-flex flex-wrap gap-3">
                <button type="button" class="category-chip active" data-category="all" id="button-all">All Tea</button>
                <button type="button" class="category-chip" data-category="black" id="button-black">Black Tea</button>
                <button type="button" class="category-chip" data-category="green" id="button-green">Green Tea</button>
                <button type="button" class="category-chip" data-category="fruit" id="button-fruit">Fruit Tea</button>
                <button type="button" class="category-chip" data-category="herbal" id="button-herbal">Herbal Tea</button>
            </div>
        </section>

        <div class="row g-4" id="product-list"></div>
        <p class="no-results text-center mt-4" style="display:none;" id="no-products">
            There are currently no products in stock for this category. Please come back later.
        </p>
    </div>
</main>

<template id="product-card-template">
    <div class="col-lg-4 col-md-6 product-item">
        <div class="drag-handle" title="Drag into cart">
            <i class="bi bi-grip-vertical"></i>
        </div>
        <a class="product-link text-decoration-none text-dark d-block">
            <article class="tea-card h-100">
                <div class="tea-card-image-wrapper">
                    <img src="" class="tea-card-image" alt="">
                </div>
                <div class="tea-card-body d-flex flex-column">
                    <h2 class="tea-card-title"></h2>
                    <p class="tea-card-description"></p>
                    <p class="tea-card-rating mb-3">
                        <span class="stars"></span>
                        <span class="text-muted small review-text"></span>
                    </p>
                    <div class="tea-card-footer mt-auto d-flex justify-content-between align-items-center gap-3">
                        <p class="tea-card-price mb-0"></p>
                        <button class="btn tea-card-button button-addToCartList">Add to cart</button>
                    </div>
                </div>
            </article>
        </a>
    </div>
</template>

<?php include __DIR__ . '/../layouts/footer.php'; ?>
