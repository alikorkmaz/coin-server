const express = require("express");
const app = express();
const fetch = require("node-fetch");
const cron = require("node-cron");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.static("public"));
app.use(express.json());

let alert = [];
let alertReverse = [];
app.post("/alert", (req, res) => {
  req.body.forEach((item) => {
    alert.push(item);
  });
  alert = [...new Set(alert)];
});
app.post("/alert-delete", (req, res) => {
  req.body.forEach((item) => {
    alert = alert.filter((itemInAlert) => itemInAlert !== item);
  });
});
app.get("/alert", (req, res) => {
  res.send(alert);
});
app.post("/alert-reverse", (req, res) => {
  req.body.forEach((item) => {
    alertReverse.push(item);
  });
  alertReverse = [...new Set(alertReverse)];
});
app.post("/alert-reverse-delete", (req, res) => {
  req.body.forEach((item) => {
    alertReverse = alertReverse.filter((itemInAlert) => itemInAlert !== item);
  });
});
app.get("/alert-reverse", (req, res) => {
  res.send(alertReverse);
});

var Push = require("pushover-notifications");
var p = new Push({
  user: "g6qgivbzbg1nrakurqaaecmwrmcaxj",
  token: "aimiivzn6eh82mih6n21vu347aneum",
});

let commissionWithBinance = 0.0065;
let commissionWithGate = 0.012;
let tetherKur = 19.77;
let reelKur = 19.20;
let tetherMargin = 0.2;
let tetherMarginReverse = 0.5;

let lastCallTime = 0;
const callInterval = 60 * 1000; // 60 seconds in milliseconds
function ringAlarm(text) {
  const now = Date.now();
  if (now - lastCallTime < callInterval) {
    console.log('p.send was called too recently. Skipping call.');
    return;
  }

  p.send({ message: text }, function (err, result) {
    if (err) {
      console.error("Error occurred when ringing the alarm: ", err);
    } else {
      console.log("Alarm successfully rung!");
      lastCallTime = now;
    }
  });
}

setInterval(() => {
  fetch('http://ec2-52-67-99-93.sa-east-1.compute.amazonaws.com:3000/coinbase')
        .then(response => response.json())
        .then(data => {
          data.forEach((x) => {
            if (x.result > tetherKur + tetherMargin && !alert.includes(x.title)) {
              ringAlarm(x.title);
            }
          });
  });
  fetch('http://ec2-52-67-99-93.sa-east-1.compute.amazonaws.com:3000/coinbaseReverse')
      .then(response => response.json())
      .then(data => {
        data.forEach((x) => {
          if (x.result < tetherKur - tetherMarginReverse && !alertReverse.includes(x.title)) {
            ringAlarm("REV - " + x.title);
          }
        });
  });
}, 10000);


app.get("/test", (req, res) => {
  console.log("CONSOLE TEST" + "\n");
  ringAlarm("ALARM TEST");
  res.send("SUCCESS");
});

app.get('/reelkur', (req, res) => {
  res.send({
      kur: reelKur
  });
});

app.get('/kur', (req, res) => {
  res.send({
      kur: tetherKur
  });
});


async function binanceTask() {
  return fetch("https://api.binance.com/api/v3/ticker/bookTicker")
    .then((r) => r.json())
    .catch((x) => {
      console.log("binance get failed\n");
    });
}

async function gateTask(symbol) {
  return fetch(
    "https://api.gateio.ws/api/v4/spot/tickers?currency_pair=" +
      symbol +
      "_USDT"
  )
    .then((r) => r.json())
    .catch((x) => console.log(symbol + " gate failied"));
}

async function paribuTask() {
  let paribu = [];
  await fetch("https://www.paribu.com/ticker")
    .then((r) => r.json())
    .then((paribuRaw) => {
      for (const key in paribuRaw) {
        const obj = paribuRaw[key];
        obj.symbol = key.replace("_TL", "").replace("MIOTA", "IOTA");
        paribu.push(obj);
      }
      paribu = paribu.filter(
        (obj) => !(obj.symbol.endsWith("_USDT") || obj.symbol === "GAL")
      );
    })
    .catch((x) => console.log(x));
  
  tetherKur = paribu.find(x => x.symbol === "USDT").lowestAsk;
  return paribu;
}

async function btcturkTask() {
  try {
    const btcturk = await fetch("https://api.btcturk.com/api/v2/ticker")
      .then((r) => r.json())
      .then((j) => j.data)
      .catch((x) => console.log(x));
    return btcturk;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function getBtcturk(btcturk, binance, pairs) {
  try {
    btcturk.forEach((item) => {
      try {
        let mySymbol = item.pairNormalized.split("_")[0];
        if (item.pairNormalized.split("_")[1] != "TRY") return;

        if (
          binance.find((x) => x.symbol === mySymbol + "USDT")
        )
          if (mySymbol === "SHIB") {
            pairs.push({
              title: mySymbol + " - BTCTURK",
              commission: commissionWithBinance,
              buy:
                +binance.find((x) => x.symbol === mySymbol + "USDT").askPrice *
                1000,
              sell:
                +btcturk.find((x) => x.pair === mySymbol + "TRY").bid * 1000,
              result:
                (+btcturk.find((x) => x.pair === mySymbol + "TRY").bid *
                  (1 - commissionWithBinance)) /
                +binance.find((x) => x.symbol === mySymbol + "USDT").askPrice,
            });
          } else {
            pairs.push({
              title: mySymbol + " - BTCTURK",
              commission: commissionWithBinance,
              buy: +binance.find((x) => x.symbol === mySymbol + "USDT")
                .askPrice,
              sell: +btcturk.find((x) => x.pair === mySymbol + "TRY").bid,
              result:
                (+btcturk.find((x) => x.pair === mySymbol + "TRY").bid *
                  (1 - commissionWithBinance)) /
                +binance.find((x) => x.symbol === mySymbol + "USDT").askPrice,
            });
          }
      } catch {}
    });
  } catch {}
}

async function getParibu(paribu, binance, pairs) {
  paribu.forEach((item) => {
    try {
      
      
      
          
    //shib,pepe,bttc icin 3 sifir ekle
    
      
      
      pairs.push({
        title: item.symbol + " - PARIBU",
        commission: commissionWithBinance,
        buy: +binance.find((x) => x.symbol === item.symbol + "USDT").askPrice,
        sell: +paribu.find((x) => x.symbol === item.symbol).highestBid,
        result:
          (+paribu.find((x) => x.symbol === item.symbol).highestBid *
            (1 - commissionWithBinance)) /
          +binance.find((x) => x.symbol === item.symbol + "USDT").askPrice,
      });
      
      
      
      
    } catch {
      console.log(item.symbol);
    }
  });
}

async function getGate(gate, paribu, pairs) {
  try {
    item = gate[0];
    symbol = item.currency_pair.replace("_USDT", "");
    paribuItem = paribu.find((x) => x.symbol == symbol);
    pairs.push({
      title: symbol + " - GATE",
      commission: commissionWithGate,
      buy: +item.lowest_ask,
      sell: +paribuItem.highestBid,
      result:
        (paribuItem.highestBid * (1 - commissionWithGate)) / +item.lowest_ask,
    });
  } catch {}
}

app.get("/coinbase", async (req, res) => {
  let pairs = [];
  const [paribu, btcturk, binance, gateCeek, gateAtlas, gateFlr, gateRaca, gateBlur] =
    await Promise.all([
      paribuTask(),
      btcturkTask(),
      binanceTask(),
      gateTask("CEEK"),
      gateTask("ATLAS"),
      gateTask("FLR"),
      gateTask("RACA"),
      gateTask("BLUR"),
    ]);

  await Promise.all([
    getBtcturk(btcturk, binance, pairs),
    getParibu(paribu, binance, pairs),
    getGate(gateCeek, paribu, pairs),
    getGate(gateAtlas, paribu, pairs),
    getGate(gateFlr, paribu, pairs),
    getGate(gateRaca, paribu, pairs),
    getGate(gateBlur, paribu, pairs),
  ]);

  res.send(
    pairs
      .sort((a, b) => b.result - a.result)
      .filter(
        (pair) =>
          pair.title && pair.commission && pair.sell && pair.buy && pair.result && pair.result
      )
  );
});

async function getBtcturkReverse(btcturk, binance, pairs) {
  try {
    btcturk.forEach((item) => {
      try {
        let mySymbol = item.pairNormalized.split("_")[0];
        if (item.pairNormalized.split("_")[1] != "TRY") return;

        if (
          binance.find((x) => x.symbol === mySymbol + "USDT") ||
          mySymbol === "GLM" ||
          mySymbol === "LUNC"
        )
          if (mySymbol === "SHIB") {
            pairs.push({
              title: mySymbol + " - BTCTURK",
              commission: commissionWithBinance,
              buy: +btcturk.find((x) => x.pair === mySymbol + "TRY").ask * 1000,
              sell:
                +binance.find((x) => x.symbol === mySymbol + "USDT").bidPrice *
                1000,
              result:
                (+btcturk.find((x) => x.pair === mySymbol + "TRY").ask *
                  (1 + commissionWithBinance)) /
                +binance.find((x) => x.symbol === mySymbol + "USDT").bidPrice,
            });
          } else if (mySymbol === "GLM") {
            pairs.push({
              title: mySymbol + " - BTCTURK",
              commission: commissionWithBinance,
              buy: +btcturk.find((x) => x.pair === mySymbol + "TRY").ask,
              sell:
                (+binance.find((x) => x.symbol === mySymbol + "BTC").bidPrice *
                  +binance.find((x) => x.symbol === "BTCUSDT").bidPrice) /
                1000,
              result:
                (+btcturk.find((x) => x.pair === mySymbol + "TRY").ask *
                  (1 + commissionWithBinance)) /
                (+binance.find((x) => x.symbol === mySymbol + "BTC").bidPrice *
                  +binance.find((x) => x.symbol === "BTCUSDT").bidPrice),
            });
          } else if (mySymbol === "LUNC") {
            pairs.push({
              title: mySymbol + " - BTCTURK",
              commission: commissionWithBinance,
              buy: +btcturk.find((x) => x.pair === mySymbol + "TRY").ask,
              sell: +binance.find((x) => x.symbol === mySymbol + "BUSD")
                .bidPrice,
              result:
                (+btcturk.find((x) => x.pair === mySymbol + "TRY").ask *
                  (1 + (commissionWithBinance + 0.012))) /
                +binance.find((x) => x.symbol === mySymbol + "BUSD").bidPrice,
            });
          } else {
            pairs.push({
              title: mySymbol + " - BTCTURK",
              commission: commissionWithBinance,
              buy: +btcturk.find((x) => x.pair === mySymbol + "TRY").ask,
              sell: +binance.find((x) => x.symbol === mySymbol + "USDT")
                .bidPrice,
              result:
                (+btcturk.find((x) => x.pair === mySymbol + "TRY").ask *
                  (1 + commissionWithBinance)) /
                +binance.find((x) => x.symbol === mySymbol + "USDT").bidPrice,
            });
          }
      } catch {}
    });
  } catch {}
}

async function getParibuReverse(paribu, binance, pairs) {
  paribu.forEach((item) => {
    try {
      pairs.push({
        title: item.symbol + " - PARIBU",
        commission: commissionWithBinance,
        buy: +paribu.find((x) => x.symbol === item.symbol).lowestAsk,
        sell: +binance.find((x) => x.symbol === item.symbol + "USDT").bidPrice,
        result:
          (+paribu.find((x) => x.symbol === item.symbol).lowestAsk *
            (1 + commissionWithBinance)) /
          +binance.find((x) => x.symbol === item.symbol + "USDT").bidPrice,
      });
    } catch {
      console.log(item.symbol);
    }
  });
}

async function getGateReverse(gate, paribu, pairs) {
  try {
    item = gate[0];
    symbol = item.currency_pair.replace("_USDT", "");
    paribuItem = paribu.find((x) => x.symbol == symbol);
    pairs.push({
      title: symbol + " - GATE",
      commission: commissionWithGate,
      buy: +paribuItem.lowestAsk,
      sell: +item.highest_bid,
      result:
        (paribuItem.lowestAsk * (1 + commissionWithGate)) / +item.highest_bid,
    });
  } catch {}
}

app.get("/coinbaseReverse", async (req, res) => {
  let pairs = [];
  const [paribu, btcturk, binance, gateCeek, gateAtlas, gateFlr, gateRaca, gateBlur] =
    await Promise.all([
      paribuTask(),
      btcturkTask(),
      binanceTask(),
      gateTask("CEEK"),
      gateTask("ATLAS"),
      gateTask("FLR"),
      gateTask("RACA"),
      gateTask("BLUR"),
    ]);

  await Promise.all([
    getBtcturkReverse(btcturk, binance, pairs),
    getParibuReverse(paribu, binance, pairs),
    getGateReverse(gateCeek, paribu, pairs),
    getGateReverse(gateAtlas, paribu, pairs),
    getGateReverse(gateFlr, paribu, pairs),
    getGateReverse(gateRaca, paribu, pairs),
    getGateReverse(gateBlur, paribu, pairs),
  ]);

  res.send(
    pairs
      .sort((a, b) => a.result - b.result)
      .filter(
        (pair) =>
          pair.title && pair.commission && pair.sell && pair.buy && pair.result && pair.result
      )
  );
});

app.listen(process.env.PORT || 3000, () => console.log("listening..") + "\n");
