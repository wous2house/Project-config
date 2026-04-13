<?php
// send-email.php

// 1. Zorg dat CORS goed staat als de front-end op een ander (sub)domein draait
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 2. Vang preflight OPTIONS requests af
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Lees de inkomende JSON data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Geen data ontvangen."]);
    exit();
}

$email = isset($data['email']) ? filter_var($data['email'], FILTER_SANITIZE_EMAIL) : '';
$toelichting = isset($data['toelichting']) ? htmlspecialchars($data['toelichting']) : 'Geen toelichting opgegeven.';
$summary = isset($data['summary']) ? htmlspecialchars($data['summary']) : '';
$totalPrice = isset($data['totalPrice']) ? floatval($data['totalPrice']) : 0;
$totalYearly = isset($data['totalYearly']) ? floatval($data['totalYearly']) : 0;
$isCorporate = isset($data['isCorporate']) && $data['isCorporate'] === true;

// 4. Formatteer de prijzen
$formattedPrice = number_format($totalPrice, 2, ',', '.');
$formattedYearly = number_format($totalYearly, 2, ',', '.');

// 5. Bouw de e-mail op
$to = "aanvraag@webdroids.nl";
$subject = "Nieuwe Project Aanvraag - Webdroids";

$message = "
<html>
<head>
  <title>Nieuwe Project Aanvraag</title>
</head>
<body>
  <h2>Nieuwe Project Aanvraag</h2>
  <p>Er is een nieuwe aanvraag binnengekomen via de configurator.</p>
  
  <h3>Samenvatting:</h3>
  <pre style='font-family: inherit; white-space: pre-wrap;'>" . $summary . "</pre>
  
  <h3>Toelichting:</h3>
  <p>" . nl2br($toelichting) . "</p>
  
  <h3>Geschatte kosten:</h3>";

if ($isCorporate) {
    $message .= "<p><strong>Eenmalig:</strong> In overleg</p>";
} else {
    $message .= "<p><strong>Eenmalig:</strong> &euro; " . $formattedPrice . " excl. BTW</p>";
}

if (!$isCorporate && $totalYearly > 0) {
    $message .= "<p><strong>Jaarlijks:</strong> &euro; " . $formattedYearly . " excl. BTW</p>";
}

if (!empty($email)) {
    $message .= "<p><strong>Kopie gestuurd naar:</strong> " . $email . "</p>";
}

$message .= "
</body>
</html>
";

// 6. Load .env file
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) {
            $value = substr($value, 1, -1);
        }
        putenv(sprintf('%s=%s', $name, $value));
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

// 7. PHPMailer instellen
// Zorg ervoor dat je de PHPMailer bestanden op je server hebt staan, bijvoorbeeld in een 'PHPMailer' map.
// Download PHPMailer van: https://github.com/PHPMailer/PHPMailer
// En pas de paden hieronder aan naar waar ze op jouw server staan.

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Pas deze paden aan naar de locatie van PHPMailer op jouw server
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);

try {
    // Haal SMTP gegevens op uit environment
    $smtpHost = getenv('SMTP_HOST') ?: 'mail.webdroids.com';
    $smtpUser = getenv('SMTP_USER') ?: 'aanvraag@webdroids.nl';
    $smtpPass = getenv('SMTP_PASS');

    // Server instellingen
    $mail->isSMTP();                                            // Gebruik SMTP
    $mail->Host       = $smtpHost;                              // SMTP server
    $mail->SMTPAuth   = true;                                   // Activeer SMTP authenticatie
    $mail->Username   = $smtpUser;                              // SMTP gebruikersnaam
    $mail->Password   = $smtpPass;                              // SMTP wachtwoord
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryptie; `PHPMailer::ENCRYPTION_SMTPS` (poort 465) wordt ook vaak gebruikt
    $mail->Port       = 587;                                    // TCP poort om te verbinden

    // Ontvangers
    $mail->setFrom('aanvraag@webdroids.nl', 'Webdroids Aanvraag');
    $mail->addAddress($to);                                     // Voeg een ontvanger toe

    // CC toevoegen als de gebruiker een e-mail heeft ingevuld
    if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $mail->addCC($email);
    }

    // Inhoud
    $mail->isHTML(true);                                        // Stel e-mailformaat in op HTML
    $mail->Subject = $subject;
    $mail->Body    = $message;
    $mail->AltBody = strip_tags($message);                      // Voor niet-HTML mail clients

    $mail->send();
    echo json_encode(["success" => true, "message" => "Aanvraag succesvol verzonden!"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Er is een fout opgetreden bij het verzenden van de e-mail. Mailer Error: {$mail->ErrorInfo}"]);
}
?>
