<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Formulardaten auslesen
$services    = isset($_POST['services']) ? (is_array($_POST['services']) ? implode(', ', $_POST['services']) : $_POST['services']) : '';
$projectType = $_POST['projectType'] ?? '';
$areaSize    = $_POST['areaSize'] ?? '';
$timeframe   = $_POST['timeframe'] ?? '';
$message     = $_POST['message'] ?? '';
$firstName   = $_POST['firstName'] ?? '';
$lastName    = $_POST['lastName'] ?? '';
$email       = $_POST['email'] ?? '';
$phone       = $_POST['phone'] ?? '';
$address     = $_POST['address'] ?? '';

// Validierung
if (empty($firstName) || empty($lastName) || empty($email) || empty($services)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Pflichtfelder fehlen']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungueltige E-Mail-Adresse']);
    exit;
}

// Honeypot check
if (!empty($_POST['_honey'])) {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

// Bilder verarbeiten
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
$maxFileSize = 10 * 1024 * 1024; // 10 MB pro Datei
$maxFiles = 5;
$uploadedFiles = [];

if (!empty($_FILES['images']['name'][0])) {
    $fileCount = min(count($_FILES['images']['name']), $maxFiles);
    for ($i = 0; $i < $fileCount; $i++) {
        if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
            $tmpName = $_FILES['images']['tmp_name'][$i];
            $fileName = $_FILES['images']['name'][$i];
            $fileSize = $_FILES['images']['size'][$i];
            $fileType = $_FILES['images']['type'][$i];

            if ($fileSize > $maxFileSize) continue;
            if (!in_array($fileType, $allowedTypes)) continue;

            $uploadedFiles[] = [
                'tmp'  => $tmpName,
                'name' => $fileName,
                'type' => $fileType,
            ];
        }
    }
}

// SMTP-Konfiguration
$smtpHost = 'smtp.hostinger.com';
$smtpPort = 465;
$smtpUser = 'info@berg-im-bahnhof.de';
$smtpPass = 'Sommer2026!bib';

// ============================================
// 1. Benachrichtigung an das Unternehmen
// ============================================
try {
    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';
    $mail->isSMTP();
    $mail->Host       = $smtpHost;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = $smtpPort;

    $mail->setFrom('info@berg-im-bahnhof.de', 'Berg im Bahnhof - Website');
    $mail->addAddress('info@poprawa-bib.de');
    $mail->addCC('info@berg-im-bahnhof.de');
    $mail->addReplyTo($email, "$firstName $lastName");

    // Bilder als Anhang
    foreach ($uploadedFiles as $file) {
        $mail->addAttachment($file['tmp'], $file['name'], 'base64', $file['type']);
    }

    $mail->isHTML(true);
    $mail->Subject = "Neue Anfrage: $services";

    $mail->Body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #2c5530; border-bottom: 2px solid #2c5530; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            td { padding: 10px 12px; border-bottom: 1px solid #eee; }
            td:first-child { font-weight: bold; width: 160px; color: #555; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>Neue Kundenanfrage</h2>
            <p>Es ist eine neue Anfrage ueber die Website eingegangen:</p>
            <table>
                <tr><td>Leistungen</td><td>$services</td></tr>
                <tr><td>Objektart</td><td>$projectType</td></tr>
                <tr><td>Flaeche</td><td>" . ($areaSize ? "$areaSize m&sup2;" : '&ndash;') . "</td></tr>
                <tr><td>Zeitraum</td><td>" . ($timeframe ?: '&ndash;') . "</td></tr>
                <tr><td>Beschreibung</td><td>" . nl2br(htmlspecialchars($message ?: '–')) . "</td></tr>
            </table>
            <h2 style='margin-top:30px;'>Kontaktdaten</h2>
            <table>
                <tr><td>Name</td><td>$firstName $lastName</td></tr>
                <tr><td>E-Mail</td><td><a href='mailto:$email'>$email</a></td></tr>
                <tr><td>Telefon</td><td>" . ($phone ?: '&ndash;') . "</td></tr>
                <tr><td>Adresse</td><td>" . ($address ?: '&ndash;') . "</td></tr>
            </table>
            " . (count($uploadedFiles) > 0 ? "<p style='margin-top:20px;'><strong>" . count($uploadedFiles) . " Bild(er) angehängt</strong> – siehe Anhang dieser E-Mail.</p>" : "") . "
            <div class='footer'>
                Diese Nachricht wurde automatisch ueber das Kontaktformular auf berg-im-bahnhof.de gesendet.
            </div>
        </div>
    </body>
    </html>";

    $mail->AltBody = "Neue Kundenanfrage\n\n"
        . "Leistungen: $services\n"
        . "Objektart: $projectType\n"
        . "Flaeche: " . ($areaSize ? "$areaSize m²" : '-') . "\n"
        . "Zeitraum: " . ($timeframe ?: '-') . "\n"
        . "Beschreibung: " . ($message ?: '-') . "\n\n"
        . "Kontaktdaten:\n"
        . "Name: $firstName $lastName\n"
        . "E-Mail: $email\n"
        . "Telefon: " . ($phone ?: '-') . "\n"
        . "Adresse: " . ($address ?: '-') . "\n";

    $mail->send();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Fehler beim Senden: ' . $mail->ErrorInfo]);
    exit;
}

// ============================================
// 2. Bestaetigungsmail an den Kunden (Deutsch)
// ============================================
try {
    $customerMail = new PHPMailer(true);
    $customerMail->CharSet = 'UTF-8';
    $customerMail->isSMTP();
    $customerMail->Host       = $smtpHost;
    $customerMail->SMTPAuth   = true;
    $customerMail->Username   = $smtpUser;
    $customerMail->Password   = $smtpPass;
    $customerMail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $customerMail->Port       = $smtpPort;

    $customerMail->setFrom('info@berg-im-bahnhof.de', 'Berg im Bahnhof');
    $customerMail->addAddress($email, "$firstName $lastName");

    $customerMail->isHTML(true);
    $customerMail->Subject = 'Ihre Anfrage bei Berg im Bahnhof';

    $customerMail->Body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #2c5530; }
            .highlight { background: #f8f9f7; border-left: 4px solid #2c5530; padding: 15px 20px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            td { padding: 8px 12px; border-bottom: 1px solid #eee; }
            td:first-child { font-weight: bold; width: 160px; color: #555; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 13px; color: #777; }
            .btn { display: inline-block; background: #2c5530; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>Vielen Dank fuer Ihre Anfrage, $firstName!</h2>

            <p>Wir haben Ihre Anfrage erhalten und werden uns innerhalb von <strong>24 Stunden</strong> bei Ihnen melden.</p>

            <div class='highlight'>
                <strong>Ihre Anfrage im Ueberblick:</strong>
            </div>

            <table>
                <tr><td>Leistungen</td><td>$services</td></tr>"
                . ($projectType ? "<tr><td>Objektart</td><td>$projectType</td></tr>" : "")
                . ($areaSize ? "<tr><td>Flaeche</td><td>$areaSize m&sup2;</td></tr>" : "")
                . ($timeframe ? "<tr><td>Zeitraum</td><td>$timeframe</td></tr>" : "")
                . ($message ? "<tr><td>Beschreibung</td><td>" . nl2br(htmlspecialchars($message)) . "</td></tr>" : "") . "
            </table>

            <p style='margin-top: 25px;'>Falls Sie in der Zwischenzeit Fragen haben, erreichen Sie uns jederzeit:</p>

            <p>
                <strong>Telefon:</strong> <a href='tel:+491714142608'>0171 414 26 08</a><br>
                <strong>E-Mail:</strong> <a href='mailto:info@berg-im-bahnhof.de'>info@berg-im-bahnhof.de</a>
            </p>

            <div class='footer'>
                <p>Mit freundlichen Gruessen,<br><strong>Ihr Team von Berg im Bahnhof</strong></p>
                <p style='font-size: 11px; color: #999;'>
                    Berg im Bahnhof &ndash; Malerbetrieb<br>
                    Diese E-Mail wurde automatisch versendet. Bitte antworten Sie nicht direkt auf diese Nachricht.
                </p>
            </div>
        </div>
    </body>
    </html>";

    $customerMail->AltBody = "Vielen Dank fuer Ihre Anfrage, $firstName!\n\n"
        . "Wir haben Ihre Anfrage erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.\n\n"
        . "Ihre Anfrage:\n"
        . "Leistungen: $services\n"
        . ($projectType ? "Objektart: $projectType\n" : "")
        . ($areaSize ? "Flaeche: $areaSize m²\n" : "")
        . ($timeframe ? "Zeitraum: $timeframe\n" : "")
        . ($message ? "Beschreibung: $message\n" : "")
        . "\nMit freundlichen Gruessen,\nIhr Team von Berg im Bahnhof\n"
        . "\nTelefon: 0171 414 26 08\nE-Mail: info@berg-im-bahnhof.de\n";

    $customerMail->send();
} catch (Exception $e) {
    // Kundenmail fehlgeschlagen, aber Anfrage wurde bereits gesendet
    // Kein Abbruch - nur loggen
    error_log("Kundenbestaetigungsmail fehlgeschlagen: " . $customerMail->ErrorInfo);
}

echo json_encode(['success' => true, 'message' => 'Anfrage erfolgreich gesendet']);
