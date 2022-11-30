const express = require('express');
const app = express();
const fetch = require('node-fetch');
const cron = require('node-cron');


app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static('public'));

app.use(express.json());

app.get('/binance', async (req, res) => {
    let binance = await fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json()).catch(x => {console.log("binance get failed\n")});
    
    res.send(
        binance
    );
});

app.listen(process.env.PORT || 3000, () => console.log('listening..') + "\n");

process.on('uncaughtException', function(err) {
    p.send({
            message: err,
        },
        function(err, result) {},
    );
});
