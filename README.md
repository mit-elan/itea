# iTEA – Webshop Projekt

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

### 2. TypeScript kompilieren
```bash
npm install -g typescript
tsc --watch
```
Die kompilierten JS-Dateien landen automatisch in `frontend/js/`.

### 3. Projekt starten
Projektordner in XAMPP `htdocs/` ablegen und im Browser öffnen:
`http://localhost/teashop/frontend/`

## Sprint-Übersicht
- **Sprint 0:** Projektstruktur, Repository, Systemarchitektur, DB-Setup, Grundlayout
- **Sprint 1:** Login/Registrierung, Produktansicht, Produktsuche
- **Sprint 2:** Warenkorb, Bestellung, Kundenkonto
- **Sprint 3:** Produktverwaltung (Admin), Kundenverwaltung (Admin)
- **Sprint 4:** Gutscheine, Zahlungsinformationen
