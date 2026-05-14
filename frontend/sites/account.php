<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>

<main class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-8">

            <div class="card shadow-sm">
                <div class="card-body p-4">

                    <h1 class="h3 mb-4">My Account</h1>

                    <div id="account-error"
                         class="alert alert-danger d-none">
                    </div>

                    <div id="account-content" class="d-none">

                        <div class="mb-3">
                            <strong>Name:</strong>
                            <span id="account-name"></span>
                        </div>

                        <div class="mb-3">
                            <strong>Email:</strong>
                            <span id="account-email"></span>
                        </div>

                        <div class="mb-3">
                            <strong>Username:</strong>
                            <span id="account-username"></span>
                        </div>

                        <div class="mb-3">
                            <strong>Address:</strong>
                            <span id="account-address"></span>
                        </div>

                        <div class="mb-3">
                            <strong>ZIP / City:</strong>
                            <span id="account-city"></span>
                        </div>

                    </div>

                </div>
            </div>

        </div>
    </div>
</main>

<script src="/itea/frontend/js/account.js"></script>
<?php include __DIR__ . '/../layouts/footer.php'; ?>