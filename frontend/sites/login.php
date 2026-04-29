<?php
include __DIR__ . '/../layouts/header.php';
include __DIR__ . '/../layouts/nav.php';

if (isset($_GET['register']) && $_GET['register'] === 'success') { ?>
    
<?php }
?>


<main class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
            <div id="registration-message" class="alert alert-success alert-dismissible fade show my-4 text-center" role="alert" style="display:none">
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <div class="card shadow-sm">
                <div class="card-body p-4">

                    <h1 class="h3 mb-4">Login</h1>

                    <div id="login-message" class="alert d-none" role="alert"></div>

                    <form id="login-form" novalidate>

                        <div class="mb-3">
                            <label for="login-identifier" class="form-label">
                                Username or email
                            </label>

                            <input
                                type="text"
                                class="form-control"
                                id="login-identifier"
                                name="identifier"
                                required
                                autocomplete="username">

                            <div class="invalid-feedback">
                                Please enter your username or email.
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="login-password" class="form-label">
                                Password
                            </label>

                            <div class="input-group">
                                <input
                                    type="password"
                                    class="form-control"
                                    id="login-password"
                                    name="password"
                                    required
                                    autocomplete="current-password">

                                <button
                                    type="button"
                                    class="btn btn-outline-secondary"
                                    id="toggle-login-password"
                                    aria-label="Show password">
                                    Show
                                </button>

                                <div class="invalid-feedback">
                                    Please enter your password.
                                </div>
                            </div>
                        </div>

                        <div class="form-check mb-3">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                id="remember-login"
                                name="remember">

                            <label class="form-check-label" for="remember-login">
                                Remember login
                            </label>
                        </div>

                        <button type="submit" class="btn btn-success w-100">
                            Login
                        </button>

                    </form>

                    <p class="text-center mt-3 mb-0">
                        No account yet?
                        <a href="/iTEA/frontend/sites/register.php">
                            Register here
                        </a>
                    </p>

                </div>
            </div>
        </div>
    </div>
</main>



<?php include __DIR__ . '/../layouts/footer.php'; ?>