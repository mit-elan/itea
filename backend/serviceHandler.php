<?php

/**
 * Central entry point for all AJAX requests from the frontend.
 *
 * URL schema:
 * serviceHandler.php?handler=products&method=getAll
 *
 * Request flow:
 * Frontend AJAX request -> serviceHandler.php -> RequestHandler -> Domain Handler -> DataHandler -> Database
 */

require_once __DIR__ . '/db/session.php';
require_once __DIR__ . '/db/dbaccess.php';

require_once __DIR__ . '/db/userDataHandler.php';
require_once __DIR__ . '/db/adminDataHandler.php';
require_once __DIR__ . '/db/cartDataHandler.php';
require_once __DIR__ . '/db/orderDataHandler.php';
require_once __DIR__ . '/db/paymentDataHandler.php';
require_once __DIR__ . '/db/productDataHandler.php';
require_once __DIR__ . '/db/voucherDataHandler.php';

require_once __DIR__ . '/logic/requestHandler.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$handler = $_GET['handler'] ?? $_POST['handler'] ?? '';
$method = $_GET['method'] ?? $_POST['method'] ?? '';

$input = json_decode(file_get_contents('php://input'), true);
$jsonData = is_array($input) ? $input : [];

// Make query parameters, form data, and JSON body data available to handlers.
// JSON body values override POST and query values if the same key exists.
$data = array_merge($_GET, $_POST, $jsonData);

unset($data['handler'], $data['method']);

try {
    $requestHandler = new RequestHandler(new DBaccess());
    $result = $requestHandler->dispatch($handler, $method, $data);

    if ($result === null) {
        response(400, [
            'code' => 400,
            'error' => 'Unknown handler or method'
        ]);
        exit();
    }

    if (isset($result['code'])) {
        response((int)$result['code'], $result);
        exit();
    }

    response(200, $result);
} catch (RuntimeException $e) {
    response(503, [
        'code' => 503,
        'error' => $e->getMessage()
    ]);
} catch (Throwable $e) {
    response(500, [
        'code' => 500,
        'error' => 'Internal server error'
    ]);
}

/**
 * Sends a JSON response with the given HTTP status code.
 *
 * @param int $httpStatus HTTP response status code
 * @param array $data Response payload
 * @return void
 */
function response(int $httpStatus, array $data): void
{
    http_response_code($httpStatus);
    echo json_encode($data);
}
