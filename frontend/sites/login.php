<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>

<main class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
            <div class="card shadow-sm">
                <div class="card-body p-4">
                    <h1 class="h3 mb-4">Login</h1>

                    <form>
                        <div class="mb-3">
                            <label for="login-identifier" class="form-label">Username or email</label>
                            <input type="text" class="form-control" id="login-identifier">
                        </div>

                        <div class="mb-3">
                            <label for="login-password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="login-password">
                        </div>

                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="remember-login">
                            <label class="form-check-label" for="remember-login">
                                Remember login
                            </label>
                        </div>

                        <button type="submit" class="btn btn-success w-100">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../layouts/footer.php'; ?>