<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>

<main class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-8">

            <div class="card shadow-sm">
                <div class="card-body p-4">

                    <h1 class="h3 mb-4">My Account</h1>

                    <div id="account-error" class="alert alert-danger d-none">
                    </div>

                    <div id="account-success" class="alert alert-success d-none">
                    </div>

                    <div id="account-content" class="d-none">

                        <form id="account-form">

                            <div class="mb-3">
                                <label class="form-label">
                                    First Name
                                </label>

                                <input type="text" class="form-control" id="account-firstname" required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">
                                    Last Name
                                </label>

                                <input type="text" class="form-control" id="account-lastname" required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">
                                    Email
                                </label>

                                <input type="email" class="form-control" id="account-email" required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">
                                    Address
                                </label>

                                <input type="text" class="form-control" id="account-address">
                            </div>

                            <div class="mb-3">
                                <label class="form-label">
                                    ZIP
                                </label>

                                <input type="text" class="form-control" id="account-zip">
                            </div>

                            <div class="mb-3">
                                <label class="form-label">
                                    City
                                </label>

                                <input type="text" class="form-control" id="account-city">
                            </div>

                            <div class="mb-4">
                                <label class="form-label">
                                    Confirm Password
                                </label>

                                <input type="password" class="form-control" id="account-password" required>
                            </div>

                            <button type="submit" class="btn btn-dark">
                                Save Changes
                            </button>

                        </form>

                    </div>

                </div>
            </div>

        </div>
    </div>
</main>

<script src="/itea/frontend/js/account.js"></script>
<?php include __DIR__ . '/../layouts/footer.php'; ?>