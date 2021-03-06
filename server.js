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
  user: 'g6qgivbzbg1nrakurqaaecmwrmcaxj',
  token: 'a26qjmrach23epfar8zatfh7apcyfd',
});

let profitMargin = 0.1;
let profitMarginReverse = 0;
let text = '';
setInterval(() => {
  if (kur === 0) return;
  text = '';
  fetch('https://coin-serv.herokuapp.com/coinbase')
    .then(response => response.json())
    .then(data => {
      data.forEach(pair => {
        if (
          pair.result > kur + profitMargin &&
          text === '' &&
          alert.some(title => title === pair.title)
        ) {
          text = pair.title + ": " + pair.result.toString().substring(0, 5);

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
  fetch('https://coin-serv.herokuapp.com/coinbasereverse')
    .then(response => response.json())
    .then(data => {
      data.forEach(pair => {
        if (
          pair.result < kur - profitMarginReverse &&
          text === '' &&
          alertReverse.some(title => title === pair.title)
        ) {
          text = pair.title + ": " + pair.result.toString().substring(0, 5);
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
}, 60000);

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
}, 20000);

app.get('/', (req, res) => {
  if(req.query.profit){
    profitMargin = +req.query.profit
  }
  res.send({profitMargin:profitMargin, currentAlert:+profitMargin+kur});
});

app.get('/kur', (req, res) => {
  res.send({ kur: kur.toFixed(4) });
});

app.get('/koineks', (req, res) => {
  fetch('https://api.thodex.com/v1/public/market-summary')
    .then(response => response.json())
    .then(json => res.send(json));
});

app.get('/paribu', (req, res) => {
  fetch('https://8080-fe8ca129-39a3-4154-be62-c24bdfd0c004.europe-west4.cloudshell.dev/paribu')
    .then(response => {
      console.log(response, response.json()); return response.json();
    })
    .then(json => res.send(json))
    .catch((error) => {
  console.error(error);
});
});

app.get('/btcturk', (req, res) => {
  fetch('https://api.btcturk.com/api/v2/ticker')
    .then(response => response.json())
    .then(json => res.send(json))
    .catch(e => console.log(e));
});

function getKoineks(name) {
  return fetch('https://api.thodex.com/v1/public/order-depth?market=' + name +'TRY')
    .then(r => r.json());
}


function getKoineksAskBid(pair) {
  return {bid: +pair.result.bids[0][0], ask: +pair.result.asks[0][0]}; 
}


async function getKoineksData() {
  const promisesList = [
    getKoineks("BTC"),
    getKoineks("ETH"),
    getKoineks("XRP"),
    getKoineks("LTC"),
    getKoineks("XLM"),
    getKoineks("EOS"),
    getKoineks("ZEC"),
    getKoineks("BTT"),
    getKoineks("TRX"),
    getKoineks("ADA"),
    getKoineks("DASH"),
    getKoineks("XMR"),
    getKoineks("DOGE"),
    getKoineks("USDT")
  ];
  let data = await Promise.all(promisesList).catch(x => console.log(x));
  if(!data.result){
    return {
      BTC:{
        bid:0 , ask:0
      },
      ETH:{
        bid:0 , ask:0
      },
      XRP:{
        bid:0 , ask:0
      },
      LTC:{
        bid:0 , ask:0
      },
      XLM:{
        bid:0 , ask:0
      },
      EOS:{
        bid:0 , ask:0
      },
      ZEC:{
        bid:0 , ask:0
      },
      BTT:{
        bid:0 , ask:0
      },
      TRX:{
        bid:0 , ask:0
      },
      ADA:{
        bid:0 , ask:0
      },
      DASH:{
        bid:0 , ask:0
      },
      XMR:{
        bid:0 , ask:0
      },
      DOGE:{
        bid:0 , ask:0
      },
      USDT:{
        bid:0 , ask:0
      }
    }
  }
  return {
    BTC:{
      bid: +data[0].result.bids[0][0], ask: +data[0].result.asks[0][0]
    },
    ETH:{
      bid: +data[1].result.bids[0][0], ask: +data[1].result.asks[0][0]
    },
    XRP:{
      bid: +data[2].result.bids[0][0], ask: +data[2].result.asks[0][0]
    },
    LTC:{
      bid: +data[3].result.bids[0][0], ask: +data[3].result.asks[0][0]
    },
    XLM:{
      bid: +data[4].result.bids[0][0], ask: +data[4].result.asks[0][0]
    },
    EOS:{
      bid: +data[5].result.bids[0][0], ask: +data[5].result.asks[0][0]
    },
    ZEC:{
      bid: +data[6].result.bids[0][0], ask: +data[6].result.asks[0][0]
    },
    BTT:{
      bid: +data[7].result.bids[0][0], ask: +data[7].result.asks[0][0]
    },
    TRX:{
      bid: +data[8].result.bids[0][0], ask: +data[8].result.asks[0][0]
    },
    ADA:{
      bid: +data[9].result.bids[0][0], ask: +data[9].result.asks[0][0]
    },
    DASH:{
      bid: +data[10].result.bids[0][0], ask: +data[10].result.asks[0][0]
    },
    XMR:{
      bid: +data[11].result.bids[0][0], ask: +data[11].result.asks[0][0]
    },
    DOGE:{
      bid: +data[12].result.bids[0][0], ask: +data[12].result.asks[0][0]
    },
    USDT:{
      bid: +data[13].result.bids[0][0], ask: +data[13].result.asks[0][0]
    }
  }
}

app.get('/kraken', async (req, res) => {
  let pairs = [];
  let commission = 0.005;

  let kraken = await fetch(
    'https://api.kraken.com/0/public/Ticker?pair=xbteur,etheur,xrpeur,ltceur,xlmeur,adaeur,eoseur,dasheur,zeceur,waveseur,xtzeur,usdteur,xdgeur,trxeur,linkeur,doteur,usdceur,atomeur',
  ).then(r => r.json()).catch(x => console.log(x));

  let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => console.log(x));

  let btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => console.log(x));

  let koineksData = await getKoineksData();

if(paribu){
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
    title: 'DOGE - PARIBU',
    commission,
    buy: +kraken.result.XDGEUR.a[0],
    sell: +paribu.DOGE_TL.highestBid,
    result: (+paribu.DOGE_TL.highestBid * (1 - commission)) / kraken.result.XDGEUR.a[0],
  });


  pairs.push({
    title: 'TRX - PARIBU',
    commission,
    buy: +kraken.result.TRXEUR.a[0],
    sell: +paribu.TRX_TL.highestBid,
    result: (+paribu.TRX_TL.highestBid * (1 - commission)) / kraken.result.TRXEUR.a[0],
  });


if (paribu.ATOM_TL)
  pairs.push({
    title: 'ATOM - PARIBU',
    commission,
    buy: +kraken.result.ATOMEUR.a[0],
    sell: +paribu.ATOM_TL.highestBid,
    result: (+paribu.ATOM_TL.highestBid * (1 - commission)) / kraken.result.ATOMEUR.a[0],
  });




  pairs.push({
    title: 'LINK - PARIBU',
    commission,
    buy: +kraken.result.LINKEUR.a[0],
    sell: +paribu.LINK_TL.highestBid,
    result: (+paribu.LINK_TL.highestBid * (1 - commission)) / kraken.result.LINKEUR.a[0],
  });

  if (kraken.result.WAVESEUR && paribu.WAVES_TL)
    pairs.push({
      title: 'WAVES - PARIBU',
      commission,
      buy: +kraken.result.WAVESEUR.a[0],
      sell: +paribu.WAVES_TL.highestBid,
      result: (+paribu.WAVES_TL.highestBid * (1 - commission)) / kraken.result.WAVESEUR.a[0],
    });


  if (kraken.result.DOTEUR && paribu.DOT_TL)
    pairs.push({
      title: 'DOT - PARIBU',
      commission,
      buy: +kraken.result.DOTEUR.a[0],
      sell: +paribu.DOT_TL.highestBid,
      result: (+paribu.DOT_TL.highestBid * (1 - commission)) / kraken.result.DOTEUR.a[0],
    });


  if (kraken.result.USDTEUR && paribu.USDT_TL)
    pairs.push({
      title: 'USDT - PARIBU',
      commission,
      buy: +kraken.result.USDTEUR.a[0],
      sell: +paribu.USDT_TL.highestBid,
      result: (+paribu.USDT_TL.highestBid * (1 - commission)) / kraken.result.USDTEUR.a[0],
    });

  if (kraken.result.XTZEUR && paribu.XTZ_TL)
  pairs.push({
    title: 'XTZ - PARIBU',
    commission,
    buy: +kraken.result.XTZEUR.a[0],
    sell: +paribu.XTZ_TL.highestBid,
    result: (+paribu.XTZ_TL.highestBid * (1 - commission)) / kraken.result.XTZEUR.a[0],
  });
}

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
    title: 'EOS - BTCTURK',
    commission,
    buy: +kraken.result.EOSEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'EOSTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'EOSTRY').bid * (1 - commission)) /
      kraken.result.EOSEUR.a[0],
  });


    pairs.push({
    title: 'LINK - BTCTURK',
    commission,
    buy: +kraken.result.LINKEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'LINKTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'LINKTRY').bid * (1 - commission)) /
      kraken.result.LINKEUR.a[0],
  });


if(btcturk.some(x => x.pair === 'ATOMTRY'))
        pairs.push({
    title: 'ATOM - BTCTURK',
    commission,
    buy: +kraken.result.ATOMEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'ATOMTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'ATOMTRY').bid * (1 - commission)) /
      kraken.result.ATOMEUR.a[0],
  });




    pairs.push({
    title: 'DASH - BTCTURK',
    commission,
    buy: +kraken.result.DASHEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'DASHTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'DASHTRY').bid * (1 - commission)) /
      kraken.result.DASHEUR.a[0],
  });


    pairs.push({
    title: 'XTZ - BTCTURK',
    commission,
    buy: +kraken.result.XTZEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'XTZTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'XTZTRY').bid * (1 - commission)) /
      kraken.result.XTZEUR.a[0],
  });



    pairs.push({
    title: 'TRX - BTCTURK',
    commission,
    buy: +kraken.result.TRXEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'TRXTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'TRXTRY').bid * (1 - commission)) /
      kraken.result.TRXEUR.a[0],
  });



    pairs.push({
    title: 'ADA - BTCTURK',
    commission,
    buy: +kraken.result.ADAEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'ADATRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'ADATRY').bid * (1 - commission)) /
      kraken.result.ADAEUR.a[0],
  });


    pairs.push({
    title: 'DOT - BTCTURK',
    commission,
    buy: +kraken.result.DOTEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'DOTTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'DOTTRY').bid * (1 - commission)) /
      kraken.result.DOTEUR.a[0],
  });


    pairs.push({
    title: 'USDC - BTCTURK',
    commission,
    buy: +kraken.result.USDCEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'USDCTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'USDCTRY').bid * (1 - commission)) /
      kraken.result.USDCEUR.a[0],
  });

    pairs.push({
    title: 'USDT - BTCTURK',
    commission,
    buy: +kraken.result.USDTEUR.a[0],
    sell: +btcturk.find(x => x.pair === 'USDTTRY').bid,
    result:
      (+btcturk.find(x => x.pair === 'USDTTRY').bid * (1 - commission)) /
      kraken.result.USDTEUR.a[0],
  });

  pairs.push({
    title: 'BTC - THODEX',
    commission,
    buy: +kraken.result.XXBTZEUR.a[0],
    sell: koineksData.BTC.bid,
    result: (koineksData.BTC.bid * (1 - commission)) / kraken.result.XXBTZEUR.a[0],
  });

  
  pairs.push({
    title: 'ETH - THODEX',
    commission,
    buy: +kraken.result.XETHZEUR.a[0],
    sell: koineksData.ETH.bid,
    result: (koineksData.ETH.bid * (1 - commission)) / kraken.result.XETHZEUR.a[0],
  });
  pairs.push({
    title: 'XRP - THODEX',
    commission,
    buy: +kraken.result.XXRPZEUR.a[0],
    sell: koineksData.XRP.bid,
    result: (koineksData.XRP.bid * (1 - commission)) / kraken.result.XXRPZEUR.a[0],
  });
  pairs.push({
    title: 'LTC - THODEX',
    commission,
    buy: +kraken.result.XLTCZEUR.a[0],
    sell: koineksData.LTC.bid,
    result: (koineksData.LTC.bid * (1 - commission)) / kraken.result.XLTCZEUR.a[0],
  });
  pairs.push({
    title: 'XLM - THODEX',
    commission,
    buy: +kraken.result.XXLMZEUR.a[0],
    sell: koineksData.XLM.bid,
    result: (koineksData.XLM.bid * (1 - commission)) / kraken.result.XXLMZEUR.a[0],
  });
  pairs.push({
    title: 'ADA - THODEX',
    commission,
    buy: +kraken.result.ADAEUR.a[0],
    sell: koineksData.ADA.bid,
    result: (koineksData.ADA.bid * (1 - commission)) / kraken.result.ADAEUR.a[0],
  });
  pairs.push({
    title: 'EOS - THODEX',
    commission,
    buy: +kraken.result.EOSEUR.a[0],
    sell: koineksData.EOS.bid,
    result: (koineksData.EOS.bid * (1 - commission)) / kraken.result.EOSEUR.a[0],
  });
  pairs.push({
    title: 'DASH - THODEX',
    commission,
    buy: +kraken.result.DASHEUR.a[0],
    sell: koineksData.DASH.bid,
    result: (koineksData.DASH.bid * (1 - commission)) / kraken.result.DASHEUR.a[0],
  });
  pairs.push({
    title: 'ZEC - THODEX',
    commission,
    buy: +kraken.result.XZECZEUR.a[0],
    sell: koineksData.ZEC.bid,
    result: (koineksData.ZEC.bid * (1 - commission)) / kraken.result.XZECZEUR.a[0],
  });
  res.send(
    pairs
      .sort((a, b) => b.result - a.result)
      .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result),
  );
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

  let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => console.log(x));
  let btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => console.log(x));


  let koineksData = await getKoineksData();
if(paribu){


  if (paribu.UNI_TL)
    pairs.push({
    title: 'UNI* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'UNIUSDT').askPrice,
    sell: +paribu.UNI_TL.highestBid,
    result:
      (+paribu.UNI_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'UNIUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });


  if (paribu.BAL_TL)
    pairs.push({
    title: 'BAL* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'BALUSDT').askPrice,
    sell: +paribu.BAL_TL.highestBid,
    result:
      (+paribu.BAL_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BALUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });




  if (paribu.ATM_TL)
    pairs.push({
    title: 'ATM* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ATMUSDT').askPrice,
    sell: +paribu.ATM_TL.highestBid,
    result:
      (+paribu.ATM_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ATMUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });






  if (paribu.ASR_TL)
    pairs.push({
    title: 'ASR* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ASRUSDT').askPrice,
    sell: +paribu.ASR_TL.highestBid,
    result:
      (+paribu.ASR_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ASRUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });




    if (paribu.AAVE_TL)
    pairs.push({
    title: 'AAVE* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'AAVEUSDT').askPrice,
    sell: +paribu.AAVE_TL.highestBid,
    result:
      (+paribu.AAVE_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'AAVEUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });



    if (paribu.AVAX_TL)
    pairs.push({
    title: 'AVAX* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'AVAXUSDT').askPrice,
    sell: +paribu.AVAX_TL.highestBid,
    result:
      (+paribu.AVAX_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'AVAXUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });




    if (paribu.OMG_TL)
    pairs.push({
    title: 'OMG* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'OMGUSDT').askPrice,
    sell: +paribu.OMG_TL.highestBid,
    result:
      (+paribu.OMG_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'OMGUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });





    if (paribu.RVN_TL)
    pairs.push({
    title: 'RVN* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'RVNUSDT').askPrice,
    sell: +paribu.RVN_TL.highestBid,
    result:
      (+paribu.RVN_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'RVNUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });





    if (paribu.XTZ_TL)
    pairs.push({
    title: 'XTZ* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'XTZUSDT').askPrice,
    sell: +paribu.XTZ_TL.highestBid,
    result:
      (+paribu.XTZ_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XTZUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });




    if (paribu.MKR_TL)
    pairs.push({
    title: 'MKR* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'MKRUSDT').askPrice,
    sell: +paribu.MKR_TL.highestBid,
    result:
      (+paribu.MKR_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'MKRUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });



      if (paribu.ATOM_TL)
    pairs.push({
    title: 'ATOM* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ATOMUSDT').askPrice,
    sell: +paribu.ATOM_TL.highestBid,
    result:
      (+paribu.ATOM_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ATOMUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });





    if (paribu.ONT_TL)
    pairs.push({
    title: 'ONT* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ONTUSDT').askPrice,
    sell: +paribu.ONT_TL.highestBid,
    result:
      (+paribu.ONT_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ONTUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });



    if (paribu.DOT_TL)
    pairs.push({
    title: 'DOT* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'DOTUSDT').askPrice,
    sell: +paribu.DOT_TL.highestBid,
    result:
      (+paribu.DOT_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'DOTUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });



  pairs.push({
    title: 'BTC* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'BTCUSDT').askPrice,
    sell: +paribu.BTC_TL.highestBid,
    result:
      (+paribu.BTC_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BTCUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'ETH* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ETHUSDT').askPrice,
    sell: +paribu.ETH_TL.highestBid,
    result:
      (+paribu.ETH_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ETHUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'XRP* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'XRPUSDT').askPrice,
    sell: +paribu.XRP_TL.highestBid,
    result:
      (+paribu.XRP_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XRPUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'LTC* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'LTCUSDT').askPrice,
    sell: +paribu.LTC_TL.highestBid,
    result:
      (+paribu.LTC_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'LTCUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({

    title: 'XLM* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'XLMUSDT').askPrice,
    sell: +paribu.XLM_TL.highestBid,
    result:
      (+paribu.XLM_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XLMUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
title: 'EOS* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'EOSUSDT').askPrice,
    sell: +paribu.EOS_TL.highestBid,
    result:
      (+paribu.EOS_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'EOSUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({

    title: 'BAT* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'BATUSDT').askPrice,
    sell: +paribu.BAT_TL.highestBid,
    result:
      (+paribu.BAT_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BATUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
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
    title: 'CHZ* - PARIBU',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'CHZUSDT').askPrice,
    sell: +paribu.CHZ_TL.highestBid,
    result:
      (+paribu.CHZ_TL.highestBid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'CHZUSDT').askPrice /
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
  // if (paribu.RVN_TL)
  //   pairs.push({
  //     title: 'RVN* - PARIBU',
  //     commission: commissionWithBinance,
  //     buy: +binance.find(x => x.symbol === 'RVNBTC').askPrice,
  //     sell: +paribu.RVN_TL.highestBid,
  //     result:
  //       (+paribu.RVN_TL.highestBid * (1 - commissionWithBinance)) /
  //       ((binance.find(x => x.symbol === 'RVNBTC').askPrice *
  //         binance.find(x => x.symbol === 'BTCUSDT').askPrice) /
  //         +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  //   });
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
  if (binance.some(x => x.symbol === 'WAVESUSDT'))
    pairs.push({
      title: 'WAVES* - PARIBU',
      commission: commissionWithBinance,
      buy: +binance.find(x => x.symbol === 'WAVESUSDT').askPrice,
      sell: +paribu.WAVES_TL.highestBid,
      result:
        (+paribu.WAVES_TL.highestBid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'WAVESUSDT').askPrice /
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
}





if(btcturk.some(x => x.pair === 'DOTTRY'))
    pairs.push({
    title: 'DOT* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'DOTUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'DOTTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'DOTTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'DOTUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });



if(btcturk.some(x => x.pair === 'EOSTRY'))
    pairs.push({
    title: 'EOS* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'EOSUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'EOSTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'EOSTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'EOSUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });



if(btcturk.some(x => x.pair === 'LINKTRY'))
    pairs.push({
    title: 'LINK* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'LINKUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'LINKTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'LINKTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'LINKUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });



if(btcturk.some(x => x.pair === 'NEOTRY'))
    pairs.push({
    title: 'NEO* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'NEOUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'NEOTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'NEOTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'NEOUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });



if(btcturk.some(x => x.pair === 'TRXTRY'))
    pairs.push({
    title: 'TRX* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'TRXUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'TRXTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'TRXTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'TRXUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });



if(btcturk.some(x => x.pair === 'XTZTRY'))
    pairs.push({
    title: 'XTZ* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'XTZUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'XTZTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'XTZTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'XTZUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });






if(btcturk.some(x => x.pair === 'ADATRY'))
      pairs.push({
    title: 'ADA* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ADAUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'ADATRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'ADATRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'ADAUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
 


if(btcturk.some(x => x.pair === 'ATOMTRY'))
      pairs.push({
    title: 'ATOM* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ATOMUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'ATOMTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'ATOMTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'ATOMUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });


if(btcturk.some(x => x.pair === 'DASHTRY'))
      pairs.push({
    title: 'DASH* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'DASHUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'DASHTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'DASHTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'DASHUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });










  pairs.push({
    title: 'BTC* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'BTCUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'BTCTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'BTCTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'BTCUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'ETH* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ETHUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'ETHTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'ETHTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'ETHUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'XRP* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'XRPUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'XRPTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'XRPTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'XRPUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'LTC* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'LTCUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'LTCTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'LTCTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'LTCUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });  pairs.push({
    title: 'XLM* - BTCTURK',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'XLMUSDT').askPrice,
    sell: +btcturk.find(x => x.pair === 'XLMTRY').bid,
    result:
        (+btcturk.find(x => x.pair === 'XLMTRY').bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'XLMUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
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
    title: 'BTC - THODEX',
    commission,
    buy: +cbBtc.ask,
    sell: koineksData.BTC.bid,
    result: (koineksData.BTC.bid * (1 - commission)) / +cbBtc.ask,
  });
  pairs.push({
    title: 'ETH - THODEX',
    commission,
    buy: +cbEth.ask,
    sell: koineksData.ETH.bid,
    result: (koineksData.ETH.bid * (1 - commission)) / +cbEth.ask,
  });
  pairs.push({
    title: 'XRP - THODEX',
    commission,
    buy: +cbXrp.ask,
    sell: koineksData.XRP.bid,
    result: (koineksData.XRP.bid * (1 - commission)) / +cbXrp.ask,
  });
  pairs.push({
    title: 'LTC - THODEX',
    commission,
    buy: +cbLtc.ask,
    sell: koineksData.LTC.bid,
    result: (koineksData.LTC.bid * (1 - commission)) / +cbLtc.ask,
  });
  pairs.push({
    title: 'XLM - THODEX',
    commission,
    buy: +cbXlm.ask,
    sell: koineksData.XLM.bid,
    result: (koineksData.XLM.bid * (1 - commission)) / +cbXlm.ask,
  });
  pairs.push({
    title: 'EOS - THODEX',
    commission,
    buy: +cbEos.ask,
    sell: koineksData.EOS.bid,
    result: (koineksData.EOS.bid * (1 - commission)) / +cbEos.ask,
  });
  pairs.push({
    title: 'ZEC - THODEX',
    commission,
    buy: +cbZec.ask,
    sell: koineksData.ZEC.bid,
    result: (koineksData.ZEC.bid * (1 - commission)) / +cbZec.ask,
  });
  pairs.push({
    title: 'BTT* - THODEX',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'BTTUSDT').askPrice,
    sell: koineksData.BTT.bid,
    result:
      (koineksData.BTT.bid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BTTUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'TRX* - THODEX',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'TRXUSDT').askPrice,
    sell: koineksData.TRX.bid,
    result:
      (koineksData.TRX.bid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'TRXUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'ADA* - THODEX',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'ADAUSDT').askPrice,
    sell: koineksData.ADA.bid,
    result:
      (koineksData.ADA.bid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ADAUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  pairs.push({
    title: 'DASH* - THODEX',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'DASHUSDT').askPrice,
    sell: koineksData.DASH.bid,
    result:
      (koineksData.DASH.bid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'DASHUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  
  pairs.push({
    title: 'XMR* - THODEX',
    commission: commissionWithBinance,
    buy: +binance.find(x => x.symbol === 'XMRUSDT').askPrice,
    sell: koineksData.XMR.bid,
    result:
      (koineksData.XMR.bid * (1 - commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XMRUSDT').askPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });
  if (binance.some(x => x.symbol === 'DOGEUSDT'))
    pairs.push({
      title: 'DOGE* - THODEX',
      commission: commissionWithBinance,
      buy: +binance.find(x => x.symbol === 'DOGEUSDT').askPrice,
      sell: koineksData.DOGE.bid,
      result:
        (koineksData.DOGE.bid * (1 - commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'DOGEUSDT').askPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
  pairs.push({
    title: 'USDT* - THODEX',
    commission: commissionWithBinanceUSDT,
    buy: 1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice,
    sell: koineksData.USDT.bid,
    result:
      (koineksData.USDT.bid * (1 - commissionWithBinanceUSDT)) /
      (1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
  });

  res.send(
    pairs
      .sort((a, b) => b.result - a.result)
      .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result),
  );
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

  let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => console.log(x));

  let btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => console.log(x));

  let koineksData = await getKoineksData();

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
    title: 'BTC - THODEX',
    group: 3,
    cb2p: koineksData.BTC.bid / +cbBtc.ask,
    p2cb: +cbBtc.bid / koineksData.BTC.ask,
  });
  pairs.push({
    title: 'ETH - THODEX',
    group: 3,
    cb2p: koineksData.ETH.bid / +cbEth.ask,
    p2cb: +cbEth.bid / koineksData.ETH.ask,
  });
  pairs.push({
    title: 'XRP - THODEX',
    group: 3,
    cb2p: koineksData.XRP.bid / +cbXrp.ask,
    p2cb: +cbXrp.bid / koineksData.XRP.ask,
  });
  pairs.push({
    title: 'LTC - THODEX',
    group: 3,
    cb2p: koineksData.LTC.bid / +cbLtc.ask,
    p2cb: +cbLtc.bid / koineksData.LTC.ask,
  });

  pairs.push({
    title: 'XLM - THODEX',
    group: 3,
    cb2p: koineksData.XLM.bid / +cbXlm.ask,
    p2cb: +cbXlm.bid / koineksData.XLM.ask,
  });

  pairs.push({
    title: 'EOS - THODEX',
    group: 3,
    cb2p: koineksData.EOS.bid / +cbEos.ask,
    p2cb: +cbEos.bid / koineksData.EOS.ask,
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

  let cbZec = await fetch('https://api.pro.coinbase.com/products/zec-usdc/ticker').then(r =>
    r.json(),
  );

  let binance = await fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json());

  let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => console.log(x));

  let btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => console.log(x));

  let koineksData = await getKoineksData();
if(paribu){



  if (paribu.BAL_TL)
      pairs.push({
    title: 'BAL* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'BALUSDT').bidPrice,
    buy: +paribu.BAL_TL.lowestAsk,
    result:
      (+paribu.BAL_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BALUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });





  if (paribu.ATM_TL)
      pairs.push({
    title: 'ATM* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ATMUSDT').bidPrice,
    buy: +paribu.ATM_TL.lowestAsk,
    result:
      (+paribu.ATM_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ATMUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });





  if (paribu.ASR_TL)
      pairs.push({
    title: 'ASR* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ASRUSDT').bidPrice,
    buy: +paribu.ASR_TL.lowestAsk,
    result:
      (+paribu.ASR_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ASRUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });


  if (paribu.UNI_TL)
      pairs.push({
    title: 'UNI* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'UNIUSDT').bidPrice,
    buy: +paribu.UNI_TL.lowestAsk,
    result:
      (+paribu.UNI_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'UNIUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });

      if (paribu.AAVE_TL)
      pairs.push({
    title: 'AAVE* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'AAVEUSDT').bidPrice,
    buy: +paribu.AAVE_TL.lowestAsk,
    result:
      (+paribu.AAVE_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'AAVEUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });



      if (paribu.AVAX_TL)
      pairs.push({
    title: 'AVAX* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'AVAXUSDT').bidPrice,
    buy: +paribu.AVAX_TL.lowestAsk,
    result:
      (+paribu.AVAX_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'AVAXUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });


          if (paribu.OMG_TL)
      pairs.push({
    title: 'OMG* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'OMGUSDT').bidPrice,
    buy: +paribu.OMG_TL.lowestAsk,
    result:
      (+paribu.OMG_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'OMGUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });




          if (paribu.XTZ_TL)
      pairs.push({
    title: 'XTZ* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'XTZUSDT').bidPrice,
    buy: +paribu.XTZ_TL.lowestAsk,
    result:
      (+paribu.XTZ_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XTZUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });




          if (paribu.MKR_TL)
      pairs.push({
    title: 'MKR* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'MKRUSDT').bidPrice,
    buy: +paribu.MKR_TL.lowestAsk,
    result:
      (+paribu.MKR_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'MKRUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });



          if (paribu.RVN_TL)
      pairs.push({
    title: 'RVN* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'RVNUSDT').bidPrice,
    buy: +paribu.RVN_TL.lowestAsk,
    result:
      (+paribu.RVN_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'RVNUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });




              if (paribu.ATOM_TL)
      pairs.push({
    title: 'ATOM* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ATOMUSDT').bidPrice,
    buy: +paribu.ATOM_TL.lowestAsk,
    result:
      (+paribu.ATOM_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ATOMUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });


          if (paribu.DOT_TL)
      pairs.push({
    title: 'DOT* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'DOTUSDT').bidPrice,
    buy: +paribu.DOT_TL.lowestAsk,
    result:
      (+paribu.DOT_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'DOTUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });



          if (paribu.ONT_TL)
      pairs.push({
    title: 'ONT* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ONTUSDT').bidPrice,
    buy: +paribu.ONT_TL.lowestAsk,
    result:
      (+paribu.ONT_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ONTUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });




	  pairs.push({
    title: 'BTC* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'BTCUSDT').bidPrice,
    buy: +paribu.BTC_TL.lowestAsk,
    result:
      (+paribu.BTC_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BTCUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'ETH* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ETHUSDT').bidPrice,
    buy: +paribu.ETH_TL.lowestAsk,
    result:
      (+paribu.ETH_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ETHUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'XRP* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'XRPUSDT').bidPrice,
    buy: +paribu.XRP_TL.lowestAsk,
    result:
      (+paribu.XRP_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XRPUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'LTC* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'LTCUSDT').bidPrice,
    buy: +paribu.LTC_TL.lowestAsk,
    result:
      (+paribu.LTC_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'LTCUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
pairs.push({
    title: 'XLM* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'XLMUSDT').bidPrice,
    buy: +paribu.XLM_TL.lowestAsk,
    result:
      (+paribu.XLM_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XLMUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
pairs.push({
    title: 'EOS* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'EOSUSDT').bidPrice,
    buy: +paribu.EOS_TL.lowestAsk,
    result:
      (+paribu.EOS_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'EOSUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
pairs.push({
    title: 'BAT* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'BATUSDT').bidPrice,
    buy: +paribu.BAT_TL.lowestAsk,
    result:
      (+paribu.BAT_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BATUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
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
    title: 'CHZ* - PARIBU',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'CHZUSDT').bidPrice,
    buy: +paribu.CHZ_TL.lowestAsk,
    result:
      (+paribu.CHZ_TL.lowestAsk * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'CHZUSDT').bidPrice /
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
  // if (paribu.RVN_TL)
  //   pairs.push({
  //     title: 'RVN* - PARIBU',
  //     commission: commissionWithBinance,
  //     sell: +binance.find(x => x.symbol === 'RVNBTC').bidPrice,
  //     buy: +paribu.RVN_TL.lowestAsk,
  //     result:
  //       (+paribu.RVN_TL.lowestAsk * (1 + commissionWithBinance)) /
  //       ((binance.find(x => x.symbol === 'RVNBTC').bidPrice *
  //         binance.find(x => x.symbol === 'BTCUSDT').bidPrice) /
  //         +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  //   });
  if (paribu.WAVES_TL)
    pairs.push({
      title: 'WAVES* - PARIBU',
      commission: commissionWithBinance,
      sell: +binance.find(x => x.symbol === 'WAVESBTC').bidPrice,
      buy: +paribu.WAVES_TL.lowestAsk,
      result:
        (+paribu.WAVES_TL.lowestAsk * (1 + commissionWithBinance)) /
        ((binance.find(x => x.symbol === 'WAVESBTC').bidPrice *
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

}



if(btcturk.some(x => x.pair === 'ADATRY'))
  pairs.push({
    title: 'ADA* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ADAUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'ADATRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'ADATRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ADAUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });  


if(btcturk.some(x => x.pair === 'ATOMTRY'))
    pairs.push({
    title: 'ATOM* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ATOMUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'ATOMTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'ATOMTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ATOMUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  }); 


if(btcturk.some(x => x.pair === 'DASHTRY'))
      pairs.push({
    title: 'DASH* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'DASHUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'DASHTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'DASHTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'DASHUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });   




if(btcturk.some(x => x.pair === 'DOTTRY'))
      pairs.push({
    title: 'DOT* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'DOTUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'DOTTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'DOTTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'DOTUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });   


    if(btcturk.some(x => x.pair === 'EOSTRY'))
      pairs.push({
    title: 'EOS* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'EOSUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'EOSTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'EOSTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'EOSUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });   




    if(btcturk.some(x => x.pair === 'LINKTRY'))
      pairs.push({
    title: 'LINK* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'LINKUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'LINKTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'LINKTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'LINKUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });   


    if(btcturk.some(x => x.pair === 'NEOTRY'))
      pairs.push({
    title: 'NEO* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'NEOUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'NEOTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'NEOTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'NEOUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });   





    if(btcturk.some(x => x.pair === 'TRXTRY'))
      pairs.push({
    title: 'TRX* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'TRXUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'TRXTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'TRXTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'TRXUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });   


    if(btcturk.some(x => x.pair === 'XTZTRY'))
      pairs.push({
    title: 'XTZ* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'XTZUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'XTZTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'XTZTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XTZUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });   








  pairs.push({
    title: 'BTC* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'BTCUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'BTCTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'BTCTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BTCUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });  

  pairs.push({
    title: 'ETH* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ETHUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'ETHTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'ETHTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ETHUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });  



  pairs.push({
    title: 'LTC* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'LTCUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'LTCTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'LTCTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'LTCUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });  


  pairs.push({
    title: 'XLM* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'XLMUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'XLMTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'XLMTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XLMUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });  


  pairs.push({
    title: 'XRP* - BTCTURK',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'XRPUSDT').bidPrice,
    buy: +btcturk.find(x => x.pair === 'XRPTRY').ask,
    result:
      (+btcturk.find(x => x.pair === 'XRPTRY').ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'XRPUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
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
    title: 'BTC - THODEX',
    commission,
    sell: +cbBtc.bid,
    buy: koineksData.BTC.ask,
    result: (koineksData.BTC.ask * (1 + commission)) / +cbBtc.bid,
  });
  pairs.push({
    title: 'ETH - THODEX',
    commission,
    sell: +cbEth.bid,
    buy: koineksData.ETH.ask,
    result: (koineksData.ETH.ask * (1 + commission)) / +cbEth.bid,
  });
  pairs.push({
    title: 'XRP - THODEX',
    commission,
    sell: +cbXrp.bid,
    buy: koineksData.XRP.ask,
    result: (koineksData.XRP.ask * (1 + commission)) / +cbXrp.bid,
  });
  pairs.push({
    title: 'LTC - THODEX',
    commission,
    sell: +cbLtc.bid,
    buy: koineksData.LTC.ask,
    result: (koineksData.LTC.ask * (1 + commission)) / +cbLtc.bid,
  });
  pairs.push({
    title: 'XLM - THODEX',
    commission,
    sell: +cbXlm.bid,
    buy: koineksData.XLM.ask,
    result: (koineksData.XLM.ask * (1 + commission)) / +cbXlm.bid,
  });
  pairs.push({
    title: 'EOS - THODEX',
    commission,
    sell: +cbEos.bid,
    buy: koineksData.EOS.ask,
    result: (koineksData.EOS.ask * (1 + commission)) / +cbEos.bid,
  });
    pairs.push({
      title: 'ZEC - THODEX',
      commission,
      sell: +cbZec.bid,
      buy: koineksData.ZEC.ask,
      result: (koineksData.ZEC.ask * (1 + commission)) / +cbZec.bid,
    });
  pairs.push({
    title: 'BTT* - THODEX',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'BTTUSDT').bidPrice,
    buy: koineksData.BTT.ask,
    result:
      (koineksData.BTT.ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'BTTUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'TRX* - THODEX',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'TRXUSDT').bidPrice,
    buy: koineksData.TRX.ask,
    result:
      (koineksData.TRX.ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'TRXUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'ADA* - THODEX',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'ADAUSDT').bidPrice,
    buy: koineksData.ADA.ask,
    result:
      (koineksData.ADA.ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'ADAUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  pairs.push({
    title: 'DASH* - THODEX',
    commission: commissionWithBinance,
    sell: +binance.find(x => x.symbol === 'DASHUSDT').bidPrice,
    buy: koineksData.DASH.ask,
    result:
      (koineksData.DASH.ask * (1 + commissionWithBinance)) /
      (+binance.find(x => x.symbol === 'DASHUSDT').bidPrice /
        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
    pairs.push({
      title: 'XMR* - THODEX',
      commission: commissionWithBinance,
      sell: +binance.find(x => x.symbol === 'XMRUSDT').bidPrice,
      buy: koineksData.XMR.ask,
      result:
        (koineksData.XMR.ask * (1 + commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'XMRUSDT').bidPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });
  if (binance.some(x => x.symbol === 'DOGEUSDT'))
    pairs.push({
      title: 'DOGE* - THODEX',
      commission: commissionWithBinance,
      sell: +binance.find(x => x.symbol === 'DOGEUSDT').bidPrice,
      buy: koineksData.DOGE.ask,
      result:
        (koineksData.DOGE.ask * (1 + commissionWithBinance)) /
        (+binance.find(x => x.symbol === 'DOGEUSDT').bidPrice /
          +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });

  pairs.push({
    title: 'USDT* - THODEX',
    commission: commissionWithBinanceUSDT,
    sell: 1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice,
    buy: koineksData.USDT.ask,
    result:
      (koineksData.USDT.ask * (1 + commissionWithBinanceUSDT)) /
      (1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
  });
  res.send(
    pairs
      .sort((a, b) => a.result - b.result)
      .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result),
  );
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
  res.send(
    pairs
      .sort((a, b) => b.result - a.result)
      .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result),
  );
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
