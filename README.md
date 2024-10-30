# CO2 Advisor

Ein Express.js-basierter Microservice zur Visualisierung von CO2-Prognosen für den Stromverbrauch in Deutschland. Der Service nutzt die Corrently API, um stündliche CO2-Emissionswerte für den nächsten Tag basierend auf der Postleitzahl anzuzeigen.

## Live Demo

Der Service kann unter folgender URL getestet werden:
[https://co2advisor.corrently.io](https://co2advisor.corrently.io)

## Features

- Webbasierte Benutzeroberfläche mit PLZ-Eingabe
- Mehrere Ausgabeformate:
  - Interaktive HTML-Ansicht
  - Direkte PNG-Bildausgabe
  - JSON-API für maschinelle Verarbeitung
- Visualisierung der CO2-Werte als Balkendiagramm
- Farbcodierung der Werte (grün/gelb/rot) basierend auf Empfehlungen
- Responsive Design
- Base64-kodierte Bildausgabe für E-Mail-Integration
- 5-Minuten-Caching für optimale Performance
- Konfigurierbar über Umgebungsvariablen

## Installation

```bash
# Option 1: Globale Installation
npm install -g co2advisor

# Option 2: Repository klonen
git clone https://github.com/yourusername/co2advisor.git
cd co2advisor
npm install
```

## Erforderliche Pakete

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "canvas": "^2.11.2",
    "chart.js": "^4.4.1",
    "chartjs-adapter-moment": "^1.0.1",
    "corrently-api": "^2.0.3",
    "moment": "^2.29.4",
    "dotenv": "^16.0.3"
  }
}
```

## Konfiguration

### Umgebungsvariablen

Die Anwendung kann über folgende Umgebungsvariablen konfiguriert werden:

```bash
PORT=3000                  # Standard: 3000
APPID=your-corrently-appid # Optional: Standard-AppID wird verwendet
```
Tipp: Token und APPID können unter https://console.corrently.io erstellt werden.

Diese können auch in einer `.env` Datei definiert werden.

## Verwendung

### Als globales Kommando

Nach der globalen Installation:
```bash
co2advisor
```

### Als lokale Installation

```bash
node index.js
```

Nach dem Start ist der Service unter `http://localhost:3000` erreichbar.

### Endpunkte

1. **Startseite**
   - URL: `/`
   - Methode: `GET`
   - Beschreibung: Zeigt ein Eingabeformular für die Postleitzahl

2. **HTML-Visualisierung**
   - URL: `/chart?zipcode=<PLZ>`
   - Methode: `GET`
   - Parameter: `zipcode` (Postleitzahl)
   - Beispiel: `/chart?zipcode=69502`
   - Beschreibung: Zeigt die CO2-Prognose als interaktives Diagramm

3. **Direkter PNG-Download**
   - URL: `/chart/<PLZ>.png`
   - Methode: `GET`
   - Beispiel: `/chart/69502.png`
   - Beschreibung: Liefert das Diagramm als PNG-Datei
   - Cache: 5 Minuten

4. **REST-API**
   - URL: `/api/chart?zipcode=<PLZ>`
   - Methode: `GET`
   - Parameter: `zipcode` (Postleitzahl)
   - Beispiel: `/api/chart?zipcode=69502`
   - Rückgabe: JSON mit Prognosedaten und Base64-kodiertem Diagramm

### API-Antwortformat

```json
{
  "location": {
    "city": "Weinheim",
    "zipcode": "69502"
  },
  "data": [...],
  "chart": "data:image/png;base64,..."
}
```

## Fehlermeldungen

Der Service liefert folgende HTTP-Statuscodes:

- `200 OK`: Anfrage erfolgreich
- `400 Bad Request`: Fehlende oder ungültige Postleitzahl
- `500 Internal Server Error`: Serverfehler oder API-Probleme

## Browser-Kompatibilität

Der Service wurde mit folgenden Browsern getestet:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Entwicklung

### Projektstruktur

```
co2advisor/
├── index.js           # Hauptanwendung
├── package.json       # Projektabhängigkeiten
├── .env              # Umgebungsvariablen (optional)
└── README.md         # Dokumentation
```

### Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/energychain/co2advisor.git

# Abhängigkeiten installieren
cd co2advisor
npm install

# Entwicklungsserver starten
npm start
```

## Lizenz

[Apache-2.0](./LICENSE)

## Mitwirken

Beiträge sind willkommen! Bitte erstellen Sie einen Pull Request oder ein Issue für Vorschläge und Verbesserungen.

## Support

Bei Fragen oder Problemen können Sie:
- Ein Issue im GitHub Repository erstellen
- Den Service unter https://co2advisor.corrently.io testen
- Die API-Dokumentation unter https://api.corrently.io/v2.0/docs konsultieren

## Danksagung

- [Corrently API](https://api.corrently.io/) für die Bereitstellung der CO2-Daten
- [Chart.js](https://www.chartjs.org/) für die Visualisierungsbibliothek

---
Entwickelt mit ❤️ für eine nachhaltigere Zukunft