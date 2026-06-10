<?php include __DIR__ . '/../../layouts/header.php'; ?>
<?php include __DIR__ . '/../../layouts/adminNav.php'; ?>
<script src="/itea/frontend/js/auth.js"></script>
<script src="/itea/frontend/js/adminManageProducts.js"></script>

<main class="products-page py-5">
    <div class="container">
        <!-- Header Section -->
        <div class="row mb-4 align-items-end">
            <div class="col">
                <h1 class="products-title mb-0">Product Overview</h1>
            </div>
            <div class="col-auto">
                <a href="/itea/frontend/sites/admin/productUpload.php" class="btn btn-outline-dark rounded-0 px-4 fw-600">
                    <i class="bi bi-plus-lg me-2"></i>Add New Product
                </a>
            </div>
        </div>

        <!-- Table Card -->
        <div class="card shadow-sm border-0 rounded-0">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr class="cart-table-header">
                                <th class="ps-4 border-0">Picture</th>
                                <th class="border-0">Name</th>
                                <th class="border-0">Description</th>
                                <th class="border-0">Price | 100g</th>
                                <th class="border-0">Category</th>
                                <th class="border-0">Rating</th>
                                <th class="text-end pe-4 border-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="product-table-body">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>
</main>

<template id="product-row-template">
    <tr>
        <td class="ps-4 py-3">
            <div class="tea-style-container" style="width: 60px; height: 60px; padding: 5px;">
                <img class="product-img cart-item-image" src="" alt="">
            </div>
        </td>
        <td><span class="fw-600 product-name"></span></td>
        <td>
            <div class="admin-description-truncate product-description"></div>
        </td>
        <td><span class="fw-600 product-price"></span></td>
        <td><span class="badge rounded-0 py-2 px-3 bg-secondary opacity-75 product-category"></span></td>
        <td>
            <div class="tea-card-rating mb-0" style="font-size: 0.8rem;">
                <i class="bi bi-star-fill"></i> <span class="product-rating"></span>
            </div>
        </td>
        <td class="text-end pe-4">
            <div class="btn-group shadow-none">
                <a class="btn btn-outline-dark btn-sm rounded-0 me-2 product-edit-btn" href="#" title="Edit">
                    <i class="bi bi-pencil"></i>
                </a>
                <button class="btn btn-outline-danger btn-sm rounded-0 delete-product-btn" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    </tr>
</template>

<?php include __DIR__ . '/../../layouts/footer.php'; ?>
