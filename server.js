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

app.get("/kraken", async (req, res) => {
  let pairs = [];
  let commission = 0.005;

  let kraken = await fetch(
    "https://api.kraken.com/0/public/Ticker?pair=xbteur,etheur,xrpeur,ltceur,xlmeur,bcheur,adaeur,eoseur,dasheur,etceur"
  ).then(r => r.json());

  let paribu = await fetch("https://paribu.com/ticker").then(r => r.json());

  let btcturk = await fetch("https://www.btcturk.com/api/ticker").then(r =>
    r.json()
  );

  let koineks = await fetch("https://koineks.com/ticker").then(r => r.json());

  pairs.push({
    title: "BTC - PARIBU",
    commission,
    buy: +kraken.result.XXBTZEUR.a[0],
    sell: +paribu.BTC_TL.highestBid,
    result:
      (+paribu.BTC_TL.highestBid * (1 - commission)) /
      kraken.result.XXBTZEUR.a[0]
  });
  pairs.push({
    title: "ETH - PARIBU",
    commission,
    buy: +kraken.result.XETHZEUR.a[0],
    sell: +paribu.ETH_TL.highestBid,
    result:
      (+paribu.ETH_TL.highestBid * (1 - commission)) /
      kraken.result.XETHZEUR.a[0]
  });
  pairs.push({
    title: "XRP - PARIBU",
    commission,
    buy: +kraken.result.XXRPZEUR.a[0],
    sell: +paribu.XRP_TL.highestBid,
    result:
      (+paribu.XRP_TL.highestBid * (1 - commission)) /
      kraken.result.XXRPZEUR.a[0]
  });
  pairs.push({
    title: "LTC - PARIBU",
    commission,
    buy: +kraken.result.XLTCZEUR.a[0],
    sell: +paribu.LTC_TL.highestBid,
    result:
      (+paribu.LTC_TL.highestBid * (1 - commission)) /
      kraken.result.XLTCZEUR.a[0]
  });
  pairs.push({
    title: "XLM - PARIBU",
    commission,
    buy: +kraken.result.XXLMZEUR.a[0],
    sell: +paribu.XLM_TL.highestBid,
    result:
      (+paribu.XLM_TL.highestBid * (1 - commission)) /
      kraken.result.XXLMZEUR.a[0]
  });
  pairs.push({
    title: "BCH - PARIBU",
    commission,
    buy: +kraken.result.BCHEUR.a[0],
    sell: +paribu.BCH_TL.highestBid,
    result:
      (+paribu.BCH_TL.highestBid * (1 - commission)) / kraken.result.BCHEUR.a[0]
  });
  pairs.push({
    title: "ADA - PARIBU",
    commission,
    buy: +kraken.result.ADAEUR.a[0],
    sell: +paribu.ADA_TL.highestBid,
    result:
      (+paribu.ADA_TL.highestBid * (1 - commission)) / kraken.result.ADAEUR.a[0]
  });
  pairs.push({
    title: "EOS - PARIBU",
    commission,
    buy: +kraken.result.EOSEUR.a[0],
    sell: +paribu.EOS_TL.highestBid,
    result:
      (+paribu.EOS_TL.highestBid * (1 - commission)) / kraken.result.EOSEUR.a[0]
  });

  pairs.push({
    title: "BTC - BTCTURK",
    commission,
    buy: +kraken.result.XXBTZEUR.a[0],
    sell: +btcturk.find(x => x.pair === "BTCTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "BTCTRY").bid * (1 - commission)) /
      kraken.result.XXBTZEUR.a[0]
  });
  pairs.push({
    title: "ETH - BTCTURK",
    commission,
    buy: +kraken.result.XETHZEUR.a[0],
    sell: +btcturk.find(x => x.pair === "ETHTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "ETHTRY").bid * (1 - commission)) /
      kraken.result.XETHZEUR.a[0]
  });
  pairs.push({
    title: "XRP - BTCTURK",
    commission,
    buy: +kraken.result.XXRPZEUR.a[0],
    sell: +btcturk.find(x => x.pair === "XRPTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "XRPTRY").bid * (1 - commission)) /
      kraken.result.XXRPZEUR.a[0]
  });
  pairs.push({
    title: "LTC - BTCTURK",
    commission,
    buy: +kraken.result.XLTCZEUR.a[0],
    sell: +btcturk.find(x => x.pair === "LTCTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "LTCTRY").bid * (1 - commission)) /
      kraken.result.XLTCZEUR.a[0]
  });
  pairs.push({
    title: "XLM - BTCTURK",
    commission,
    buy: +kraken.result.XXLMZEUR.a[0],
    sell: +btcturk.find(x => x.pair === "XLMTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "XLMTRY").bid * (1 - commission)) /
      kraken.result.XXLMZEUR.a[0]
  });

  pairs.push({
    title: "BTC - KOINEKS",
    commission,
    buy: +kraken.result.XXBTZEUR.a[0],
    sell: +koineks.BTC.bid,
    result: (+koineks.BTC.bid * (1 - commission)) / kraken.result.XXBTZEUR.a[0]
  });
  pairs.push({
    title: "ETH - KOINEKS",
    commission,
    buy: +kraken.result.XETHZEUR.a[0],
    sell: +koineks.ETH.bid,
    result: (+koineks.ETH.bid * (1 - commission)) / kraken.result.XETHZEUR.a[0]
  });
  pairs.push({
    title: "XRP - KOINEKS",
    commission,
    buy: +kraken.result.XXRPZEUR.a[0],
    sell: +koineks.XRP.bid,
    result: (+koineks.XRP.bid * (1 - commission)) / kraken.result.XXRPZEUR.a[0]
  });
  pairs.push({
    title: "LTC - KOINEKS",
    commission,
    buy: +kraken.result.XLTCZEUR.a[0],
    sell: +koineks.LTC.bid,
    result: (+koineks.LTC.bid * (1 - commission)) / kraken.result.XLTCZEUR.a[0]
  });
  pairs.push({
    title: "XLM - KOINEKS",
    commission,
    buy: +kraken.result.XXLMZEUR.a[0],
    sell: +koineks.XLM.bid,
    result: (+koineks.XLM.bid * (1 - commission)) / kraken.result.XXLMZEUR.a[0]
  });
  pairs.push({
    title: "BCH - KOINEKS",
    commission,
    buy: +kraken.result.BCHEUR.a[0],
    sell: +koineks.BCH.bid,
    result: (+koineks.BCH.bid * (1 - commission)) / kraken.result.BCHEUR.a[0]
  });
  pairs.push({
    title: "ADA - KOINEKS",
    commission,
    buy: +kraken.result.ADAEUR.a[0],
    sell: +koineks.ADA.bid,
    result: (+koineks.ADA.bid * (1 - commission)) / kraken.result.ADAEUR.a[0]
  });
  pairs.push({
    title: "EOS - KOINEKS",
    commission,
    buy: +kraken.result.EOSEUR.a[0],
    sell: +koineks.EOS.bid,
    result: (+koineks.EOS.bid * (1 - commission)) / kraken.result.EOSEUR.a[0]
  });
  pairs.push({
    title: "DASH - KOINEKS",
    commission,
    buy: +kraken.result.DASHEUR.a[0],
    sell: +koineks.DASH.bid,
    result: (+koineks.DASH.bid * (1 - commission)) / kraken.result.DASHEUR.a[0]
  });
  pairs.push({
    title: "ETC - KOINEKS",
    commission,
    buy: +kraken.result.XETCZEUR.a[0],
    sell: +koineks.ETC.bid,
    result: (+koineks.ETC.bid * (1 - commission)) / kraken.result.XETCZEUR.a[0]
  });

  res.send(pairs.sort((a, b) => b.result - a.result));
});

app.get("/coinbase", async (req, res) => {
  let pairs = [];
  let commission = 0.0065;

  let cbBtc = await fetch(
    "https://api.pro.coinbase.com/products/btc-usd/ticker"
  ).then(r => r.json());

  let cbEth = await fetch(
    "https://api.pro.coinbase.com/products/eth-usd/ticker"
  ).then(r => r.json());

  let cbXrp = await fetch(
    "https://api.pro.coinbase.com/products/xrp-usd/ticker"
  ).then(r => r.json());

  let cbLtc = await fetch(
    "https://api.pro.coinbase.com/products/ltc-usd/ticker"
  ).then(r => r.json());

  let cbXlm = await fetch(
    "https://api.pro.coinbase.com/products/xlm-usd/ticker"
  ).then(r => r.json());

  let cbBch = await fetch(
    "https://api.pro.coinbase.com/products/bch-usd/ticker"
  ).then(r => r.json());

  let cbEos = await fetch(
    "https://api.pro.coinbase.com/products/eos-usd/ticker"
  ).then(r => r.json());

  let cbEtc = await fetch(
    "https://api.pro.coinbase.com/products/etc-usd/ticker"
  ).then(r => r.json());

  let paribu = await fetch("https://paribu.com/ticker").then(r => r.json());

  let btcturk = await fetch("https://www.btcturk.com/api/ticker").then(r =>
    r.json()
  );

  let koineks = await fetch("https://koineks.com/ticker").then(r => r.json());

  pairs.push({
    title: "BTC - PARIBU",
    commission,
    buy: +cbBtc.ask,
    sell: +paribu.BTC_TL.highestBid,
    result: (+paribu.BTC_TL.highestBid * (1 - commission)) / +cbBtc.ask
  });
  pairs.push({
    title: "ETH - PARIBU",
    commission,
    buy: +cbEth.ask,
    sell: +paribu.ETH_TL.highestBid,
    result: (+paribu.ETH_TL.highestBid * (1 - commission)) / +cbEth.ask
  });
  pairs.push({
    title: "XRP - PARIBU",
    commission,
    buy: +cbXrp.ask,
    sell: +paribu.XRP_TL.highestBid,
    result: (+paribu.XRP_TL.highestBid * (1 - commission)) / +cbXrp.ask
  });
  pairs.push({
    title: "LTC - PARIBU",
    commission,
    buy: +cbLtc.ask,
    sell: +paribu.LTC_TL.highestBid,
    result: (+paribu.LTC_TL.highestBid * (1 - commission)) / +cbLtc.ask
  });
  pairs.push({
    title: "XLM - PARIBU",
    commission,
    buy: +cbXlm.ask,
    sell: +paribu.XLM_TL.highestBid,
    result: (+paribu.XLM_TL.highestBid * (1 - commission)) / +cbXlm.ask
  });
  pairs.push({
    title: "BCH - PARIBU",
    commission,
    buy: +cbBch.ask,
    sell: +paribu.BCH_TL.highestBid,
    result: (+paribu.BCH_TL.highestBid * (1 - commission)) / +cbBch.ask
  });
  pairs.push({
    title: "EOS - PARIBU",
    commission,
    buy: +cbEos.ask,
    sell: +paribu.EOS_TL.highestBid,
    result: (+paribu.EOS_TL.highestBid * (1 - commission)) / +cbEos.ask
  });

  pairs.push({
    title: "BTC - BTCTURK",
    commission,
    buy: +cbBtc.ask,
    sell: +btcturk.find(x => x.pair === "BTCTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "BTCTRY").bid * (1 - commission)) /
      +cbBtc.ask
  });
  pairs.push({
    title: "ETH - BTCTURK",
    commission,
    buy: +cbEth.ask,
    sell: +btcturk.find(x => x.pair === "ETHTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "ETHTRY").bid * (1 - commission)) /
      +cbEth.ask
  });
  pairs.push({
    title: "XRP - BTCTURK",
    commission,
    buy: +cbXrp.ask,
    sell: +btcturk.find(x => x.pair === "XRPTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "XRPTRY").bid * (1 - commission)) /
      +cbXrp.ask
  });
  pairs.push({
    title: "LTC - BTCTURK",
    commission,
    buy: +cbLtc.ask,
    sell: +btcturk.find(x => x.pair === "LTCTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "LTCTRY").bid * (1 - commission)) /
      +cbLtc.ask
  });
  pairs.push({
    title: "XLM - BTCTURK",
    commission,
    buy: +cbXlm.ask,
    sell: +btcturk.find(x => x.pair === "XLMTRY").bid,
    result:
      (+btcturk.find(x => x.pair === "XLMTRY").bid * (1 - commission)) /
      +cbXlm.ask
  });

  pairs.push({
    title: "BTC - KOINEKS",
    commission,
    buy: +cbBtc.ask,
    sell: +koineks.BTC.bid,
    result: (+koineks.BTC.bid * (1 - commission)) / +cbBtc.ask
  });
  pairs.push({
    title: "ETH - KOINEKS",
    commission,
    buy: +cbEth.ask,
    sell: +koineks.ETH.bid,
    result: (+koineks.ETH.bid * (1 - commission)) / +cbEth.ask
  });
  pairs.push({
    title: "XRP - KOINEKS",
    commission,
    buy: +cbXrp.ask,
    sell: +koineks.XRP.bid,
    result: (+koineks.XRP.bid * (1 - commission)) / +cbXrp.ask
  });
  pairs.push({
    title: "LTC - KOINEKS",
    commission,
    buy: +cbLtc.ask,
    sell: +koineks.LTC.bid,
    result: (+koineks.LTC.bid * (1 - commission)) / +cbLtc.ask
  });
  pairs.push({
    title: "XLM - KOINEKS",
    commission,
    buy: +cbXlm.ask,
    sell: +koineks.XLM.bid,
    result: (+koineks.XLM.bid * (1 - commission)) / +cbXlm.ask
  });
  pairs.push({
    title: "BCH - KOINEKS",
    commission,
    buy: +cbBch.ask,
    sell: +koineks.BCH.bid,
    result: (+koineks.BCH.bid * (1 - commission)) / +cbBch.ask
  });
  pairs.push({
    title: "EOS - KOINEKS",
    commission,
    buy: +cbEos.ask,
    sell: +koineks.EOS.bid,
    result: (+koineks.EOS.bid * (1 - commission)) / +cbEos.ask
  });
  pairs.push({
    title: "ETC - KOINEKS",
    commission,
    buy: +cbEtc.ask,
    sell: +koineks.ETC.bid,
    result: (+koineks.ETC.bid * (1 - commission)) / +cbEtc.ask
  });

  res.send(pairs.sort((a, b) => b.result - a.result));
});

app.get("/coinbase-cross", async (req, res) => {
  let pairs = [];
  let commission = 0.008;

  let cbBtc = await fetch(
    "https://api.pro.coinbase.com/products/btc-usd/ticker"
  ).then(r => r.json());

  let cbEth = await fetch(
    "https://api.pro.coinbase.com/products/eth-usd/ticker"
  ).then(r => r.json());

  let cbXrp = await fetch(
    "https://api.pro.coinbase.com/products/xrp-usd/ticker"
  ).then(r => r.json());

  let cbLtc = await fetch(
    "https://api.pro.coinbase.com/products/ltc-usd/ticker"
  ).then(r => r.json());

  let cbXlm = await fetch(
    "https://api.pro.coinbase.com/products/xlm-usd/ticker"
  ).then(r => r.json());

  let cbBch = await fetch(
    "https://api.pro.coinbase.com/products/bch-usd/ticker"
  ).then(r => r.json());

  let cbEos = await fetch(
    "https://api.pro.coinbase.com/products/eos-usd/ticker"
  ).then(r => r.json());

  let cbEtc = await fetch(
    "https://api.pro.coinbase.com/products/etc-usd/ticker"
  ).then(r => r.json());

  let paribu = await fetch("https://paribu.com/ticker").then(r => r.json());

  let btcturk = await fetch("https://www.btcturk.com/api/ticker").then(r =>
    r.json()
  );

  let koineks = await fetch("https://koineks.com/ticker").then(r => r.json());

  pairs.push({
    title: "BTC - PARIBU",
    group: 1,
    cb2p: +paribu.BTC_TL.highestBid / +cbBtc.ask,
    p2cb: +cbBtc.bid / +paribu.BTC_TL.lowestAsk
  });
  pairs.push({
    title: "ETH - PARIBU",
    group: 1,
    cb2p: +paribu.ETH_TL.highestBid / +cbEth.ask,
    p2cb: +cbEth.bid / +paribu.ETH_TL.lowestAsk
  });
  pairs.push({
    title: "XRP - PARIBU",
    group: 1,
    cb2p: +paribu.XRP_TL.highestBid / +cbXrp.ask,
    p2cb: +cbXrp.bid / +paribu.XRP_TL.lowestAsk
  });
  pairs.push({
    title: "LTC - PARIBU",
    group: 1,
    cb2p: +paribu.LTC_TL.highestBid / +cbLtc.ask,
    p2cb: +cbLtc.bid / +paribu.LTC_TL.lowestAsk
  });
  pairs.push({
    title: "XLM - PARIBU",
    group: 1,
    cb2p: +paribu.XLM_TL.highestBid / +cbXlm.ask,
    p2cb: +cbXlm.bid / +paribu.XLM_TL.lowestAsk
  });
  pairs.push({
    title: "EOS - PARIBU",
    group: 1,
    cb2p: +paribu.EOS_TL.highestBid / +cbEos.ask,
    p2cb: +cbEos.bid / +paribu.EOS_TL.lowestAsk
  });

  pairs.push({
    title: "BTC - BTCTURK",
    group: 2,
    cb2p: +btcturk.find(x => x.pair === "BTCTRY").bid / +cbBtc.ask,
    p2cb: +cbBtc.bid / +btcturk.find(x => x.pair === "BTCTRY").ask
  });
  pairs.push({
    title: "ETH - BTCTURK",
    group: 2,
    cb2p: +btcturk.find(x => x.pair === "ETHTRY").bid / +cbEth.ask,
    p2cb: +cbEth.bid / +btcturk.find(x => x.pair === "ETHTRY").ask
  });
  pairs.push({
    title: "XRP - BTCTURK",
    group: 2,
    cb2p: +btcturk.find(x => x.pair === "XRPTRY").bid / +cbXrp.ask,
    p2cb: +cbXrp.bid / +btcturk.find(x => x.pair === "XRPTRY").ask
  });
  pairs.push({
    title: "LTC - BTCTURK",
    group: 2,
    cb2p: +btcturk.find(x => x.pair === "LTCTRY").bid / +cbLtc.ask,
    p2cb: +cbLtc.bid / +btcturk.find(x => x.pair === "LTCTRY").ask
  });
  pairs.push({
    title: "XLM - BTCTURK",
    group: 2,
    cb2p: +btcturk.find(x => x.pair === "XLMTRY").bid / +cbXlm.ask,
    p2cb: +cbXlm.bid / +btcturk.find(x => x.pair === "XLMTRY").ask
  });

  pairs.push({
    title: "BTC - KOINEKS",
    group: 3,
    cb2p: +koineks.BTC.bid / +cbBtc.ask,
    p2cb: +cbBtc.bid / +koineks.BTC.ask
  });
  pairs.push({
    title: "ETH - KOINEKS",
    group: 3,
    cb2p: +koineks.ETH.bid / +cbEth.ask,
    p2cb: +cbEth.bid / +koineks.ETH.ask
  });
  pairs.push({
    title: "XRP - KOINEKS",
    group: 3,
    cb2p: +koineks.XRP.bid / +cbXrp.ask,
    p2cb: +cbXrp.bid / +koineks.XRP.ask
  });
  pairs.push({
    title: "LTC - KOINEKS",
    group: 3,
    cb2p: +koineks.LTC.bid / +cbLtc.ask,
    p2cb: +cbLtc.bid / +koineks.LTC.ask
  });

  pairs.push({
    title: "XLM - KOINEKS",
    group: 3,
    cb2p: +koineks.XLM.bid / +cbXlm.ask,
    p2cb: +cbXlm.bid / +koineks.XLM.ask
  });

  pairs.push({
    title: "EOS - KOINEKS",
    group: 3,
    cb2p: +koineks.EOS.bid / +cbEos.ask,
    p2cb: +cbEos.bid / +koineks.EOS.ask
  });

  result = [];
  pairs.map(pair1 => {
    pairs.map(pair2 => {
      result.push({
        getir: pair1.title,
        gotur: pair2.title,
        result:
          pair1.group === pair2.group
            ? (pair1.cb2p * pair2.p2cb * (1 - commission) * 1000).toFixed(2)
            : 0
      });
    });
  });
  res.send(result.sort((a, b) => b.result - a.result));
});

app.listen(process.env.PORT || 3001, () => console.log("listening"));
