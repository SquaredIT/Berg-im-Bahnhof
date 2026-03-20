# Berg im Bahnhof - Dashboard/CRM Design

## Tech-Stack
- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Backend:** Convex (self-hosted auf VPS)
- **Auth:** Convex Auth (Benutzername/Passwort)
- **PDF-Export:** jsPDF + html2canvas

## Benutzerrollen
- **Admin:** Voller Zugriff, Benutzerverwaltung
- **Mitarbeiter:** Eigene Regie-Listen/Zeiterfassung, Leserechte auf zugewiesene Projekte

## Module

### 1. Dashboard (Übersicht)
- KPIs: Offene Anfragen, aktive Projekte, Stunden diese Woche
- Letzte Aktivitäten
- Quick-Actions (Neue Anfrage, Neues Projekt, etc.)

### 2. Kunden (CRM)
- Kundenliste mit Suche/Filter
- Kundendetails (Kontakt, Adresse, Projekte, Anfragen-Historie)
- CRUD-Operationen

### 3. Anfragen
- Status: Neu, In Bearbeitung, Angebot erstellt, Abgeschlossen
- Anfrage → Projekt konvertieren
- Verknüpfung mit Kunde

### 4. Projekte
- Status: Geplant, Aktiv, Abgeschlossen
- Projektdetails: Kunde, Adresse, Start/Ende, zugewiesene Mitarbeiter
- Verknüpfte Regie-Listen

### 5. Regie-Listen (digitalisiertes Formular)
- Felder: Datum, Anschrift, Ausführung
- Mitarbeiter-Tabelle: Tag, Name, Stand, Arbeitszeit Mo-So, Gesamtstunden
- Material-Tabelle: Menge (St./kg/Meter), Bezeichnung, Einzelpreis, Gesamtpreis
- Verknüpfung mit Projekt
- PDF-Export

### 6. Inventar (digitalisiertes Formular)
- Felder: Listennummer, Datum, Durchgeführt von
- Artikel: Inventurnummer, Artikelbeschreibung, Einkaufspreis/St., Menge, Gesamtpreis
- PDF-Export

### 7. Bestellungen (digitalisiertes Formular)
- Felder: An Firma, Kunden-Nr., Datum
- Artikel: Artikel-Nr., Artikelbezeichnung, Anzahl, Länge (cm), Breite (cm), Verpackung (Größe)
- Kommission, Liefertermin
- PDF-Export

### 8. Benutzerverwaltung (nur Admin)
- Benutzer CRUD
- Rollenzuweisung (Admin/Mitarbeiter)

## Navigation
- Sidebar-Layout (collapsible auf Mobile)
- Breadcrumbs
- Responsive: Desktop (volle Sidebar), Tablet (collapsible), Mobile (Hamburger-Menü)

## Datenmodell

### users
- _id, name, email, password (hashed), role (admin|mitarbeiter), active, createdAt

### customers
- _id, firma, ansprechpartner, email, telefon, adresse (straße, plz, ort), notizen, createdAt

### inquiries
- _id, customerId, titel, beschreibung, status (neu|in_bearbeitung|angebot|abgeschlossen), createdAt, updatedAt

### projects
- _id, customerId, inquiryId?, titel, beschreibung, adresse, status (geplant|aktiv|abgeschlossen), startDatum, endDatum, mitarbeiterIds[], createdAt

### regieListen
- _id, projectId, datum, anschrift, ausfuehrung, mitarbeiter[{tag, name, stand, mo, di, mi, do, fr, sa, so, gesamtStunden}], material[{menge, einheit, bezeichnung, einzelpreis, gesamtpreis}], createdBy, createdAt

### inventory
- _id, listennummer, datum, durchgefuehrtVon, artikel[{inventurnummer, beschreibung, einkaufspreis, menge, gesamtpreis}], createdBy, createdAt

### orders
- _id, anFirma, kundenNr, datum, artikel[{artikelNr, bezeichnung, anzahl, laenge, breite, verpackung}], kommission, liefertermin, createdBy, createdAt
