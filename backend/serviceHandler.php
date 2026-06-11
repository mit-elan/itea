<?php
/**
 * Zentraler Einstiegspunkt für alle AJAX-Requests vom Frontend.
 * URL-Schema: serviceHandler.php?handler=products&method=getAll
 *
 * Architektur:
 *   Frontend (AJAX) → serviceHandler.php → *Handler → DataHandler → DB
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
$method  = $_GET['method']  ?? $_POST['method']  ?? '';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    $requestHandler = new RequestHandler(new DBaccess());
} catch (RuntimeException $e) {
    response(503, ['error' => $e->getMessage()]);
    exit();
}

$result = $requestHandler->dispatch($handler, $method, $data);

if ($result === null) {
    response(400, ['error' => 'Unknown handler or method']);
} else if (isset($result['code'])) {
    response($result['code'], ['error' => $result['error']]);
} else {
    response(200, $result);
}

function response(int $httpStatus, array $data): void
{
    http_response_code($httpStatus);
    echo json_encode($data);
}

?>