<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>
<script src="/itea/frontend/js/voucher.js"></script>

<main class="container py-5">

    <div class="row justify-content-center">
        <div class="col-lg-10">

            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Vouchers</h1>
                    <p class="text-muted mb-0">Check your balances and add new vouchers to your account</p>
                </div>
            </div>

            <!-- Error Display -->
            <div id="voucher-error" class="alert alert-danger d-none"></div>
            <div id="voucher-success" class="alert alert-success d-none"></div>

            <!-- Add Voucher Form -->
            <div class="card shadow-sm mb-5">
                <div class="card-body p-4">

                    <h4 class="mb-4">Add Voucher</h4>

                    <p class="small text-muted mb-4">
                        Enter your 5-digit alphanumeric code. Once added, the voucher value will be credited
                        to your account and can be used during checkout.
                    </p>

                    <form id="voucher-form">
                        <div class="mb-4">
                            <label class="form-label">Voucher Code</label>
                            <input
                                type="text"
                                id="voucher-code"
                                class="form-control"
                                placeholder="e.g. A1B2C"
                                maxlength="5"
                                style="text-transform: uppercase; font-weight: 600;">
                        </div>
                        <button type="submit" class="btn btn-dark">
                            Add to Account
                        </button>
                    </form>

                </div>
            </div>

            <!-- No vouchers message (shown when backend returns empty) -->
            <div id="voucher-empty" class="card shadow-sm d-none">
                <div class="card-body p-4 text-muted">
                    You currently have no active vouchers.
                </div>
            </div>

            <!-- Voucher Table (only shown when vouchers are loaded) -->
            <div id="voucher-table-card" class="card shadow-sm d-none">
                <div class="card-header bg-white border-bottom px-4 py-3">
                    <h4 class="mb-0">Your Vouchers</h4>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-4">Code</th>
                                    <th>Value</th>
                                    <th>Remaining Value</th>
                                    <th>Valid Until</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="voucher-table-body"></tbody>
                        </table>
                    </div>
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

<?php include __DIR__ . '/../layouts/footer.php'; ?>