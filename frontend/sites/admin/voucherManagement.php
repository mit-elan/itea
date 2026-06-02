<?php include __DIR__ . '/../../layouts/header.php'; ?>
<?php include __DIR__ . '/../../layouts/adminNav.php'; ?>
<script src="/itea/frontend/js/voucher.js"></script>

<main class="products-page py-5">
    <div class="container">

        <div class="row mb-3">
            <div class="col">
                <h1 class="products-title mb-0">Manage Vouchers</h1>
            </div>
        </div>

        <!-- Voucher erstellen -->
        <div class="card shadow-sm border-0 rounded-0 mb-5">
            <div class="card-body p-4">
                <h5 class="fw-600 mb-4" style="letter-spacing: -0.02em;">Create New Voucher</h5>
                <form id="create-voucher-form" class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label small fw-600 text-uppercase">Amount (€)</label>
                        <input type="number" id="voucher-value" step="0.01" class="form-control" placeholder="0.00" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small fw-600 text-uppercase">Expiry Date</label>
                        <input type="date" id="voucher-valid-until" class="form-control" required>
                    </div>
                    <div class="col-md-4">
                        <button type="submit" class="cart-voucher-button w-100">
                            <i class="bi bi-plus-lg me-2"></i>Generate Voucher
                        </button>
                    </div>
                    <div class="col-12">
                        <div id="voucher-error" class="alert alert-danger rounded-0 mb-0 d-none"></div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Voucher-Übersicht -->
        <div class="card shadow-sm border-0 rounded-0">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead>
                            <tr class="cart-table-header">
                                <th class="ps-4 border-0">Code</th>
                                <th class="border-0">Value</th>
                                <th class="border-0">Remaining Value</th>
                                <th class="border-0">Valid Until</th>
                                <th class="border-0">Status</th>
                            </tr>
                        </thead>
                        <tbody id="voucher-table-body">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>
</main>

<!-- Template für dynamisch geladene Zeilen -->
<template id="voucher-row-template">
    <tr>
        <td class="ps-4 py-4">
            <code class="fw-600 voucher-code"></code>
        </td>
        <td><span class="fw-600 voucher-value"></span></td>
        <td><span class="fw-600 voucher-remaining-value"></span></td>
        <td><span class="voucher-date"></span></td>
        <td><span class="badge rounded-0 py-2 px-3 voucher-status"></span></td>
    </tr>
</template>

<?php include __DIR__ . '/../../layouts/footer.php'; ?>
