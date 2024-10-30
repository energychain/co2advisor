require('dotenv').config()
const express = require('express');
const { createCanvas } = require('canvas');
const chartjsadaptermoment = require("chartjs-adapter-moment");
const { Chart } = require('chart.js/auto');
const CorrentlyClient = require('corrently-api');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 3000;
const appid = process.env.APPID || "0x245f82B51793a63049E42b434510508a003621b4";

function getColorForAdvice(advice) {
    switch(advice.toLowerCase()) {
        case 'red': return '#a1262d';
        case 'yellow': return '#e8bf28';
        case 'green': return '#008e5e';
        default: return '#gray';
    }
}

async function createChart(zipcode) {
    const client = new CorrentlyClient({
        baseUrl: 'https://api.corrently.io',
        appid: appid
    });
    
    const advisory = await client.co2advisor.getAdvice(zipcode);    
    let data = [];
    let now = new Date().getTime();
    let tomorrow = (Math.floor(now/86400000) + 1)*86400000;
    let dayafter = tomorrow+86400000;
    
    for(let i=0;i<advisory.data.length;i++) {
        if( (advisory.data[i].time >= tomorrow) && (advisory.data[i].time <= dayafter)) {
            data.push(advisory.data[i]);
        }
    }
    
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => moment(d.time)),
            datasets: [{
                label: 'CO2 Wert',
                data: data.map(d => ({x: moment(d.time), y: d.co2})),
                backgroundColor: data.map(d => getColorForAdvice(d.advice))
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'DD.MM. HH:mm'
                        }
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: false,
                        callback: function(value, index, values) {                                  
                            const date = moment(1*data[index].time);                                       
                            return date.format('DD.MM. HH:mm');
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'CO2 (g/kWh)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return moment(context[0].parsed.x).format('DD.MM.YYYY, HH:mm [Uhr]');
                        },
                        label: function(context) {
                            return `CO2: ${context.parsed.y} g/kWh`;
                        }
                    }
                }
            }
        }
    });

    const buffer = canvas.toBuffer('image/png');
    advisory.chart = `data:image/png;base64,${buffer.toString('base64')}`;
    chart.destroy();
    return advisory;
}

// Startseite mit Formular
app.get('/', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>CO2 Prognose Service</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    line-height: 1.6;
                }
                .container { 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px;
                }
                .form-group {
                    margin: 20px 0;
                }
                input[type="text"] {
                    padding: 8px;
                    font-size: 16px;
                    width: 200px;
                }
                button {
                    padding: 8px 16px;
                    font-size: 16px;
                    background-color: #008e5e;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #007a4f;
                }
                .api-info {
                    margin-top: 40px;
                    padding: 20px;
                    background-color: #f5f5f5;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>CO2 Prognose Service</h1>
                <p>Geben Sie eine Postleitzahl ein, um die CO2-Prognose für morgen zu sehen.</p>
                
                <form action="/chart" method="get">
                    <div class="form-group">
                        <label for="zipcode">Postleitzahl:</label><br>
                        <input type="text" id="zipcode" name="zipcode" placeholder="z.B. 69502" required>
                        <button type="submit">Prognose anzeigen</button>
                    </div>
                </form>

                <div class="api-info">
                    <h2>API Nutzung</h2>
                    <p>Die Daten können auch über die API abgerufen werden:</p>
                    <ul>
                        <li><strong>Visualisierung:</strong> /chart?zipcode=XXXXX</li>
                        <li><strong>JSON-Daten:</strong> /api/chart?zipcode=XXXXX</li>
                    </ul>
                    <p>Beispiel: <a href="/chart?zipcode=69502">/chart?zipcode=69502</a></p>
                </div>
            </div>
        </body>
        </html>
    `;
    res.send(html);
});

// API Routen
app.get('/chart', async (req, res) => {
    try {
        const zipcode = req.query.zipcode;
        
        if (!zipcode) {
            return res.status(400).json({ error: 'Bitte geben Sie eine Postleitzahl an (zipcode Parameter)' });
        }

        const result = await createChart(zipcode);
        
        // HTML-Antwort mit eingebettetem Bild
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>CO2 Chart für PLZ ${zipcode}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .container { max-width: 800px; margin: 0 auto; }
                    img { max-width: 100%; height: auto; }
                    .api-note {
                        margin-top: 20px;
                        padding: 15px;
                        background-color: #f5f5f5;
                        border-radius: 4px;
                    }
                    .back-link {
                        display: inline-block;
                        margin-top: 20px;
                        color: #008e5e;
                        text-decoration: none;
                    }
                    .back-link:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>CO2 Prognose für ${zipcode} ${result.location.city}</h1>
                    <img src="${result.chart}" alt="CO2 Chart">
                    <div class="api-note">
                        <strong>API Zugriff:</strong> 
                        Die Daten dieser Ansicht können auch als JSON über den Endpunkt 
                        <code>/api/chart?zipcode=${zipcode}</code> abgerufen werden.
                    </div>
                    <a href="/" class="back-link">← Zurück zur Startseite</a>
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
    }
});

// JSON API Endpoint
app.get('/api/chart', async (req, res) => {
    try {
        const zipcode = req.query.zipcode;
        
        if (!zipcode) {
            return res.status(400).json({ error: 'Bitte geben Sie eine Postleitzahl an (zipcode Parameter)' });
        }

        const result = await createChart(zipcode);
        res.json(result);
    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
    }
});

// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});