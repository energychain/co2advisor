# CO2 Advisor

Ein Express.js-basierter Microservice zur Visualisierung von CO2-Prognosen für den Stromverbrauch in Deutschland. Der Service nutzt die Corrently API, um stündliche CO2-Emissionswerte für den nächsten Tag basierend auf der Postleitzahl anzuzeigen.

## Features

- Webbasierte Benutzeroberfläche mit PLZ-Eingabe
- Visualisierung der CO2-Werte als Balkendiagramm
- Farbcodierung der Werte (grün/gelb/rot) basierend auf Empfehlungen
- REST-API für maschinelle Verarbeitung
- Responsive Design
- Base64-kodierte Bildausgabe

## Installation

```bash
# Repository klonen
git clone https://github.com/yourusername/co2advisor.git
cd co2advisor

# Abhängigkeiten installieren
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
    "moment": "^2.29.4"
  }
}
```

## Konfiguration

Die Anwendung verwendet standardmäßig den Port 3000. Dies kann in der Datei über die `port`-Variable angepasst werden.

Der [Corrently API-Key](https://console.corrently.io/) (appid) ist im Code hinterlegt und kann bei Bedarf angepasst werden:

```javascript
const appid = "0x245f82B51793a63049E42b434510508a003621b4";
```

## Verwendung

### Server starten

```bash
node index.js
```

Nach dem Start ist der Service unter `http://localhost:3000` erreichbar.

### Endpunkte

1. **Startseite**
   - URL: `/`
   - Methode: `GET`
   - Beschreibung: Zeigt ein Eingabeformular für die Postleitzahl

2. **Visualisierung**
   - URL: `/chart?zipcode=<PLZ>`
   - Methode: `GET`
   - Parameter: `zipcode` (Postleitzahl)
   - Beispiel: `/chart?zipcode=69502`
   - Beschreibung: Zeigt die CO2-Prognose als interaktives Diagramm

3. **REST-API**
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
└── README.md         # Dokumentation
```

## Lizenz

[Apache-2.0](./LICENSE)

## Mitwirken

Beiträge sind willkommen! Bitte erstellen Sie einen Pull Request oder ein Issue für Vorschläge und Verbesserungen.

## Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im GitHub Repository.

## Danksagung

- [Corrently API](https://api.corrently.io/) für die Bereitstellung der CO2-Daten
- [Chart.js](https://www.chartjs.org/) für die Visualisierungsbibliothek

---
Entwickelt mit ❤️ für eine nachhaltigere Zukunft