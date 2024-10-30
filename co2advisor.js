#!/usr/bin/env node

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

async function createChartBuffer(zipcode) {
    try {
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
        
        if (data.length === 0) {
            throw new Error('Keine Daten für den angegebenen Zeitraum verfügbar');
        }

        // Neues Canvas mit festgelegter Größe
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // Hintergrund weiß machen
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);
        
        // Chart konfigurieren
        Chart.defaults.font.family = 'Arial';
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#000000';
        
        const configuration = {
            type: 'bar',
            data: {
                labels: data.map(d => moment(d.time)),
                datasets: [{
                    label: 'CO2 Wert',
                    data: data.map(d => d.co2),
                    backgroundColor: data.map(d => getColorForAdvice(d.advice))
                }]
            },
            options: {
                devicePixelRatio: 1,
                responsive: false,
                animation: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'DD.MM. HH:mm'
                            }
                        },
                        grid: {
                            color: '#dddddd'
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
                        grid: {
                            color: '#dddddd'
                        },
                        title: {
                            display: true,
                            text: 'CO2 (g/kWh)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    },
                    title: {
                        display: true,
                        text: `CO2 Prognose für ${zipcode}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20
                    }
                }
            }
        };

        // Chart erstellen
        const chart = new Chart(ctx, configuration);
        
        // Warten bis Rendering abgeschlossen ist
        await new Promise(resolve => setTimeout(resolve, 500));

        // Buffer erstellen
        const buffer = canvas.toBuffer('image/png', {
            compressionLevel: 6,
            filters: canvas.PNG_ALL_FILTERS,
            resolution: 96
        });

        // Aufräumen
        chart.destroy();
        
        return buffer;
    } catch (error) {
        console.error('Error in createChartBuffer:', error);
        throw error;
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

async function createChartBuffer(zipcode) {
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
    chart.destroy();
    return buffer;
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
                .endpoint {
                    background: #fff;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 5px 0;
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
                    <p>Die Daten können über verschiedene Endpunkte abgerufen werden:</p>
                    
                    <h3>1. Webansicht</h3>
                    <div class="endpoint">
                        <strong>URL:</strong> /chart?zipcode=XXXXX<br>
                        <strong>Beispiel:</strong> <a href="/chart?zipcode=69502">/chart?zipcode=69502</a><br>
                        <strong>Format:</strong> HTML-Seite mit eingebettetem Chart
                    </div>
                    
                    <h3>2. Direkter PNG-Download</h3>
                    <div class="endpoint">
                        <strong>URL:</strong> /chart/XXXXX.png<br>
                        <strong>Beispiel:</strong> <a href="/chart/69502.png">/chart/69502.png</a><br>
                        <strong>Format:</strong> PNG-Bild
                    </div>
                    
                    <h3>3. REST API</h3>
                    <div class="endpoint">
                        <strong>URL:</strong> /api/chart?zipcode=XXXXX<br>
                        <strong>Beispiel:</strong> <a href="/api/chart?zipcode=69502">/api/chart?zipcode=69502</a><br>
                        <strong>Format:</strong> JSON mit Base64-kodiertem Chart
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    res.send(html);
});

app.get('/chart/:zipcode.png', async (req, res) => {
    try {
        const zipcode = req.params.zipcode;
        
        if (!zipcode || !/^\d{5}$/.test(zipcode)) {
            return res.status(400).send('Ungültige Postleitzahl');
        }

        const buffer = await createChartBuffer(zipcode);
        
        // Cache-Header setzen
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 Minuten Cache
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Content-Disposition', `inline; filename="co2-prognose-${zipcode}.png"`);
        
        res.send(buffer);
    } catch (error) {
        console.error('Fehler bei PNG-Generierung:', error);
        res.status(500).send('Fehler bei der Generierung des Charts');
    }
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