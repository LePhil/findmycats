let express = require("express");
let request = require('request');
let fetch = require('node-fetch');
let client = require('redis').createClient(process.env.REDIS_URL);
let app = express();

const key = process.env.key;
const secret = process.env.secret;
const hubble = process.env.id_hubble;
const james = process.env.id_james;

const uploadUrl = process.env.upload_url;
const uploadSecret = process.env.upload_secret;

app.listen((process.env.PORT || 3000));

app.get('/', function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

app.get('/test', function (req, res) {
    res.send(process.env.test || "nope");
});

app.get('/james', function (req, res) {    
    getData( james ).then(data => {
        res.send( data );
    });
});

app.get('/hubble', function (req, res) {    
    getData( hubble ).then(data => {
        res.send( data );
    });
});

let getData = (id) => {
    return fetch(`https://www.petpointer.ch/inc/pp-get-positions.php?lang=en&key=${key}&sec=${secret}&id=${id}&rangeD=1&rangeT=0&rangeTEnd=0`, {"credentials":"include","referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors" })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        const points = data.features;
        
        let convertedPoints = [];

        points.forEach(point => {
            convertedPoints.push({
                timestamp: point.properties.marker_ts,
                coordinates: point.geometry.coordinates
            });

            sendToDB(point.properties.marker_ts, id, point.geometry.coordinates[1], point.geometry.coordinates[0]);
        });

        return convertedPoints;
    });
}

let sendToDB = (timestamp, catId, longitude, latitude) => {
    let cat = "James";
    if (catId === hubble) {
        cat = "Hubble";
    }

    fetch(uploadUrl, { 
        method: 'POST',
        body:    JSON.stringify({
            'secret': uploadSecret,
            'cat': cat,
            'date': timestamp,
            'longitude': longitude,
            'latitude': latitude
        }),
        headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(json => console.log(json));
}

let changeCat = (id) => {
    return fetch(`https://www.petpointer.ch/inc/pp-account-switch-tracker.php?key=${id}`)
    .then((response) => {
        return response;
    });
}
