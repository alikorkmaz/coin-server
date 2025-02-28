const express = require("express");
const app = express();
const fetch = require("node-fetch");
const cron = require("node-cron");
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;

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

const baseUrl= 'http://ec2-15-228-240-175.sa-east-1.compute.amazonaws.com:3000';

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
  fetch(baseUrl + '/coinbase')
    .then(response => response.json())
    .then(data => {
      data.forEach((x) => {
        if (x.result > tetherKur + tetherKur * 0.03 && !alert.includes(x.title)) {
          ringAlarm(x.title);
        }
      });
    });

  fetch(baseUrl + '/coinbaseReverse')
    .then(response => response.json())
    .then(data => {
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

async function getGate(gate, paribu, pairs) {
  try {
    const item = gate[0];
    const symbol = item.currency_pair.replace("_USDT", "");
    const paribuItem = paribu.find((x) => x.symbol == symbol);
    pairs.push({
      title: symbol + " - GATE",
      commission: commissionWithGate,
      buy: +item.lowest_ask,
      sell: +paribuItem.highestBid,
      result: (paribuItem.highestBid * (1 - commissionWithGate)) / +item.lowest_ask,
    });
  } catch (error) {
    console.log("error occured on getGate", error);
  }
}

app.get("/coinbase", async (req, res) => {
  try {
    const [paribu, btcturk, binance, gateCeek, gateAtlas, gateFlr, gateRaca, gateBlur] = await Promise.all([
      paribuTask(),
      btcturkTask(),
      binanceTask(),
      gateTask("CEEK"),
      gateTask("ATLAS"),
      gateTask("FLR"),
      gateTask("RACA"),
      gateTask("BLUR"),
    ]);

    const pairs = [];
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
        .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result && pair.result)
        .sort((a, b) => b.result - a.result)
    );
  } catch (error) {
    console.error("Error in /coinbase route:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function getBtcturkReverse(btcturk, binance, pairs) {
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
              buy: +btcturk.find((x) => x.pair === mySymbol + "TRY").ask * 1000,
              sell: +binance.find((x) => x.symbol === mySymbol + "USDT").bidPrice * 1000,
              result: (+btcturk.find((x) => x.pair === mySymbol + "TRY").ask * (1 + commissionWithBinance)) /
                +binance.find((x) => x.symbol === mySymbol + "USDT").bidPrice,
            });
          } else if (mySymbol === "GAL") {
            //DO NOTHING
          } else {
            pairs.push({
              title: mySymbol + " - BTCTURK",
              commission: commissionWithBinance,
              buy: +btcturk.find((x) => x.pair === mySymbol + "TRY").ask,
              sell: +binance.find((x) => x.symbol === mySymbol + "USDT").bidPrice,
              result: (+btcturk.find((x) => x.pair === mySymbol + "TRY").ask * (1 + commissionWithBinance)) /
                +binance.find((x) => x.symbol === mySymbol + "USDT").bidPrice,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log("error occured on /coinbase", error);
  }
}

async function getParibuReverse(paribu, binance, pairs) {
  try {
    paribu.forEach((item) => {
      try {
        pairs.push({
          title: item.symbol + " - PARIBU",
          commission: commissionWithBinance,
          buy: +paribu.find((x) => x.symbol === item.symbol).lowestAsk,
          sell: +binance.find((x) => x.symbol === item.symbol + "USDT").bidPrice,
          result: (+paribu.find((x) => x.symbol === item.symbol).lowestAsk * (1 + commissionWithBinance)) /
            +binance.find((x) => x.symbol === item.symbol + "USDT").bidPrice,
        });
      } catch (error) {
        console.log("error occured on getParibuReverse", item.symbol, error);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function getGateReverse(gate, paribu, pairs) {
  try {
    const item = gate[0];
    const symbol = item.currency_pair.replace("_USDT", "");
    const paribuItem = paribu.find((x) => x.symbol == symbol);
    pairs.push({
      title: symbol + " - GATE",
      commission: commissionWithGate,
      buy: +paribuItem.lowestAsk,
      sell: +item.highest_bid,
      result: (paribuItem.lowestAsk * (1 + commissionWithGate)) / +item.highest_bid,
    });
  } catch (error) {
    console.log("error occured on getGateReverse", error);
  }
}

app.get("/coinbaseReverse", async (req, res) => {
  try {
    const [paribu, btcturk, binance, gateCeek, gateAtlas, gateFlr, gateRaca, gateBlur] = await Promise.all([
      paribuTask(),
      btcturkTask(),
      binanceTask(),
      gateTask("CEEK"),
      gateTask("ATLAS"),
      gateTask("FLR"),
      gateTask("RACA"),
      gateTask("BLUR"),
    ]);

    const pairs = [];
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
        .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result && pair.result)
        .sort((a, b) => a.result - b.result)
    );
  } catch (error) {
    console.error("Error in /coinbaseReverse route:", error);
    res.status(500).send("Internal Server Error");
  }
});

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

// // Call checkForTextAndRingAlarm every 10 seconds using setInterval
// setInterval(checkForTextAndRingAlarm, 10000); 

async function checkForAppointmentAndRingAlarm() {
  try {
    const response = await fetch("https://appointment.as-visa.com/Macaristan/TarihGetir", {
      method: "POST",
      headers: {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://appointment.as-visa.com",
        "Referer": "https://appointment.as-visa.com/tr/istanbul-bireysel-basvuru",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
      },
      body: "tabId=Portekiz+Bireysel+Randevu+(C)&countryid=T%C3%9CRK%C4%B0YE"
    });

    const data = await response.json();

    // Check if the response is not an empty array
    if (Array.isArray(data) && data.length === 0) {
      console.log("No appointments available.");
    } else {
      console.log("Appointments available. Calling ringAlarm method.");
      ringAlarm("APPOINTMENTS ARE AVAILABLE!");
    }
  } catch (error) {
    console.error("Error while fetching or parsing the response:", error);
    ringAlarm("Error while fetching APPOINTMENTS!");
  }
}

checkForAppointmentAndRingAlarm();
// Call checkForAppointmentAndRingAlarm every 30 mins using setInterval
setInterval(checkForAppointmentAndRingAlarm, 60000*3);

app.listen(process.env.PORT || 3000, () => console.log("listening.."));
