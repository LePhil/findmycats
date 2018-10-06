let express = require("express");
let request = require('request');
let app = express();

app.listen((process.env.PORT || 3000));

app.get('/', function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

app.get('/test', function (req, res) {
    res.send(process.env.test || "nope");
});
