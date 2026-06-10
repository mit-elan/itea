<?php include __DIR__ . '/../../layouts/header.php'; ?>
<?php include __DIR__ . '/../../layouts/adminNav.php'; ?>
<script src="/itea/frontend/js/auth.js"></script>
<script src="/itea/frontend/js/adminProductUpload.js"></script>

<main class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-8">

            <div id="upload-success" class="alert alert-success alert-dismissable show my-4 text-center" role="alert" style="display:none">
                <a id="back-to-edit-link" href="/itea/frontend/sites/admin/productOverview.php">
                    <p id="back-to-edit-link"></p>
                </a>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <div class="card shadow-sm">
                <div class="card-body p-4">
                    <h1 class="h3 mb-4" id="upload-edit-title"></h1>
                    <a href="/itea/frontend/sites/admin/productOverview.php">
                        <p class="mb-4 text-center" id="error-message" href="frontend/sites/admin/productOverview.php"></p>
                    </a>

                    <form id="product-upload-form" novalidate>
                        <div class="input-group mb-3">
                            <input type="file" class="form-control" id="product-image" accept="image/jpg,image/jpeg,image/png, image/webp" required>
                        </div>

                        <div class="row mt-3">
                            <div class="col">
                                <label for="name" class="form-label mb-1">Name*</label>
                                <input type="text" class="form-control" id="name" required>
                            </div>
                            <div class="col">
                                <label for="category" class="form-label mb-1">Category*</label>
                                <select class="form-select" id="category" required>
                                </select>
                            </div>
                        </div>

                        <div class="col-md-12 mt-3">
                            <label for="description" class="form-label mb-1">Description*</label>
                            <!-- Textarea with auto-height: expands as user types, capped at 3 lines max -->
                            <textarea class="form-control" id="description" rows="1" style="max-height: calc(3 * 1.5em + 1rem); overflow-y: auto; resize: none;" oninput="this.style.height='auto'; this.style.height=Math.min(this.scrollHeight, parseInt(this.style.maxHeight)) + 'px';" required></textarea>
                        </div>

                        <div class="row mt-3">
                            <div class="col">
                                <label for="rating" class="form-label mb-1">Star-Rating*</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" step="0.1" id="rating" required>
                                    <span class="input-group-text"> | 5 Stars</span>
                                </div>
                            </div>
                            <div class="col">
                                <label for="price" class="form-label mb-1">Price*</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" step="0.01" id="price" required>
                                    <span class="input-group-text">€ | 100g</span>
                                </div>
                            </div>
                        </div>


                        <!-- Error message containers (hidden until validation fails) -->
                        <div class="col-12 mt-3">
                            <div id="field-error" class="alert alert-danger mb-1" style="display:none"></div>
                            <div id="rating-error" class="alert alert-danger mb-1" style="display:none"></div>
                            <div id="price-error" class="alert alert-danger mb-1" style="display:none"></div>
                            <div id="database-error" class="alert alert-danger mb-1" style="display:none"></div>
                        </div>
                        <div class="col-12">

                            <div class="col-12">
                                <button type="submit" class="btn btn-success" id="upload-edit-button">Upload Product</button>
                            </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../../layouts/footer.php'; ?>