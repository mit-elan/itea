<?php include __DIR__ . '/../../layouts/header.php'; ?>
<?php include __DIR__ . '/../../layouts/adminNav.php'; ?>
<script src="/itea/frontend/js/auth.js"></script>

<main class="products-page py-5">
    <div class="container">
        <div class="row mb-4 align-items-end">
            <div class="col">
                <h1 class="products-title mb-0">Order Management</h1>
                <p class="hero-subtitle mb-0">
                    View all customer orders chronologically and edit order items.
                </p>
            </div>
        </div>

        <div id="order-message" class="alert" role="alert" style="display:none"></div>

        <div class="card shadow-sm border-0 rounded-0">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr class="cart-table-header">
                                <th class="ps-4 border-0">Order</th>
                                <th class="border-0">Date</th>
                                <th class="border-0">Customer</th>
                                <th class="border-0">Invoice Nr.</th>
                                <th class="border-0">Subtotal</th>
                                <th class="border-0">Voucher</th>
                                <th class="border-0">Total</th>
                                <th class="text-end pe-4 border-0">Action</th>
                            </tr>
                        </thead>
                        <tbody id="orders-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>

<div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content rounded-0">
            <div class="modal-header border-bottom">
                <h2 class="modal-title h5" id="orderDetailsModalLabel">Order Details</h2>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <div id="modal-order-details"></div>
            </div>

            <div class="modal-footer border-top">
                <button type="button" class="btn btn-outline-dark rounded-0" data-bs-dismiss="modal">
                    Close
                </button>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../../layouts/footer.php'; ?>
<script src="/itea/frontend/js/adminManageOrders.js"></script>