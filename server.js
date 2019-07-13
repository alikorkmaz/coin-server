const express = require('express');
const app = express();
const fetch = require('node-fetch');

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static('public'));

app.use(express.json());

let alert = [];
let alertReverse = [];

app.post('/alert', (req, res) => {
  req.body.forEach(item => {
    alert.push(item);
  });
  alert = [...new Set(alert)];
});
app.post('/alert-delete', (req, res) => {
  req.body.forEach(item => {
    alert = alert.filter(itemInAlert => itemInAlert !== item);
  });
});
app.get('/alert', (req, res) => {
  res.send(alert);
});

app.post('/alert-reverse', (req, res) => {
  req.body.forEach(item => {
    alertReverse.push(item);
  });
  alertReverse = [...new Set(alertReverse)];
});
app.post('/alert-reverse-delete', (req, res) => {
  req.body.forEach(item => {
    alertReverse = alertReverse.filter(itemInAlert => itemInAlert !== item);
  });
});
app.get('/alert-reverse', (req, res) => {
  res.send(alertReverse);
});

let kur = 0;
setInterval(() => {
  fetch('http://data.fixer.io/api/latest?access_key=547f1508205c1568706666c56bc02f4e')
    .then(response => response.json())
    .then(data => {
      kur = data.rates.TRY / data.rates.USD;
      console.log(kur.toFixed(4));
    })
    .catch(x => {
      console.log(x);
    });
}, 3600000);

var Push = require('pushover-notifications');

var p = new Push({
  user: 'uvk1kkq9mi7zkrhs65wq1bj117s68m',
  token: 'a26qjmrach23epfar8zatfh7apcyfd',
});

let profitMargin = 0.1;
let profitMarginReverse = 0;
let text = '';
setInterval(() => {
  if (kur === 0) return;
  text = '';
  fetch('http://coin-serv.herokuapp.com/coinbase')
    .then(response => response.json())
    .then(data => {
      data.forEach(pair => {
        if (
          pair.result > kur + profitMargin &&
          text === '' &&
          alert.some(title => title === pair.title)
        ) {
          text = pair.title;

          p.send(
            {
              message: text,
            },
            function(err, result) {
              console.log(result);
            },
          );

          return;
        }
      });
    });
  fetch('http://coin-serv.herokuapp.com/coinbasereverse')
    .then(response => response.json())
    .then(data => {
      data.forEach(pair => {
        if (
          pair.result < kur - profitMarginReverse &&
          text === '' &&
          alertReverse.some(title => title === pair.title)
        ) {
          text = pair.title;
          p.send(
            {
              message: text,
            },
            function(err, result) {
              console.log(result);
            },
          );

          return;
        }
      });
    });
}, 300000);

setTimeout(() => {
  fetch('http://data.fixer.io/api/latest?access_key=547f1508205c1568706666c56bc02f4e')
    .then(response => response.json())
    .then(data => {
      kur = data.rates.TRY / data.rates.USD;
      console.log(kur.toFixed(4));
    })
    .catch(x => {
      console.log(x);
    });
}, 10000);

app.get('/', (req, res) => {
  res.send({});
});

app.get('/kur', (req, res) => {
  res.send({ kur: kur.toFixed(4) });
});

app.get('/koineks', (req, res) => {
  fetch('https://koineks.com/ticker')
    .then(response => response.json())
    .then(json => res.send(json));
});

app.get('/paribu', (req, res) => {
  fetch('https://paribu.com/ticker')
    .then(response => response.json())
    .then(json => res.send(json));
});

app.get('/btcturk', (req, res) => {
  fetch('https://www.btcturk.com/api/ticker')
    .then(response => response.json())
    .then(json => res.send(json))
    .catch(e => console.log(e));
});

app.get('/kraken', async (req, res) => {
  let pairs = [];
  let commission = 0.005;

  let kraken = await fetch(
    'https://api.kraken.com/0/public/Ticker?pair=xbteur,etheur,xrpeur,ltceur,xlmeur,adaeur,eoseur,dasheur',
  ).then(r => r.json());

  let paribu = await fetch('https://paribu.com/ticker').then(r => r.json());

  let btcturk = await fetch('https://www.btcturk.com/api/ticker').then(r => r.json());

  let koineks = await fetch('https://koineks.com/ticker').then(r => r.json());

  pairs.push({
    title: 'BTC - PARIBU',
    commission,
    buy: +kraken.result.XXBTZEUR.a[0],
    sell: +paribu.BTC_TL.highestBid,
    result: (+paribu.BTC_TL.highestBid * (1 - commission)) / kraken.result.XXBTZEUR.a[0],
  });
  pairs.push({
    title: 'ETH - PARIBU',
    commission,
    buy: +kraken.result.XETHZEUR.a[0],
    sell: +paribu.ETH_TL.highestBid,
    result: (+paribu.ETH_TL.highestBid * (1 - commission)) / kraken.result.XETHZEUR.a[0],
  });
  pairs.push({
    title: 'XRP - PARIBU',
    commission,
    buy: +kraken.result.XXRPZEUR.a[0],
    sell: +paribu.XRP_TL.highestBid,
    result: (+paribu.XRP_TL.highestBid * (1 - commission)) / kraken.result.XXRPZEUR.a[0],
  });
  pairs.push({
    title: 'LTC - PARIBU',
    commission,
    buy: +kraken.result.XLTCZEUR.a[0],
    sell: +paribu.LTC_TL.highestBid,
    result: (+paribu.LTC_TL.highestBid * (1 - commission)) / kraken.result.XLTCZEUR.a[0],
  });
  pairs.push({
    title: 'XLM - PARIBU',
    commission,
    buy: +kraken.result.XXLMZEUR.a[0],
    sell: +paribu.XLM_TL.highestBid,
    result: (+paribu.XLM_TL.highestBid * (1 - commission)) / kraken.result.XXLMZEUR.a[0],
  });
  pairs.push({
    title: 'ADA - PARIBU',
    commission,
    buy: +kraken.result.ADAEUR.a[0],
    sell: +paribu.ADA_TL.highestBid,
    result: (+paribu.ADA_TL.highestBid * (1 - commission)) / kraken.result.ADAEUR.a[0],
  });
  pairs.push({
    title: 'EOS - PARIBU',
    commission,
    buy: +kraken.result.EOSEUR.a[0],
    sell: +paribu.EOS_TL.highestBid,
    result: (+paribu.EOS_TL.highestBid * (1 - commission)) / kraken.result.EOSEUR.a[0],
  });

  pairs.push({
    title: 'BTC - BTCTURK',
    commission,
    buy: +kraken.result.XXBTZEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'BTCTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'BTCTRY').bid * (1 - commission)) /
      kraken.result.XXBTZEUR.a[0],
  });
  pairs.push({
    title: 'ETH - BTCTURK',
    commission,
    buy: +kraken.result.XETHZEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'ETHTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'ETHTRY').bid * (1 - commission)) /
      kraken.result.XETHZEUR.a[0],
  });
  pairs.push({
    title: 'XRP - BTCTURK',
    commission,
    buy: +kraken.result.XXRPZEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'XRPTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'XRPTRY').bid * (1 - commission)) /
      kraken.result.XXRPZEUR.a[0],
  });
  pairs.push({
    title: 'LTC - BTCTURK',
    commission,
    buy: +kraken.result.XLTCZEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'LTCTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'LTCTRY').bid * (1 - commission)) /
      kraken.result.XLTCZEUR.a[0],
  });
  pairs.push({
    title: 'XLM - BTCTURK',
    commission,
    buy: +kraken.result.XXLMZEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'XLMTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'XLMTRY').bid * (1 - commission)) /
      kraken.result.XXLMZEUR.a[0],
  });

  pairs.push({
    title: 'BTC - KOINEKS',
    commission,
    buy: +kraken.result.XXBTZEUR.a[0],
    sell: +koineks.BTC.bid,
    result: (+koineks.BTC.bid * (1 - commission)) / kraken.result.XXBTZEUR.a[0],
  });
  pairs.push({
    title: 'ETH - KOINEKS',
    commission,
    buy: +kraken.result.XETHZEUR.a[0],
    sell: +koineks.ETH.bid,
    result: (+koineks.ETH.bid * (1 - commission)) / kraken.result.XETHZEUR.a[0],
  });
  pairs.push({
    title: 'XRP - KOINEKS',
    commission,
    buy: +kraken.result.XXRPZEUR.a[0],
    sell: +koineks.XRP.bid,
    result: (+koineks.XRP.bid * (1 - commission)) / kraken.result.XXRPZEUR.a[0],
  });
  pairs.push({
    title: 'LTC - KOINEKS',
    commission,
    buy: +kraken.result.XLTCZEUR.a[0],
    sell: +koineks.LTC.bid,
    result: (+koineks.LTC.bid * (1 - commission)) / kraken.result.XLTCZEUR.a[0],
  });
  pairs.push({
    title: 'XLM - KOINEKS',
    commission,
    buy: +kraken.result.XXLMZEUR.a[0],
    sell: +koineks.XLM.bid,
    result: (+koineks.XLM.bid * (1 - commission)) / kraken.result.XXLMZEUR.a[0],
  });
  pairs.push({
    title: 'ADA - KOINEKS',
    commission,
    buy: +kraken.result.ADAEUR.a[0],
    sell: +koineks.ADA.bid,
    result: (+koineks.ADA.bid * (1 - commission)) / kraken.result.ADAEUR.a[0],
  });
  pairs.push({
    title: 'EOS - KOINEKS',
    commission,
    buy: +kraken.result.EOSEUR.a[0],
    sell: +koineks.EOS.bid,
    result: (+koineks.EOS.bid * (1 - commission)) / kraken.result.EOSEUR.a[0],
  });
  pairs.push({
    title: 'DASH - KOINEKS',
    commission,
    buy: +kraken.result.DASHEUR.a[0],
    sell: +koineks.DASH.bid,
    result: (+koineks.DASH.bid * (1 - commission)) / kraken.result.DASHEUR.a[0],
  });

  res.send(pairs.sort((a, b) => b.result - a.result));
});

app.get('/coinbase', async (req, res) => {
  let pairs = [];
  let commission = 0.0065;
  let commissionWithBinance = 0.0065;
  let commissionWithBinanceUSDT = 0.0055;

  let cbBtc = await fetch('https://api.pro.coinbase.com/products/btc-usd/ticker').then(r =>
    r.json(),
  );

  let cbEth = await fetch('https://api.pro.coinbase.com/products/eth-usd/ticker').then(r =>
    r.json(),
  );

  let cbXrp = await fetch('https://api.pro.coinbase.com/products/xrp-usd/ticker').then(r =>
    r.json(),
  );

  let cbLtc = await fetch('https://api.pro.coinbase.com/products/ltc-usd/ticker').then(r =>
    r.json(),
  );

  let cbXlm = await fetch('https://api.pro.coinbase.com/products/xlm-usd/ticker').then(r =>
    r.json(),
  );

  let cbEos = await fetch('https://api.pro.coinbase.com/products/eos-usd/ticker').then(r =>
    r.json(),
  );

  let cbBat = await fetch('https://api.pro.coinbase.com/products/bat-usdc/ticker').then(r =>
    r.json(),
  );

  let cbZec = await fetch('https://api.pro.coinbase.com/products/zec-usdc/ticker').then(r =>
    r.json(),
  );

  let cbZrx = await fetch('https://api.pro.coinbase.com/products/zrx-usd/ticker').then(r =>
    r.json(),
  );

  let binance = await fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json());

  let paribu = await fetch('https://paribu.com/ticker').then(r => r.json());

  let btcturk = await fetch('https://www.btcturk.com/api/ticker').then(r => r.json());

  let koineks = await fetch('https://koineks.com/ticker').then(r => r.json());

  // let vebitcoin = await fetch(
  //   'https://us-central1-vebitcoin-market.cloudfunctions.net/app/api/ticker',
  // ).then(r => r.json());

  pairs.push({
    title: 'BTC - PARIBU',
    commission,
    buy: +cbBtc.ask,
    sell: +paribu.BTC_TL.highestBid,
    result: (+paribu.BTC_TL.highestBid * (1 - commission)) / +cbBtc.ask,
  });
  pairs.push({
    title: 'ETH - PARIBU',
    commission,
    buy: +cbEth.ask,
    sell: +paribu.ETH_TL.highestBid,
    result: (+paribu.ETH_TL.highestBid * (1 - commission)) / +cbEth.ask,
  });
  pairs.push({
    title: 'XRP - PARIBU',
    commission,
    buy: +cbXrp.ask,
    sell: +paribu.XRP_TL.highestBid,
    result: (+paribu.XRP_TL.highestBid * (1 - commission)) / +cbXrp.ask,
  });
  pairs.push({
    title: 'LTC - PARIBU',
    commission,
    buy: +cbLtc.ask,
    sell: +paribu.LTC_TL.highestBid,
    result: (+paribu.LTC_TL.highestBid * (1 - commission)) / +cbLtc.ask,
  });
  pairs.push({
    title: 'XLM - PARIBU',
    commission,
    buy: +cbXlm.ask,
    sell: +paribu.XLM_TL.highestBid,
    result: (+paribu.XLM_TL.highestBid * (1 - commission)) / +cbXlm.ask,
  });
  pairs.push({
    title: 'EOS - PARIBU',
    commission,
    buy: +cbEos.ask,
    sell: +paribu.EOS_TL.highestBid,
    result: (+paribu.EOS_TL.highestBid * (1 - commission)) / +cbEos.ask,
  });
  pairs.push({
    title: 'BAT - PARIBU',
    commission,
    buy: +cbBat.ask,
    sell: +paribu.BAT_TL.highestBid,
    result: (+paribu.BAT_TL.highestBid * (1 - commission)) / +cbBat.ask,
  });
  pairs.push({
    title: 'BTT* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'BTTUSDT').askPrice,
    sell: +paribu.BTT_TL.highestBid,
    result:
      (+paribu.BTT_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BTTUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'TRX* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'TRXUSDT').askPrice,
    sell: +paribu.TRX_TL.highestBid,
    result:
      (+paribu.TRX_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'TRXUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'HOT* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'HOTUSDT').askPrice,
    sell: +paribu.HOT_TL.highestBid,
    result:
      (+paribu.HOT_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'HOTUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'ADA* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ADAUSDT').askPrice,
    sell: +paribu.ADA_TL.highestBid,
    result:
      (+paribu.ADA_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ADAUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'NEO* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'NEOUSDT').askPrice,
    sell: +paribu.NEO_TL.highestBid,
    result:
      (+paribu.NEO_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'NEOUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  if (paribu.LINK_TL)
    pairs.push({
      title: 'LINK* - PARIBU',
      commission: commissionWithBinance,
      buy: +binance.find(x => x.symbol === 'LINKUSDT').askPrice,
      sell: +paribu.LINK_TL.highestBid,
      result:
        (+paribu.LINK_TL.highestBid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'LINKUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
  if (paribu.RVN_TL)
    pairs.push({
      title: 'RVN* - PARIBU',
      commission: commissionWithBinance,
      buy: +binance.find(x => x.symbol === 'RVNBTC').askPrice,
      sell: +paribu.RVN_TL.highestBid,
      result:
        (+paribu.RVN_TL.highestBid * (1 - commissionWithBinance)) /
        ((binance.find(x => x.symbol === 'RVNBTC').askPrice *
          binance.find(x => x.symbol === 'BTCUSDT').askPrice) /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
  if (binance.some(x => x.symbol === 'DOGEUSDT'))
    pairs.push({
      title: 'DOGE* - PARIBU',
      commission: commissionWithBinance,
      buy: +binance.find(x => x.symbol === 'DOGEUSDT').askPrice,
      sell: +paribu.DOGE_TL.highestBid,
      result:
        (+paribu.DOGE_TL.highestBid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'DOGEUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
  pairs.push({
    title: 'USDT* - PARIBU',
    commission: commissionWithBinanceUSDT,
    buy: 1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice,
    sell: +paribu.USDT_TL.highestBid,
    result:
      (+paribu.USDT_TL.highestBid * (1 - commissionWithBinanceUSDT)) /
      (1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });

  pairs.push({
    title: 'BTC - BTCTURK',
    commission,
    buy: +cbBtc.ask,
    sell: +btcturk.find(x => x.pair === 'BTCTRY').bid,
    result: (+btcturk.find(x => x.pair === 'BTCTRY').bid * (1 - commission)) / +cbBtc.ask,
  });
  pairs.push({
    title: 'ETH - BTCTURK',
    commission,
    buy: +cbEth.ask,
    sell: +btcturk.find(x => x.pair === 'ETHTRY').bid,
    result: (+btcturk.find(x => x.pair === 'ETHTRY').bid * (1 - commission)) / +cbEth.ask,
  });
  pairs.push({
    title: 'XRP - BTCTURK',
    commission,
    buy: +cbXrp.ask,
    sell: +btcturk.find(x => x.pair === 'XRPTRY').bid,
    result: (+btcturk.find(x => x.pair === 'XRPTRY').bid * (1 - commission)) / +cbXrp.ask,
  });
  pairs.push({
    title: 'LTC - BTCTURK',
    commission,
    buy: +cbLtc.ask,
    sell: +btcturk.find(x => x.pair === 'LTCTRY').bid,
    result: (+btcturk.find(x => x.pair === 'LTCTRY').bid * (1 - commission)) / +cbLtc.ask,
  });
  pairs.push({
    title: 'XLM - BTCTURK',
    commission,
    buy: +cbXlm.ask,
    sell: +btcturk.find(x => x.pair === 'XLMTRY').bid,
    result: (+btcturk.find(x => x.pair === 'XLMTRY').bid * (1 - commission)) / +cbXlm.ask,
  });
  pairs.push({
    title: 'USDT* - BTCTURK',
    commission: commissionWithBinanceUSDT,
    buy: 1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice,
    sell: +btcturk.find(x => x.pair === 'USDTTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'USDTTRY').bid * (1 - commissionWithBinanceUSDT)) /
      (1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });

  pairs.push({
    title: 'BTC - KOINEKS',
    commission,
    buy: +cbBtc.ask,
    sell: +koineks.BTC.bid,
    result: (+koineks.BTC.bid * (1 - commission)) / +cbBtc.ask,
  });
  pairs.push({
    title: 'ETH - KOINEKS',
    commission,
    buy: +cbEth.ask,
    sell: +koineks.ETH.bid,
    result: (+koineks.ETH.bid * (1 - commission)) / +cbEth.ask,
  });
  pairs.push({
    title: 'XRP - KOINEKS',
    commission,
    buy: +cbXrp.ask,
    sell: +koineks.XRP.bid,
    result: (+koineks.XRP.bid * (1 - commission)) / +cbXrp.ask,
  });
  pairs.push({
    title: 'LTC - KOINEKS',
    commission,
    buy: +cbLtc.ask,
    sell: +koineks.LTC.bid,
    result: (+koineks.LTC.bid * (1 - commission)) / +cbLtc.ask,
  });
  pairs.push({
    title: 'XLM - KOINEKS',
    commission,
    buy: +cbXlm.ask,
    sell: +koineks.XLM.bid,
    result: (+koineks.XLM.bid * (1 - commission)) / +cbXlm.ask,
  });
  pairs.push({
    title: 'EOS - KOINEKS',
    commission,
    buy: +cbEos.ask,
    sell: +koineks.EOS.bid,
    result: (+koineks.EOS.bid * (1 - commission)) / +cbEos.ask,
  });
  pairs.push({
    title: 'BTT* - KOINEKS',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'BTTUSDT').askPrice,
    sell: +koineks.BTT.bid,
    result:
      (+koineks.BTT.bid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BTTUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'TRX* - KOINEKS',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'TRXUSDT').askPrice,
    sell: +koineks.TRX.bid,
    result:
      (+koineks.TRX.bid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'TRXUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'ADA* - KOINEKS',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ADAUSDT').askPrice,
    sell: +koineks.ADA.bid,
    result:
      (+koineks.ADA.bid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ADAUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'DASH* - KOINEKS',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'DASHUSDT').askPrice,
    sell: +koineks.DASH.bid,
    result:
      (+koineks.DASH.bid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'DASHUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  if (koineks.XMR)
    pairs.push({
      title: 'XMR* - KOINEKS',
      commission: commissionWithBinance,
      buy: +binance.find(x => x.symbol === 'XMRUSDT').askPrice,
      sell: +koineks.XMR.bid,
      result:
        (+koineks.XMR.bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'XMRUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
  if (binance.some(x => x.symbol === 'DOGEUSDT'))
    pairs.push({
      title: 'DOGE* - KOINEKS',
      commission: commissionWithBinance,
      buy: +binance.find(x => x.symbol === 'DOGEUSDT').askPrice,
      sell: +koineks.DOGE.bid,
      result:
        (+koineks.DOGE.bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'DOGEUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
  pairs.push({
    title: 'USDT* - KOINEKS',
    commission: commissionWithBinanceUSDT,
    buy: 1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice,
    sell: +koineks.USDT.bid,
    result:
      (+koineks.USDT.bid * (1 - commissionWithBinanceUSDT)) /
      (1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });

  // pairs.push({
  //   title: 'BTC - VEBITCOIN',
  //   commission,
  //   buy: +cbBtc.ask,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'BTC').Bid,
  //   result: (+vebitcoin.find(x => x.SourceCoinCode === 'BTC').Bid * (1 - commission)) / +cbBtc.ask,
  // });
  // pairs.push({
  //   title: 'ETH - VEBITCOIN',
  //   commission,
  //   buy: +cbEth.ask,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'ETH').Bid,
  //   result: (+vebitcoin.find(x => x.SourceCoinCode === 'ETH').Bid * (1 - commission)) / +cbEth.ask,
  // });
  // pairs.push({
  //   title: 'XRP - VEBITCOIN',
  //   commission,
  //   buy: +cbXrp.ask,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'XRP').Bid,
  //   result: (+vebitcoin.find(x => x.SourceCoinCode === 'XRP').Bid * (1 - commission)) / +cbXrp.ask,
  // });
  // pairs.push({
  //   title: 'XLM - VEBITCOIN',
  //   commission,
  //   buy: +cbXlm.ask,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'XLM').Bid,
  //   result: (+vebitcoin.find(x => x.SourceCoinCode === 'XLM').Bid * (1 - commission)) / +cbXlm.ask,
  // });
  // pairs.push({
  //   title: 'LTC - VEBITCOIN',
  //   commission,
  //   buy: +cbLtc.ask,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'LTC').Bid,
  //   result: (+vebitcoin.find(x => x.SourceCoinCode === 'LTC').Bid * (1 - commission)) / +cbLtc.ask,
  // });
  // pairs.push({
  //   title: 'ZEC - VEBITCOIN',
  //   commission,
  //   buy: +cbZec.ask,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'ZEC').Bid,
  //   result: (+vebitcoin.find(x => x.SourceCoinCode === 'ZEC').Bid * (1 - commission)) / +cbZec.ask,
  // });
  // pairs.push({
  //   title: 'ZRX - VEBITCOIN',
  //   commission,
  //   buy: +cbZrx.ask,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'ZRX').Bid,
  //   result: (+vebitcoin.find(x => x.SourceCoinCode === 'ZRX').Bid * (1 - commission)) / +cbZrx.ask,
  // });
  // pairs.push({
  //   title: 'BAT - VEBITCOIN',
  //   commission,
  //   buy: +cbBat.ask,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'BAT').Bid,
  //   result: (+vebitcoin.find(x => x.SourceCoinCode === 'BAT').Bid * (1 - commission)) / +cbBat.ask,
  // });
  // pairs.push({
  //   title: 'HOT* - VEBITCOIN',
  //   commissionWithBinance,
  //   buy: +binance.find(x => x.symbol === 'HOTUSDT').askPrice,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'HOT').Bid,
  //   result:
  //     (+vebitcoin.find(x => x.SourceCoinCode === 'HOT').Bid * (1 - commissionWithBinance)) /
  //     (+binance.find(x => x.symbol === 'HOTUSDT').askPrice /
  //       +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  // });
  // pairs.push({
  //   title: 'DASH* - VEBITCOIN',
  //   commissionWithBinance,
  //   buy: +binance.find(x => x.symbol === 'DASHUSDT').askPrice,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'DASH').Bid,
  //   result:
  //     (+vebitcoin.find(x => x.SourceCoinCode === 'DASH').Bid * (1 - commissionWithBinance)) /
  //     (+binance.find(x => x.symbol === 'DASHUSDT').askPrice /
  //       +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  // });
  // pairs.push({
  //   title: 'OMG* - VEBITCOIN',
  //   commissionWithBinance,
  //   buy: +binance.find(x => x.symbol === 'OMGUSDT').askPrice,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'OMG').Bid,
  //   result:
  //     (+vebitcoin.find(x => x.SourceCoinCode === 'OMG').Bid * (1 - commissionWithBinance)) /
  //     (+binance.find(x => x.symbol === 'OMGUSDT').askPrice /
  //       +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  // });
  // pairs.push({
  //   title: 'TUSD* - VEBITCOIN',
  //   commissionWithBinance,
  //   buy: +binance.find(x => x.symbol === 'TUSDUSDT').askPrice,
  //   sell: +vebitcoin.find(x => x.SourceCoinCode === 'TUSD').Bid,
  //   result:
  //     (+vebitcoin.find(x => x.SourceCoinCode === 'TUSD').Bid * (1 - commissionWithBinance)) /
  //     (+binance.find(x => x.symbol === 'TUSDUSDT').askPrice /
  //       +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  // });

  res.send(pairs.sort((a, b) => b.result - a.result));
});

app.get('/coinbasecross', async (req, res) => {
  let pairs = [];
  let commission = 0.008;

  let cbBtc = await fetch('https://api.pro.coinbase.com/products/btc-usd/ticker').then(r =>
    r.json(),
  );

  let cbEth = await fetch('https://api.pro.coinbase.com/products/eth-usd/ticker').then(r =>
    r.json(),
  );

  let cbXrp = await fetch('https://api.pro.coinbase.com/products/xrp-usd/ticker').then(r =>
    r.json(),
  );

  let cbLtc = await fetch('https://api.pro.coinbase.com/products/ltc-usd/ticker').then(r =>
    r.json(),
  );

  let cbXlm = await fetch('https://api.pro.coinbase.com/products/xlm-usd/ticker').then(r =>
    r.json(),
  );

  let cbEos = await fetch('https://api.pro.coinbase.com/products/eos-usd/ticker').then(r =>
    r.json(),
  );

  let paribu = await fetch('https://paribu.com/ticker').then(r => r.json());

  let btcturk = await fetch('https://www.btcturk.com/api/ticker').then(r => r.json());

  let koineks = await fetch('https://koineks.com/ticker').then(r => r.json());

  pairs.push({
    title: 'BTC - PARIBU',
    group: 1,
    cb2p: +paribu.BTC_TL.highestBid / +cbBtc.ask,
    p2cb: +cbBtc.bid / +paribu.BTC_TL.lowestAsk,
  });
  pairs.push({
    title: 'ETH - PARIBU',
    group: 1,
    cb2p: +paribu.ETH_TL.highestBid / +cbEth.ask,
    p2cb: +cbEth.bid / +paribu.ETH_TL.lowestAsk,
  });
  pairs.push({
    title: 'XRP - PARIBU',
    group: 1,
    cb2p: +paribu.XRP_TL.highestBid / +cbXrp.ask,
    p2cb: +cbXrp.bid / +paribu.XRP_TL.lowestAsk,
  });
  pairs.push({
    title: 'LTC - PARIBU',
    group: 1,
    cb2p: +paribu.LTC_TL.highestBid / +cbLtc.ask,
    p2cb: +cbLtc.bid / +paribu.LTC_TL.lowestAsk,
  });
  pairs.push({
    title: 'XLM - PARIBU',
    group: 1,
    cb2p: +paribu.XLM_TL.highestBid / +cbXlm.ask,
    p2cb: +cbXlm.bid / +paribu.XLM_TL.lowestAsk,
  });
  pairs.push({
    title: 'EOS - PARIBU',
    group: 1,
    cb2p: +paribu.EOS_TL.highestBid / +cbEos.ask,
    p2cb: +cbEos.bid / +paribu.EOS_TL.lowestAsk,
  });

  pairs.push({
    title: 'BTC - BTCTURK',
    group: 2,
    cb2p: +btcturk.find(x => x.pair === 'BTCTRY').bid / +cbBtc.ask,
    p2cb: +cbBtc.bid / +btcturk.find(x => x.pair === 'BTCTRY').ask,
  });
  pairs.push({
    title: 'ETH - BTCTURK',
    group: 2,
    cb2p: +btcturk.find(x => x.pair === 'ETHTRY').bid / +cbEth.ask,
    p2cb: +cbEth.bid / +btcturk.find(x => x.pair === 'ETHTRY').ask,
  });
  pairs.push({
    title: 'XRP - BTCTURK',
    group: 2,
    cb2p: +btcturk.find(x => x.pair === 'XRPTRY').bid / +cbXrp.ask,
    p2cb: +cbXrp.bid / +btcturk.find(x => x.pair === 'XRPTRY').ask,
  });
  pairs.push({
    title: 'LTC - BTCTURK',
    group: 2,
    cb2p: +btcturk.find(x => x.pair === 'LTCTRY').bid / +cbLtc.ask,
    p2cb: +cbLtc.bid / +btcturk.find(x => x.pair === 'LTCTRY').ask,
  });
  pairs.push({
    title: 'XLM - BTCTURK',
    group: 2,
    cb2p: +btcturk.find(x => x.pair === 'XLMTRY').bid / +cbXlm.ask,
    p2cb: +cbXlm.bid / +btcturk.find(x => x.pair === 'XLMTRY').ask,
  });

  pairs.push({
    title: 'BTC - KOINEKS',
    group: 3,
    cb2p: +koineks.BTC.bid / +cbBtc.ask,
    p2cb: +cbBtc.bid / +koineks.BTC.ask,
  });
  pairs.push({
    title: 'ETH - KOINEKS',
    group: 3,
    cb2p: +koineks.ETH.bid / +cbEth.ask,
    p2cb: +cbEth.bid / +koineks.ETH.ask,
  });
  pairs.push({
    title: 'XRP - KOINEKS',
    group: 3,
    cb2p: +koineks.XRP.bid / +cbXrp.ask,
    p2cb: +cbXrp.bid / +koineks.XRP.ask,
  });
  pairs.push({
    title: 'LTC - KOINEKS',
    group: 3,
    cb2p: +koineks.LTC.bid / +cbLtc.ask,
    p2cb: +cbLtc.bid / +koineks.LTC.ask,
  });

  pairs.push({
    title: 'XLM - KOINEKS',
    group: 3,
    cb2p: +koineks.XLM.bid / +cbXlm.ask,
    p2cb: +cbXlm.bid / +koineks.XLM.ask,
  });

  pairs.push({
    title: 'EOS - KOINEKS',
    group: 3,
    cb2p: +koineks.EOS.bid / +cbEos.ask,
    p2cb: +cbEos.bid / +koineks.EOS.ask,
  });

  result = [];
  pairs.map(pair1 => {
    pairs.map(pair2 => {
      result.push({
        bring: pair1.title,
        take: pair2.title,
        result:
          pair1.group === pair2.group
            ? (pair1.cb2p * pair2.p2cb * (1 - commission) * 1000).toFixed(2)
            : 0,
      });
    });
  });
  res.send(result.sort((a, b) => b.result - a.result));
});

app.get('/coinbasereverse', async (req, res) => {
  let pairs = [];
  let commission = 0.004;
  let commissionWithBinance = 0.004;
  let commissionWithBinanceUSDT = 0.003;

  let cbBtc = await fetch('https://api.pro.coinbase.com/products/btc-usd/ticker').then(r =>
    r.json(),
  );

  let cbEth = await fetch('https://api.pro.coinbase.com/products/eth-usd/ticker').then(r =>
    r.json(),
  );

  let cbXrp = await fetch('https://api.pro.coinbase.com/products/xrp-usd/ticker').then(r =>
    r.json(),
  );

  let cbLtc = await fetch('https://api.pro.coinbase.com/products/ltc-usd/ticker').then(r =>
    r.json(),
  );

  let cbXlm = await fetch('https://api.pro.coinbase.com/products/xlm-usd/ticker').then(r =>
    r.json(),
  );

  let cbEos = await fetch('https://api.pro.coinbase.com/products/eos-usd/ticker').then(r =>
    r.json(),
  );

  let cbBat = await fetch('https://api.pro.coinbase.com/products/bat-usdc/ticker').then(r =>
    r.json(),
  );

  let binance = await fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json());

  let paribu = await fetch('https://paribu.com/ticker').then(r => r.json());

  let btcturk = await fetch('https://www.btcturk.com/api/ticker').then(r => r.json());

  let koineks = await fetch('https://koineks.com/ticker').then(r => r.json());

  pairs.push({
    title: 'BTC - PARIBU',
    commission,
    sell: +cbBtc.bid,
    buy: +paribu.BTC_TL.lowestAsk,
    result: (+paribu.BTC_TL.lowestAsk * (1 + commission)) / +cbBtc.bid,
  });
  pairs.push({
    title: 'ETH - PARIBU',
    commission,
    sell: +cbEth.bid,
    buy: +paribu.ETH_TL.lowestAsk,
    result: (+paribu.ETH_TL.lowestAsk * (1 + commission)) / +cbEth.bid,
  });
  pairs.push({
    title: 'XRP - PARIBU',
    commission,
    sell: +cbXrp.bid,
    buy: +paribu.XRP_TL.lowestAsk,
    result: (+paribu.XRP_TL.lowestAsk * (1 + commission)) / +cbXrp.bid,
  });
  pairs.push({
    title: 'LTC - PARIBU',
    commission,
    sell: +cbLtc.bid,
    buy: +paribu.LTC_TL.lowestAsk,
    result: (+paribu.LTC_TL.lowestAsk * (1 + commission)) / +cbLtc.bid,
  });
  pairs.push({
    title: 'XLM - PARIBU',
    commission,
    sell: +cbXlm.bid,
    buy: +paribu.XLM_TL.lowestAsk,
    result: (+paribu.XLM_TL.lowestAsk * (1 + commission)) / +cbXlm.bid,
  });
  pairs.push({
    title: 'EOS - PARIBU',
    commission,
    sell: +cbEos.bid,
    buy: +paribu.EOS_TL.lowestAsk,
    result: (+paribu.EOS_TL.lowestAsk * (1 + commission)) / +cbEos.bid,
  });
  pairs.push({
    title: 'BAT - PARIBU',
    commission,
    sell: +cbBat.bid,
    buy: +paribu.BAT_TL.lowestAsk,
    result: (+paribu.BAT_TL.lowestAsk * (1 + commission)) / +cbBat.bid,
  });
  pairs.push({
    title: 'BTT* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'BTTUSDT').bidPrice,
    buy: +paribu.BTT_TL.lowestAsk,
    result:
      (+paribu.BTT_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BTTUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'TRX* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'TRXUSDT').bidPrice,
    buy: +paribu.TRX_TL.lowestAsk,
    result:
      (+paribu.TRX_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'TRXUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'HOT* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'HOTUSDT').bidPrice,
    buy: +paribu.HOT_TL.lowestAsk,
    result:
      (+paribu.HOT_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'HOTUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'ADA* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ADAUSDT').bidPrice,
    buy: +paribu.ADA_TL.lowestAsk,
    result:
      (+paribu.ADA_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ADAUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'NEO* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'NEOUSDT').bidPrice,
    buy: +paribu.NEO_TL.lowestAsk,
    result:
      (+paribu.NEO_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'NEOUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'LINK* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'LINKUSDT').bidPrice,
    buy: +paribu.LINK_TL.lowestAsk,
    result:
      (+paribu.LINK_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'LINKUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  if (binance.some(x => x.symbol === 'DOGEUSDT'))
    pairs.push({
      title: 'DOGE* - PARIBU',
      commission: commissionWithBinance,
      sell: +binance.find(x => x.symbol === 'DOGEUSDT').bidPrice,
      buy: +paribu.DOGE_TL.lowestAsk,
      result:
        (+paribu.DOGE_TL.lowestAsk * (1 + commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'DOGEUSDT').bidPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });
  if (paribu.RVN_TL)
    pairs.push({
      title: 'RVN* - PARIBU',
      commission: commissionWithBinance,
      sell: +binance.find(x => x.symbol === 'RVNBTC').bidPrice,
      buy: +paribu.RVN_TL.lowestAsk,
      result:
        (+paribu.RVN_TL.lowestAsk * (1 + commissionWithBinance)) /
        ((binance.find(x => x.symbol === 'RVNBTC').bidPrice *
          binance.find(x => x.symbol === 'BTCUSDT').bidPrice) /
          +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });
  pairs.push({
    title: 'USDT* - PARIBU',
    commission: commissionWithBinanceUSDT,
    sell: 1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice,
    buy: +paribu.USDT_TL.lowestAsk,
    result:
      (+paribu.USDT_TL.lowestAsk * (1 + commissionWithBinanceUSDT)) /
      (1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });

  pairs.push({
    title: 'BTC - BTCTURK',
    commission,
    sell: +cbBtc.bid,
    buy: +btcturk.find(x => x.pair === 'BTCTRY').ask,
    result: (+btcturk.find(x => x.pair === 'BTCTRY').ask * (1 + commission)) / +cbBtc.bid,
  });
  pairs.push({
    title: 'ETH - BTCTURK',
    commission,
    sell: +cbEth.bid,
    buy: +btcturk.find(x => x.pair === 'ETHTRY').ask,
    result: (+btcturk.find(x => x.pair === 'ETHTRY').ask * (1 + commission)) / +cbEth.bid,
  });
  pairs.push({
    title: 'XRP - BTCTURK',
    commission,
    sell: +cbXrp.bid,
    buy: +btcturk.find(x => x.pair === 'XRPTRY').ask,
    result: (+btcturk.find(x => x.pair === 'XRPTRY').ask * (1 + commission)) / +cbXrp.bid,
  });
  pairs.push({
    title: 'LTC - BTCTURK',
    commission,
    sell: +cbLtc.bid,
    buy: +btcturk.find(x => x.pair === 'LTCTRY').ask,
    result: (+btcturk.find(x => x.pair === 'LTCTRY').ask * (1 + commission)) / +cbLtc.bid,
  });
  pairs.push({
    title: 'XLM - BTCTURK',
    commission,
    sell: +cbXlm.bid,
    buy: +btcturk.find(x => x.pair === 'XLMTRY').ask,
    result: (+btcturk.find(x => x.pair === 'XLMTRY').ask * (1 + commission)) / +cbXlm.bid,
  });
  pairs.push({
    title: 'USDT* - BTCTURK',
    commission: commissionWithBinanceUSDT,
    sell: 1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice,
    buy: +btcturk.find(x => x.pair === 'USDTTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'USDTTRY').ask * (1 + commissionWithBinanceUSDT)) /
      (1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });

  pairs.push({
    title: 'BTC - KOINEKS',
    commission,
    sell: +cbBtc.bid,
    buy: +koineks.BTC.ask,
    result: (+koineks.BTC.ask * (1 + commission)) / +cbBtc.bid,
  });
  pairs.push({
    title: 'ETH - KOINEKS',
    commission,
    sell: +cbEth.bid,
    buy: +koineks.ETH.ask,
    result: (+koineks.ETH.ask * (1 + commission)) / +cbEth.bid,
  });
  pairs.push({
    title: 'XRP - KOINEKS',
    commission,
    sell: +cbXrp.bid,
    buy: +koineks.XRP.ask,
    result: (+koineks.XRP.ask * (1 + commission)) / +cbXrp.bid,
  });
  pairs.push({
    title: 'LTC - KOINEKS',
    commission,
    sell: +cbLtc.bid,
    buy: +koineks.LTC.ask,
    result: (+koineks.LTC.ask * (1 + commission)) / +cbLtc.bid,
  });
  pairs.push({
    title: 'XLM - KOINEKS',
    commission,
    sell: +cbXlm.bid,
    buy: +koineks.XLM.ask,
    result: (+koineks.XLM.ask * (1 + commission)) / +cbXlm.bid,
  });
  pairs.push({
    title: 'EOS - KOINEKS',
    commission,
    sell: +cbEos.bid,
    buy: +koineks.EOS.ask,
    result: (+koineks.EOS.ask * (1 + commission)) / +cbEos.bid,
  });
  pairs.push({
    title: 'BTT* - KOINEKS',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'BTTUSDT').bidPrice,
    buy: +koineks.BTT.ask,
    result:
      (+koineks.BTT.ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BTTUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'TRX* - KOINEKS',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'TRXUSDT').bidPrice,
    buy: +koineks.TRX.ask,
    result:
      (+koineks.TRX.ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'TRXUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'ADA* - KOINEKS',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ADAUSDT').bidPrice,
    buy: +koineks.ADA.ask,
    result:
      (+koineks.ADA.ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ADAUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'DASH* - KOINEKS',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'DASHUSDT').bidPrice,
    buy: +koineks.DASH.ask,
    result:
      (+koineks.DASH.ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'DASHUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  if (koineks.XMR)
    pairs.push({
      title: 'XMR* - KOINEKS',
      commission: commissionWithBinance,
      sell: +binance.find(x => x.symbol === 'XMRUSDT').bidPrice,
      buy: +koineks.XMR.ask,
      result:
        (+koineks.XMR.ask * (1 + commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'XMRUSDT').bidPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });
  if (binance.some(x => x.symbol === 'DOGEUSDT'))
    pairs.push({
      title: 'DOGE* - KOINEKS',
      commission: commissionWithBinance,
      sell: +binance.find(x => x.symbol === 'DOGEUSDT').bidPrice,
      buy: +koineks.DOGE.ask,
      result:
        (+koineks.DOGE.ask * (1 + commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'DOGEUSDT').bidPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });

  pairs.push({
    title: 'USDT* - KOINEKS',
    commission: commissionWithBinanceUSDT,
    sell: 1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice,
    buy: +koineks.USDT.ask,
    result:
      (+koineks.USDT.ask * (1 + commissionWithBinanceUSDT)) /
      (1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });

  res.send(pairs.sort((a, b) => a.result - b.result));
});

app.get('/kraken2coinbase', async (req, res) => {
  let pairs = [];
  let commission = 0.004;

  let cbBtc = await fetch('https://api.pro.coinbase.com/products/btc-usd/ticker').then(r =>
    r.json(),
  );

  let cbEth = await fetch('https://api.pro.coinbase.com/products/eth-usd/ticker').then(r =>
    r.json(),
  );

  let cbXrp = await fetch('https://api.pro.coinbase.com/products/xrp-usd/ticker').then(r =>
    r.json(),
  );

  let cbLtc = await fetch('https://api.pro.coinbase.com/products/ltc-usd/ticker').then(r =>
    r.json(),
  );

  let cbXlm = await fetch('https://api.pro.coinbase.com/products/xlm-usd/ticker').then(r =>
    r.json(),
  );

  let cbEos = await fetch('https://api.pro.coinbase.com/products/eos-usd/ticker').then(r =>
    r.json(),
  );

  let cbRep = await fetch('https://api.pro.coinbase.com/products/rep-usd/ticker').then(r =>
    r.json(),
  );

  let cbZec = await fetch('https://api.pro.coinbase.com/products/zec-usdc/ticker').then(r =>
    r.json(),
  );

  let kraken = await fetch(
    'https://api.kraken.com/0/public/Ticker?pair=xbteur,etheur,xrpeur,ltceur,xlmeur,adaeur,eoseur,dasheur,repeur,zeceur',
  ).then(r => r.json());

  pairs.push({
    title: 'BTC',
    commission,
    sell: +cbBtc.bid,
    buy: +kraken.result.XXBTZEUR.a[0],
    result: 1 / ((+kraken.result.XXBTZEUR.a[0] * (1 + commission)) / +cbBtc.bid),
  });
  pairs.push({
    title: 'ETH',
    commission,
    sell: +cbEth.bid,
    buy: +kraken.result.XETHZEUR.a[0],
    result: 1 / ((+kraken.result.XETHZEUR.a[0] * (1 + commission)) / +cbEth.bid),
  });
  pairs.push({
    title: 'LTC',
    commission,
    sell: +cbLtc.bid,
    buy: +kraken.result.XLTCZEUR.a[0],
    result: 1 / ((+kraken.result.XLTCZEUR.a[0] * (1 + commission)) / +cbLtc.bid),
  });
  pairs.push({
    title: 'XRP',
    commission,
    sell: +cbXrp.bid,
    buy: +kraken.result.XXRPZEUR.a[0],
    result: 1 / ((+kraken.result.XXRPZEUR.a[0] * (1 + commission)) / +cbXrp.bid),
  });
  pairs.push({
    title: 'XLM',
    commission,
    sell: +cbXlm.bid,
    buy: +kraken.result.XXLMZEUR.a[0],
    result: 1 / ((+kraken.result.XXLMZEUR.a[0] * (1 + commission)) / +cbXlm.bid),
  });
  pairs.push({
    title: 'EOS',
    commission,
    sell: +cbEos.bid,
    buy: +kraken.result.EOSEUR.a[0],
    result: 1 / ((+kraken.result.EOSEUR.a[0] * (1 + commission)) / +cbEos.bid),
  });
  pairs.push({
    title: 'REP',
    commission,
    sell: +cbRep.bid,
    buy: +kraken.result.XREPZEUR.a[0],
    result: 1 / ((+kraken.result.XREPZEUR.a[0] * (1 + commission)) / +cbRep.bid),
  });
  pairs.push({
    title: 'ZEC',
    commission,
    sell: +cbZec.bid,
    buy: +kraken.result.XZECZEUR.a[0],
    result: 1 / ((+kraken.result.XZECZEUR.a[0] * (1 + commission)) / +cbZec.bid),
  });

  res.send(pairs.sort((a, b) => b.result - a.result));
});

app.listen(process.env.PORT || 3001, () => console.log('listening..'));

process.on('uncaughtException', function(err) {
  p.send(
    {
      message: err,
    },
    function(err, result) {},
  );
});
