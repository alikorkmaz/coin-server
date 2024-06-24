const express = require("express");
const app = express();
const fetch = require("node-fetch");
const cron = require("node-cron");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Middleware for setting CORS headers
app.use((req, res, next) => {
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

let lastCallTime = 0;
const callInterval = 60 * 1000;

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
  getCoinbaseData().then(data => {
    data.forEach((x) => {
      if (x.result > tetherKur + tetherKur * 0.03 && !alert.includes(x.title)) {
        ringAlarm(x.title);
      }
    });
  });

  getCoinbaseReverseData().then(data => {
    data.forEach((x) => {
      if (x.result < tetherKur - tetherKur * 0.06 && !alertReverse.includes(x.title)) {
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
    kur: 30
  });
});

app.get('/kur', (req, res) => {
  res.send({
    kur: tetherKur
  });
});


async function binanceTask() {
  try {
    const response = await fetch("https://api.binance.com/api/v3/ticker/bookTicker");
    return response.json();
  } catch (error) {
    console.log("binance get failed\n", error);
    return [];
  }
}

async function gateTask(symbol) {
  try {
    const response = await fetch(`https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${symbol}_USDT`);
    return response.json();
  } catch (error) {
    console.log(`${symbol} gate failed\n`, error);
    return [];
  }
}

async function paribuTask() {
  try {
    const response = await fetch("https://www.paribu.com/ticker");
    const paribuRaw = await response.json();
    let paribu = [];
    for (const key in paribuRaw) {
      const obj = paribuRaw[key];
      obj.symbol = key.replace("_TL", "").replace("MIOTA", "IOTA");
      paribu.push(obj);
    }
    paribu = paribu.filter(
      (obj) => !(obj.symbol.endsWith("_USDT") || obj.symbol === "GAL")
    );
    tetherKur = paribu.find(x => x.symbol === "USDT").lowestAsk;
    return paribu;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function btcturkTask() {
  try {
    const response = await fetch("https://api.btcturk.com/api/v2/ticker");
    const btcturkData = await response.json();
    return btcturkData.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function getBtcturk(btcturk, binance, pairs) {
  try {
    btcturk.forEach((item) => {
      try {
        let mySymbol = item.pairNormalized.split("_")[0];
        if (item.pairNormalized.split("_")[1] != "TRY") return;

        if (binance.find((x) => x.symbol === mySymbol + "USDT")) {
          if (mySymbol === "SHIB") {
            pairs.push({
              title: mySymbol + " - BTCTURK",
              commission: commissionWithBinance,
              buy: +binance.find((x) => x.symbol === mySymbol + "USDT").askPrice * 1000,
              sell: +btcturk.find((x) => x.pair === mySymbol + "TRY").bid * 1000,
              result: (+btcturk.find((x) => x.pair === mySymbol + "TRY").bid * (1 - commissionWithBinance)) /
                +binance.find((x) => x.symbol === mySymbol + "USDT").askPrice,
            });
          } else if (mySymbol === "GAL") {
            //DO NOTHING
          } else {
            pairs.push({
              title: mySymbol + " - BTCTURK",
              commission: commissionWithBinance,
              buy: +binance.find((x) => x.symbol === mySymbol + "USDT").askPrice,
              sell: +btcturk.find((x) => x.pair === mySymbol + "TRY").bid,
              result: (+btcturk.find((x) => x.pair === mySymbol + "TRY").bid * (1 - commissionWithBinance)) /
                +binance.find((x) => x.symbol === mySymbol + "USDT").askPrice,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function getParibu(paribu, binance, pairs) {
  try {
    paribu.forEach((item) => {
      try {
        let mySymbol = item.symbol;
        if (mySymbol === "SHIB" || mySymbol === "PEPE" || mySymbol === "BTTC" || mySymbol === "PEPE" || mySymbol === "FLOKI" || mySymbol === "BONK") {
          pairs.push({
            title: item.symbol + " - PARIBU",
            commission: commissionWithBinance,
            buy: +binance.find((x) => x.symbol === item.symbol + "USDT").askPrice * 1000,
            sell: +paribu.find((x) => x.symbol === item.symbol).highestBid * 1000,
            result: (+paribu.find((x) => x.symbol === item.symbol).highestBid * (1 - commissionWithBinance)) /
              +binance.find((x) => x.symbol === item.symbol + "USDT").askPrice,
          });
        } else {
          pairs.push({
            title: item.symbol + " - PARIBU",
            commission: commissionWithBinance,
            buy: +binance.find((x) => x.symbol === item.symbol + "USDT").askPrice,
            sell: +paribu.find((x) => x.symbol === item.symbol).highestBid,
            result: (+paribu.find((x) => x.symbol === item.symbol).highestBid * (1 - commissionWithBinance)) /
              +binance.find((x) => x.symbol === item.symbol + "USDT").askPrice,
          });
        }
      } catch (error) {
        console.log("error occured on getParibu: ", item.symbol, error);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function getGate(paribu, pairs) {
  for (const item of paribu) {
    try {
      let mySymbol = item.symbol;
      let gateResult = await gateTask(mySymbol);

      if (gateResult.length === 0 || gateResult[0].lowest_ask === null || gateResult[0].highest_bid === null) {
        continue;
      }

      if (mySymbol === "SHIB" || mySymbol === "PEPE" || mySymbol === "BTTC" || mySymbol === "PEPE" || mySymbol === "FLOKI" || mySymbol === "BONK") {
        pairs.push({
          title: mySymbol + " - GATEIO",
          commission: commissionWithGate,
          buy: +gateResult[0].lowest_ask * 1000,
          sell: +paribu.find((x) => x.symbol === mySymbol).highestBid * 1000,
          result: (+paribu.find((x) => x.symbol === mySymbol).highestBid * (1 - commissionWithGate)) / +gateResult[0].lowest_ask,
        });
      } else {
        pairs.push({
          title: mySymbol + " - GATEIO",
          commission: commissionWithGate,
          buy: +gateResult[0].lowest_ask,
          sell: +paribu.find((x) => x.symbol === mySymbol).highestBid,
          result: (+paribu.find((x) => x.symbol === mySymbol).highestBid * (1 - commissionWithGate)) / +gateResult[0].lowest_ask,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

async function getGateReverse(paribu, pairs) {
  for (const item of paribu) {
    try {
      let mySymbol = item.symbol;
      let gateResult = await gateTask(mySymbol);

      if (gateResult.length === 0 || gateResult[0].lowest_ask === null || gateResult[0].highest_bid === null) {
        continue;
      }

      if (mySymbol === "SHIB" || mySymbol === "PEPE" || mySymbol === "BTTC" || mySymbol === "PEPE" || mySymbol === "FLOKI" || mySymbol === "BONK") {
        pairs.push({
          title: mySymbol + " - GATEIO",
          commission: commissionWithGate,
          buy: +paribu.find((x) => x.symbol === mySymbol).lowestAsk * 1000,
          sell: +gateResult[0].highest_bid * 1000,
          result: (+gateResult[0].highest_bid * (1 - commissionWithGate)) / +paribu.find((x) => x.symbol === mySymbol).lowestAsk,
        });
      } else {
        pairs.push({
          title: mySymbol + " - GATEIO",
          commission: commissionWithGate,
          buy: +paribu.find((x) => x.symbol === mySymbol).lowestAsk,
          sell: +gateResult[0].highest_bid,
          result: (+gateResult[0].highest_bid * (1 - commissionWithGate)) / +paribu.find((x) => x.symbol === mySymbol).lowestAsk,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

app.get("/coinbase", async (req, res) => {
  try {
    const result = await getCoinbaseData();
    res.send(result);
  } catch (error) {
    console.log("error on /coinbase endpoint", error);
    res.send([]);
  }
});

async function getCoinbaseData() {
  let pairs = [];
  let binance = await binanceTask();
  let paribu = await paribuTask();
  let btcturk = await btcturkTask();
  await getParibu(paribu, binance, pairs);
  await getBtcturk(btcturk, binance, pairs);
  await getGate(paribu, pairs);
  return pairs;
}

app.get("/coinbaseReverse", async (req, res) => {
  try {
    const result = await getCoinbaseReverseData();
    res.send(result);
  } catch (error) {
    console.log("error on /coinbaseReverse endpoint", error);
    res.send([]);
  }
});

async function getCoinbaseReverseData() {
  let pairs = [];
  let paribu = await paribuTask();
  await getGateReverse(paribu, pairs);
  return pairs;
}

// async function checkForTextAndRingAlarm() {
//   try {
//     const response = await fetch("https://emagaza.darphane.gov.tr/altin-hatira-para");
//     const html = await response.text();

//     // Create a DOM from the HTML
//     const dom = new JSDOM(html);

//     // Access the document object
//     const doc = dom.window.document;

//     // Check if the specified text is found
//     if (doc.body.textContent.includes("Kayıt bulunamadı.")) {
//       console.log("Text found: Kayıt bulunamadı.");
//     } else {
//       // Text not found, call ringAlarm method
//       console.log("Text not found. Calling ringAlarm method.");
//       ringAlarm("DARPHANEYE MALLAR GELDI");
//     }
//   } catch (error) {
//     console.error("Error while fetching or parsing HTML:", error);
//   }
// }

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
