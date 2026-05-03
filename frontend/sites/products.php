<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>
<script src="/itea/frontend/js/products-dynamic.js"></script>
<script src="/itea/frontend/js/cart.js"></script>




<main class="products-page py-5">
    <div class="container">

        <section class="products-toolbar mb-4">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <h1 class="products-title mb-0">Products</h1>
                <input type="text" class="form-control products-search" id="search-input" placeholder="Search tea...">
            </div>
            <!-- Frage: lassen wir das mit hard code? -->
            <div class="category-filter d-flex flex-wrap gap-3">
                <button type="button" class="category-chip active" data-category="all" id="button-all">All Tea</button>
                <button type="button" class="category-chip" data-category="black" id="button-black">Black Tea</button>
                <button type="button" class="category-chip" data-category="green" id="button-green">Green Tea</button>
                <button type="button" class="category-chip" data-category="fruit" id="button-fruit">Fruit Tea</button>
                <button type="button" class="category-chip" data-category="herbal" id="button-herbal">Herbal Tea</button>
            </div>
        </section>

        <section class="products-grid">
            <div class="row g-4" id="product-list"></div>
            <p class="no-results text-center mt-4" style="display: none;" id="no-products">There are currently no products in stock for this category. Please come back later.</p>
    </section>
    </div>
</main>

<?php include __DIR__ . '/../layouts/footer.php'; ?>