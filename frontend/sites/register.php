<?php include __DIR__ . '/../layouts/header.php'; ?>
<?php include __DIR__ . '/../layouts/nav.php'; ?>

<main class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card shadow-sm">
                <div class="card-body p-4">
                    <h1 class="h3 mb-4">Register</h1>

                    <form class="row g-3">
                        <div class="col-md-2">
                            <label for="salutation" class="form-label">Salutation</label>
                            <select class="form-select" id="salutation">
                                <option>Ms.</option>
                                <option>Mr.</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div class="col-md-5">
                            <label for="first-name" class="form-label">First name</label>
                            <input type="text" class="form-control" id="first-name">
                        </div>

                        <div class="col-md-5">
                            <label for="last-name" class="form-label">Last name</label>
                            <input type="text" class="form-control" id="last-name">
                        </div>

                        <div class="col-12">
                            <label for="address" class="form-label">Address</label>
                            <input type="text" class="form-control" id="address">
                        </div>

                        <div class="col-md-4">
                            <label for="zip" class="form-label">ZIP</label>
                            <input type="text" class="form-control" id="zip">
                        </div>

                        <div class="col-md-8">
                            <label for="city" class="form-label">City</label>
                            <input type="text" class="form-control" id="city">
                        </div>

                        <div class="col-md-6">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email">
                        </div>

                        <div class="col-md-6">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username">
                        </div>

                        <div class="col-md-6">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password">
                        </div>

                        <div class="col-md-6">
                            <label for="password-repeat" class="form-label">Repeat password</label>
                            <input type="password" class="form-control" id="password-repeat">
                        </div>

                        <div class="col-12">
                            <label for="payment-info" class="form-label">Payment information</label>
                            <input type="text" class="form-control" id="payment-info" placeholder="Will later be split into proper fields">
                        </div>

                        <div class="col-12">
                            <button type="submit" class="btn btn-success">Create account</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../layouts/footer.php'; ?>