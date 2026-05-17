<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>

<main class="container py-5">

    <div class="row justify-content-center">
        <div class="col-lg-10">

            <div class="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1 class="h3 mb-1">
                        Payment Methods
                    </h1>

                    <p class="text-muted mb-0">
                        Manage your saved payment options
                    </p>

                </div>

            </div>

            <div id="payment-error"
                 class="alert alert-danger d-none">
            </div>

            <div id="payment-list"
                 class="row g-3">
            </div>

            <div class="card shadow-sm mt-5">

                <div class="card-body p-4">

                    <h4 class="mb-4">
                        Add Payment Method
                    </h4>

                    <form id="payment-form">

                        <div class="mb-3">

                            <label class="form-label">
                                Payment Type
                            </label>

                            <select
                                id="payment-type"
                                class="form-select">

                                <option value="0">
                                    Credit Card
                                </option>

                                <option value="1">
                                    Bank Account
                                </option>

                            </select>

                        </div>

                        <div class="mb-3">

                            <label class="form-label">
                                Card Number / IBAN
                            </label>

                            <input
                                type="text"
                                id="payment-number"
                                class="form-control">

                        </div>

                        <div class="mb-4">

                            <label class="form-label">
                                Label
                            </label>

                            <input
                                type="text"
                                id="payment-label"
                                class="form-control"
                                placeholder="e.g. Personal Visa">

                        </div>

                        <button
                            type="submit"
                            class="btn btn-dark">

                            Save Payment Method

                        </button>

                    </form>

                </div>

            </div>

        </div>
    </div>

</main>

<script src="/itea/frontend/js/payment-methods.js"></script>

<?php include __DIR__ . '/../layouts/footer.php'; ?>