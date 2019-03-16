const express = require("express");
const app = express();
const fetch = require("node-fetch");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("hi");
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
