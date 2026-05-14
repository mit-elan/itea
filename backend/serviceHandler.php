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


// CORS-Header für lokale Entwicklung
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$handler = $_GET['handler'] ?? $_POST['handler'] ?? '';
$method  = $_GET['method']  ?? $_POST['method']  ?? '';

$requestHandler = new RequestHandler(new DataHandler());
//hier data / json übergeben - Service Handler zuständig für das empfangen der Daten.  Im cart handler kann man dann die usecases abarbeiten
$result = $requestHandler->dispatch($handler, $method);


if ($result === null) {
    //Hier fehler ausgeben switch mit zb 404 und 400
    http_response_code(400);
    echo json_encode(['error' => 'Unknown handler or method']);
} else {
    http_response_code(200);
    echo json_encode($result);
}

?>