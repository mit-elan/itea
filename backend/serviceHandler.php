<?php
if ($_SERVER['SERVER_NAME'] === 'localhost') {
    ini_set('display_errors', 1);}
error_reporting(E_ALL);
/**
 * Zentraler Einstiegspunkt für alle AJAX-Requests vom Frontend.
 * URL-Schema: serviceHandler.php?handler=products&method=getAll
 *
 * Architektur:
 *   Frontend (AJAX) → serviceHandler.php → *Handler → DataHandler → DB
 */
require_once __DIR__ . '/config/session.php';
require_once __DIR__ . '/config/dataHandler.php';
require_once __DIR__ . '/logic/requestHandler.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$handler = $_GET['handler'] ?? $_POST['handler'] ?? '';
$method  = $_GET['method']  ?? $_POST['method']  ?? '';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$requestHandler = new RequestHandler(new DataHandler());
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