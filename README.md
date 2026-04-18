# 🍵 TeaShop – Webshop Projekt

## Technologie-Stack
- **Frontend:** HTML, CSS (Bootstrap 5), TypeScript (→ kompiliert zu JS), jQuery, AJAX
- **Backend:** PHP (OOP), MySQL
- **Architektur:** Strikte FE/BE-Trennung, JSON-basierte Kommunikation

## Voraussetzungen
- PHP 8.x + MySQL (z.B. via XAMPP / MAMP)
- Node.js (für TypeScript-Kompilierung)

## Setup

### 1. Datenbank anlegen
```sql
-- In phpMyAdmin oder MySQL CLI:
CREATE DATABASE teashop;
USE teashop;
-- Dann database.sql importieren
SOURCE database.sql;
```

### 2. DB-Verbindung konfigurieren
Datei: `backend/config/dbaccess.php`
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'teashop');
```

### 3. TypeScript kompilieren
```bash
npm install -g typescript
tsc --watch
```
Die kompilierten JS-Dateien landen automatisch in `frontend/js/`.

### 4. Projekt starten
Projektordner in XAMPP `htdocs/` ablegen und im Browser öffnen:
`http://localhost/teashop/frontend/`

## Admin-Zugang (manuell in DB anlegen)
```sql
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@teashop.at', SHA2('admin123', 256), 'admin');
```

## Sprint-Übersicht
- **Sprint 0:** Projektstruktur, Repository, Systemarchitektur, DB-Setup, Grundlayout
- **Sprint 1:** Login/Registrierung, Produktansicht, Produktsuche
- **Sprint 2:** Warenkorb, Bestellung, Kundenkonto
- **Sprint 3:** Produktverwaltung (Admin), Kundenverwaltung (Admin)
- **Sprint 4:** Gutscheine, Zahlungsinformationen
