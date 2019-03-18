const express = require("express");
const app = express();
const fetch = require("node-fetch");

let kur;
setInterval(() => {
  fetch(
    "http://data.fixer.io/api/latest?access_key=547f1508205c1568706666c56bc02f4e"
  )
    .then(response => response.json())
    .then(data => {
      kur = data.rates.TRY / data.rates.USD;
      console.log(kur.toFixed(4));
    })
    .catch(x => {
      console.log(x);
    });
}, 3600000);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(state);
});

app.get("/kur", (req, res) => {
  res.send({ kur: kur.toFixed(4) });
});

app.get("/koineks", (req, res) => {
  fetch("https://koineks.com/ticker")
    .then(response => response.json())
    .then(json => res.send(json));
});

app.get("/paribu", (req, res) => {
  fetch("https://paribu.com/ticker")
    .then(response => response.json())
    .then(json => res.send(json));
});

app.get("/btcturk", (req, res) => {
  fetch("https://www.btcturk.com/api/ticker")
    .then(response => response.json())
    .then(json => res.send(json));
});

app.listen(process.env.PORT || 3001, () => console.log("listening"));
