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
    token: 'aimiivzn6eh82mih6n21vu347aneum',
});

let profitMargin = 0.1;
let tetherBuy = -1;
let tetherMargin = 0;
let profitMarginReverse = 0;
let text = '';
let myAlarm = 0;
setInterval(() => {


    if(myAlarm === 0){
        p.send({
                message: "ALARM BOZULDU",
            },
            function(err, result) {
                console.log(result);
            },
        );
    }




    if (kur === 0) return;
    text = '';




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
                    p.send({
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


    fetch('https://coin-serv.herokuapp.com/coinbase')
        .then(response => response.json())
        .then(data => {
            data.forEach(pair => {
                if (
                    pair.result > kur + profitMargin &&
                    text === '' &&
                    alert.some(title => title === pair.title)
                ) {
                    text = pair.title + ": " + pair.result.toString().substring(0, 5) + " (sell:" + pair.sell.toString().substring(0, 6) + ")";
                    if (profitMargin == -1) {

                        if (pair.result > tetherBuy) {
                            p.send({
                                    message: text,
                                },
                                function(err, result) {
                                    console.log(result);
                                },
                            );

                        }
                        return;
                    } else {

                        p.send({
                                message: text,
                            },
                            function(err, result) {
                                console.log(result);
                            },
                        );
                        return;
                    }



                }
            });
        });



}, 30000);

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
    if (req.query.profit) {
        profitMargin = +req.query.profit
        myAlarm = 1;
    }
    if (req.query.tetherMargin) {
        tetherMargin = +req.query.tetherMargin
    }
    if (profitMargin == -1) {
        res.send({
            profitMargin: profitMargin,
            tetherBuyAlertActive: tetherBuy,
            currentAlert: +profitMargin + kur,
            tetherMargin: tetherMargin
        });

    } else {
        res.send({
            profitMargin: profitMargin,
            currentAlert: +profitMargin + kur
        });
    }
});

app.get('/kur', (req, res) => {

    if(profitMargin === -1){
        let l = tetherBuy - tetherMargin;
        res.send({
            kur: l.toFixed(4)
        });
    } else {
        res.send({
            kur: kur.toFixed(4)
        });
    }
});


app.get('/caldir', (req, res) => {

        p.send({
            message: "ALARM TEST",
        },
        function(err, result) {
            console.log(result);
        },
        );

        res.send({
            kur: kur.toFixed(4)
        });

});


app.get('/reelkur', (req, res) => {

        res.send({
            kur: kur.toFixed(4)
        });
});


app.get('/paribu', (req, res) => {
    fetch('https://www.paribu.com/ticker')
        .then(response => {
            console.log(response, response.json());
            return response.json();
        })
        .then(json => res.send(json))
        .catch((error) => {
            console.error(error);
            res.send({
                error: error
            });
        });
});

app.get('/btcturk', (req, res) => {
    fetch('https://api.btcturk.com/api/v2/ticker')
        .then(response => response.json())
        .then(json => res.send(json))
        .catch(e => console.log(e));
});


app.get('/kraken', async (req, res) => {
    let pairs = [];
    let commission = 0.005;

    let kraken = await fetch(
        'https://api.kraken.com/0/public/Ticker?pair=xbteur,etheur,xrpeur,ltceur,xlmeur,adaeur,eoseur,dasheur,zeceur,waveseur,xtzeur,usdteur,xdgeur,trxeur,linkeur,doteur,usdceur,atomeur',
    ).then(r => r.json()).catch(x => console.log(x));

    let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => console.log(x));

    let btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => console.log(x));


    if (paribu) {
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
        result: (+btcturk.find(x => x.pair === 'BTCTRY').bid * (1 - commission)) /
            kraken.result.XXBTZEUR.a[0],
    });


    pairs.push({
        title: 'ETH - BTCTURK',
        commission,
        buy: +kraken.result.XETHZEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'ETHTRY').bid,
        result: (+btcturk.find(x => x.pair === 'ETHTRY').bid * (1 - commission)) /
            kraken.result.XETHZEUR.a[0],
    });
    pairs.push({
        title: 'XRP - BTCTURK',
        commission,
        buy: +kraken.result.XXRPZEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'XRPTRY').bid,
        result: (+btcturk.find(x => x.pair === 'XRPTRY').bid * (1 - commission)) /
            kraken.result.XXRPZEUR.a[0],
    });
    pairs.push({
        title: 'LTC - BTCTURK',
        commission,
        buy: +kraken.result.XLTCZEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'LTCTRY').bid,
        result: (+btcturk.find(x => x.pair === 'LTCTRY').bid * (1 - commission)) /
            kraken.result.XLTCZEUR.a[0],
    });
    pairs.push({
        title: 'XLM - BTCTURK',
        commission,
        buy: +kraken.result.XXLMZEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'XLMTRY').bid,
        result: (+btcturk.find(x => x.pair === 'XLMTRY').bid * (1 - commission)) /
            kraken.result.XXLMZEUR.a[0],
    });

    pairs.push({
        title: 'EOS - BTCTURK',
        commission,
        buy: +kraken.result.EOSEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'EOSTRY').bid,
        result: (+btcturk.find(x => x.pair === 'EOSTRY').bid * (1 - commission)) /
            kraken.result.EOSEUR.a[0],
    });


    pairs.push({
        title: 'LINK - BTCTURK',
        commission,
        buy: +kraken.result.LINKEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'LINKTRY').bid,
        result: (+btcturk.find(x => x.pair === 'LINKTRY').bid * (1 - commission)) /
            kraken.result.LINKEUR.a[0],
    });


    if (btcturk.some(x => x.pair === 'ATOMTRY'))
        pairs.push({
            title: 'ATOM - BTCTURK',
            commission,
            buy: +kraken.result.ATOMEUR.a[0],
            sell: +btcturk.find(x => x.pair === 'ATOMTRY').bid,
            result: (+btcturk.find(x => x.pair === 'ATOMTRY').bid * (1 - commission)) /
                kraken.result.ATOMEUR.a[0],
        });




    pairs.push({
        title: 'DASH - BTCTURK',
        commission,
        buy: +kraken.result.DASHEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'DASHTRY').bid,
        result: (+btcturk.find(x => x.pair === 'DASHTRY').bid * (1 - commission)) /
            kraken.result.DASHEUR.a[0],
    });


    pairs.push({
        title: 'XTZ - BTCTURK',
        commission,
        buy: +kraken.result.XTZEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'XTZTRY').bid,
        result: (+btcturk.find(x => x.pair === 'XTZTRY').bid * (1 - commission)) /
            kraken.result.XTZEUR.a[0],
    });



    pairs.push({
        title: 'TRX - BTCTURK',
        commission,
        buy: +kraken.result.TRXEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'TRXTRY').bid,
        result: (+btcturk.find(x => x.pair === 'TRXTRY').bid * (1 - commission)) /
            kraken.result.TRXEUR.a[0],
    });



    pairs.push({
        title: 'ADA - BTCTURK',
        commission,
        buy: +kraken.result.ADAEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'ADATRY').bid,
        result: (+btcturk.find(x => x.pair === 'ADATRY').bid * (1 - commission)) /
            kraken.result.ADAEUR.a[0],
    });


    pairs.push({
        title: 'DOT - BTCTURK',
        commission,
        buy: +kraken.result.DOTEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'DOTTRY').bid,
        result: (+btcturk.find(x => x.pair === 'DOTTRY').bid * (1 - commission)) /
            kraken.result.DOTEUR.a[0],
    });


    pairs.push({
        title: 'USDC - BTCTURK',
        commission,
        buy: +kraken.result.USDCEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'USDCTRY').bid,
        result: (+btcturk.find(x => x.pair === 'USDCTRY').bid * (1 - commission)) /
            kraken.result.USDCEUR.a[0],
    });

    pairs.push({
        title: 'USDT - BTCTURK',
        commission,
        buy: +kraken.result.USDTEUR.a[0],
        sell: +btcturk.find(x => x.pair === 'USDTTRY').bid,
        result: (+btcturk.find(x => x.pair === 'USDTTRY').bid * (1 - commission)) /
            kraken.result.USDTEUR.a[0],
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


    let binance = await fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json());

    let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => console.log(x));
    let btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => console.log(x));


    if (paribu) {

        tetherBuy = +paribu.USDT_TL.lowestAsk + tetherMargin;


        if (paribu.UNI_TL)
            pairs.push({
                title: 'UNI* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'UNIUSDT').askPrice,
                sell: +paribu.UNI_TL.highestBid,
                result: (+paribu.UNI_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'UNIUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });


        if (paribu.BAL_TL)
            pairs.push({
                title: 'BAL* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'BALUSDT').askPrice,
                sell: +paribu.BAL_TL.highestBid,
                result: (+paribu.BAL_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BALUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.ATM_TL)
            pairs.push({
                title: 'ATM* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ATMUSDT').askPrice,
                sell: +paribu.ATM_TL.highestBid,
                result: (+paribu.ATM_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ATMUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.ASR_TL)
            pairs.push({
                title: 'ASR* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ASRUSDT').askPrice,
                sell: +paribu.ASR_TL.highestBid,
                result: (+paribu.ASR_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ASRUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });


        if (paribu.REEF_TL)
            pairs.push({
                title: 'REEF* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'REEFUSDT').askPrice,
                sell: +paribu.REEF_TL.highestBid,
                result: (+paribu.REEF_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'REEFUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.LRC_TL)
            pairs.push({
                title: 'LRC* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'LRCUSDT').askPrice,
                sell: +paribu.LRC_TL.highestBid,
                result: (+paribu.LRC_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'LRCUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.BAR_TL && binance.find(x => x.symbol === 'BARUSDT'))
            pairs.push({
                title: 'BAR* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'BARUSDT').askPrice,
                sell: +paribu.BAR_TL.highestBid,
                result: (+paribu.BAR_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BARUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.AAVE_TL)
            pairs.push({
                title: 'AAVE* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'AAVEUSDT').askPrice,
                sell: +paribu.AAVE_TL.highestBid,
                result: (+paribu.AAVE_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AAVEUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.AVAX_TL)
            pairs.push({
                title: 'AVAX* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'AVAXUSDT').askPrice,
                sell: +paribu.AVAX_TL.highestBid,
                result: (+paribu.AVAX_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AVAXUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.OMG_TL)
            pairs.push({
                title: 'OMG* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'OMGUSDT').askPrice,
                sell: +paribu.OMG_TL.highestBid,
                result: (+paribu.OMG_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'OMGUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.RVN_TL)
            pairs.push({
                title: 'RVN* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'RVNUSDT').askPrice,
                sell: +paribu.RVN_TL.highestBid,
                result: (+paribu.RVN_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'RVNUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.XTZ_TL)
            pairs.push({
                title: 'XTZ* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'XTZUSDT').askPrice,
                sell: +paribu.XTZ_TL.highestBid,
                result: (+paribu.XTZ_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'XTZUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.MKR_TL)
            pairs.push({
                title: 'MKR* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'MKRUSDT').askPrice,
                sell: +paribu.MKR_TL.highestBid,
                result: (+paribu.MKR_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'MKRUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.ATOM_TL)
            pairs.push({
                title: 'ATOM* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ATOMUSDT').askPrice,
                sell: +paribu.ATOM_TL.highestBid,
                result: (+paribu.ATOM_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ATOMUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.ONT_TL)
            pairs.push({
                title: 'ONT* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ONTUSDT').askPrice,
                sell: +paribu.ONT_TL.highestBid,
                result: (+paribu.ONT_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ONTUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.DOT_TL)
            pairs.push({
                title: 'DOT* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'DOTUSDT').askPrice,
                sell: +paribu.DOT_TL.highestBid,
                result: (+paribu.DOT_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'DOTUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        pairs.push({
            title: 'BTC* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'BTCUSDT').askPrice,
            sell: +paribu.BTC_TL.highestBid,
            result: (+paribu.BTC_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTCUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'ETH* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'ETHUSDT').askPrice,
            sell: +paribu.ETH_TL.highestBid,
            result: (+paribu.ETH_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ETHUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'XRP* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'XRPUSDT').askPrice,
            sell: +paribu.XRP_TL.highestBid,
            result: (+paribu.XRP_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XRPUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'LTC* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'LTCUSDT').askPrice,
            sell: +paribu.LTC_TL.highestBid,
            result: (+paribu.LTC_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LTCUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({

            title: 'XLM* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'XLMUSDT').askPrice,
            sell: +paribu.XLM_TL.highestBid,
            result: (+paribu.XLM_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XLMUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'EOS* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'EOSUSDT').askPrice,
            sell: +paribu.EOS_TL.highestBid,
            result: (+paribu.EOS_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'EOSUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({

            title: 'BAT* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'BATUSDT').askPrice,
            sell: +paribu.BAT_TL.highestBid,
            result: (+paribu.BAT_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BATUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'BTT* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'BTTUSDT').askPrice,
            sell: +paribu.BTT_TL.highestBid,
            result: (+paribu.BTT_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTTUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'TRX* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'TRXUSDT').askPrice,
            sell: +paribu.TRX_TL.highestBid,
            result: (+paribu.TRX_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'TRXUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'HOT* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'HOTUSDT').askPrice,
            sell: +paribu.HOT_TL.highestBid,
            result: (+paribu.HOT_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'HOTUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'CHZ* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'CHZUSDT').askPrice,
            sell: +paribu.CHZ_TL.highestBid,
            result: (+paribu.CHZ_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'CHZUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'ADA* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'ADAUSDT').askPrice,
            sell: +paribu.ADA_TL.highestBid,
            result: (+paribu.ADA_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ADAUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'NEO* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'NEOUSDT').askPrice,
            sell: +paribu.NEO_TL.highestBid,
            result: (+paribu.NEO_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'NEOUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        if (paribu.LINK_TL)
            pairs.push({
                title: 'LINK* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'LINKUSDT').askPrice,
                sell: +paribu.LINK_TL.highestBid,
                result: (+paribu.LINK_TL.highestBid * (1 - commissionWithBinance)) /
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
                result: (+paribu.DOGE_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'DOGEUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });
        if (binance.some(x => x.symbol === 'WAVESUSDT'))
            pairs.push({
                title: 'WAVES* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'WAVESUSDT').askPrice,
                sell: +paribu.WAVES_TL.highestBid,
                result: (+paribu.WAVES_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'WAVESUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });
        pairs.push({
            title: 'USDT* - PARIBU',
            commission: commissionWithBinanceUSDT,
            buy: 1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice,
            sell: +paribu.USDT_TL.highestBid,
            result: (+paribu.USDT_TL.highestBid * (1 - commissionWithBinanceUSDT)) /
                (1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
    }




    if (btcturk.some(x => x.pair === 'DOTTRY'))
        pairs.push({
            title: 'DOT* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'DOTUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'DOTTRY').bid,
            result: (+btcturk.find(x => x.pair === 'DOTTRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'DOTUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });




    if (btcturk.some(x => x.pair === 'AVAXTRY'))
        pairs.push({
            title: 'AVAX* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'AVAXUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'AVAXTRY').bid,
            result: (+btcturk.find(x => x.pair === 'AVAXTRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'AVAXUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });



    if (btcturk.some(x => x.pair === 'EOSTRY'))
        pairs.push({
            title: 'EOS* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'EOSUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'EOSTRY').bid,
            result: (+btcturk.find(x => x.pair === 'EOSTRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'EOSUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });



    if (btcturk.some(x => x.pair === 'LINKTRY'))
        pairs.push({
            title: 'LINK* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'LINKUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'LINKTRY').bid,
            result: (+btcturk.find(x => x.pair === 'LINKTRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LINKUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });



    if (btcturk.some(x => x.pair === 'NEOTRY'))
        pairs.push({
            title: 'NEO* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'NEOUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'NEOTRY').bid,
            result: (+btcturk.find(x => x.pair === 'NEOTRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'NEOUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });



    if (btcturk.some(x => x.pair === 'TRXTRY'))
        pairs.push({
            title: 'TRX* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'TRXUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'TRXTRY').bid,
            result: (+btcturk.find(x => x.pair === 'TRXTRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'TRXUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });



    if (btcturk.some(x => x.pair === 'XTZTRY'))
        pairs.push({
            title: 'XTZ* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'XTZUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'XTZTRY').bid,
            result: (+btcturk.find(x => x.pair === 'XTZTRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XTZUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });




    if (btcturk.some(x => x.pair === 'ADATRY'))
        pairs.push({
            title: 'ADA* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'ADAUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'ADATRY').bid,
            result: (+btcturk.find(x => x.pair === 'ADATRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ADAUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });



    if (btcturk.some(x => x.pair === 'ATOMTRY'))
        pairs.push({
            title: 'ATOM* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'ATOMUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'ATOMTRY').bid,
            result: (+btcturk.find(x => x.pair === 'ATOMTRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ATOMUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });


    if (btcturk.some(x => x.pair === 'DASHTRY'))
        pairs.push({
            title: 'DASH* - BTCTURK',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'DASHUSDT').askPrice,
            sell: +btcturk.find(x => x.pair === 'DASHTRY').bid,
            result: (+btcturk.find(x => x.pair === 'DASHTRY').bid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'DASHUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });




    pairs.push({
        title: 'BTC* - BTCTURK',
        commission: commissionWithBinance,
        buy: +binance.find(x => x.symbol === 'BTCUSDT').askPrice,
        sell: +btcturk.find(x => x.pair === 'BTCTRY').bid,
        result: (+btcturk.find(x => x.pair === 'BTCTRY').bid * (1 - commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'BTCUSDT').askPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
    pairs.push({
        title: 'ETH* - BTCTURK',
        commission: commissionWithBinance,
        buy: +binance.find(x => x.symbol === 'ETHUSDT').askPrice,
        sell: +btcturk.find(x => x.pair === 'ETHTRY').bid,
        result: (+btcturk.find(x => x.pair === 'ETHTRY').bid * (1 - commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'ETHUSDT').askPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
    pairs.push({
        title: 'XRP* - BTCTURK',
        commission: commissionWithBinance,
        buy: +binance.find(x => x.symbol === 'XRPUSDT').askPrice,
        sell: +btcturk.find(x => x.pair === 'XRPTRY').bid,
        result: (+btcturk.find(x => x.pair === 'XRPTRY').bid * (1 - commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'XRPUSDT').askPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
    pairs.push({
        title: 'LTC* - BTCTURK',
        commission: commissionWithBinance,
        buy: +binance.find(x => x.symbol === 'LTCUSDT').askPrice,
        sell: +btcturk.find(x => x.pair === 'LTCTRY').bid,
        result: (+btcturk.find(x => x.pair === 'LTCTRY').bid * (1 - commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'LTCUSDT').askPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
    pairs.push({
        title: 'XLM* - BTCTURK',
        commission: commissionWithBinance,
        buy: +binance.find(x => x.symbol === 'XLMUSDT').askPrice,
        sell: +btcturk.find(x => x.pair === 'XLMTRY').bid,
        result: (+btcturk.find(x => x.pair === 'XLMTRY').bid * (1 - commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'XLMUSDT').askPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });
    pairs.push({
        title: 'USDT* - BTCTURK',
        commission: commissionWithBinanceUSDT,
        buy: 1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice,
        sell: +btcturk.find(x => x.pair === 'USDTTRY').bid,
        result: (+btcturk.find(x => x.pair === 'USDTTRY').bid * (1 - commissionWithBinanceUSDT)) /
            (1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
    });

    
    res.send(
        pairs
        .sort((a, b) => b.result - a.result)
        .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result),
    );
});

app.get('/coinbasereverse', async (req, res) => {
    let pairs = [];
    let commission = 0.004;
    let commissionWithBinance = 0.004;
    let commissionWithBinanceUSDT = 0.003;

   
    let binance = await fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json());

    let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => console.log(x));

    let btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => console.log(x));


    if (paribu) {



        if (paribu.BAL_TL)
            pairs.push({
                title: 'BAL* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'BALUSDT').bidPrice,
                buy: +paribu.BAL_TL.lowestAsk,
                result: (+paribu.BAL_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BALUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });




        if (paribu.ATM_TL)
            pairs.push({
                title: 'ATM* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ATMUSDT').bidPrice,
                buy: +paribu.ATM_TL.lowestAsk,
                result: (+paribu.ATM_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ATMUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });




        if (paribu.ASR_TL)
            pairs.push({
                title: 'ASR* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ASRUSDT').bidPrice,
                buy: +paribu.ASR_TL.lowestAsk,
                result: (+paribu.ASR_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ASRUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });


        if (paribu.REEF_TL)
            pairs.push({
                title: 'REEF* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'REEFUSDT').bidPrice,
                buy: +paribu.REEF_TL.lowestAsk,
                result: (+paribu.REEF_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'REEFUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });


        if (paribu.LRC_TL)
            pairs.push({
                title: 'LRC* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'LRCUSDT').bidPrice,
                buy: +paribu.LRC_TL.lowestAsk,
                result: (+paribu.LRC_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'LRCUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });





        if (paribu.BAR_TL && binance.find(x => x.symbol === 'BARUSDT'))
            pairs.push({
                title: 'BAR* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'BARUSDT').bidPrice,
                buy: +paribu.BAR_TL.lowestAsk,
                result: (+paribu.BAR_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BARUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });


        if (paribu.UNI_TL)
            pairs.push({
                title: 'UNI* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'UNIUSDT').bidPrice,
                buy: +paribu.UNI_TL.lowestAsk,
                result: (+paribu.UNI_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'UNIUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });

        if (paribu.AAVE_TL)
            pairs.push({
                title: 'AAVE* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'AAVEUSDT').bidPrice,
                buy: +paribu.AAVE_TL.lowestAsk,
                result: (+paribu.AAVE_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AAVEUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });



        if (paribu.AVAX_TL)
            pairs.push({
                title: 'AVAX* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'AVAXUSDT').bidPrice,
                buy: +paribu.AVAX_TL.lowestAsk,
                result: (+paribu.AVAX_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AVAXUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });


        if (paribu.OMG_TL)
            pairs.push({
                title: 'OMG* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'OMGUSDT').bidPrice,
                buy: +paribu.OMG_TL.lowestAsk,
                result: (+paribu.OMG_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'OMGUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });




        if (paribu.XTZ_TL)
            pairs.push({
                title: 'XTZ* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'XTZUSDT').bidPrice,
                buy: +paribu.XTZ_TL.lowestAsk,
                result: (+paribu.XTZ_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'XTZUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });




        if (paribu.MKR_TL)
            pairs.push({
                title: 'MKR* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'MKRUSDT').bidPrice,
                buy: +paribu.MKR_TL.lowestAsk,
                result: (+paribu.MKR_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'MKRUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });



        if (paribu.RVN_TL)
            pairs.push({
                title: 'RVN* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'RVNUSDT').bidPrice,
                buy: +paribu.RVN_TL.lowestAsk,
                result: (+paribu.RVN_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'RVNUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });




        if (paribu.ATOM_TL)
            pairs.push({
                title: 'ATOM* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ATOMUSDT').bidPrice,
                buy: +paribu.ATOM_TL.lowestAsk,
                result: (+paribu.ATOM_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ATOMUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });


        if (paribu.DOT_TL)
            pairs.push({
                title: 'DOT* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'DOTUSDT').bidPrice,
                buy: +paribu.DOT_TL.lowestAsk,
                result: (+paribu.DOT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'DOTUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });



        if (paribu.ONT_TL)
            pairs.push({
                title: 'ONT* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ONTUSDT').bidPrice,
                buy: +paribu.ONT_TL.lowestAsk,
                result: (+paribu.ONT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ONTUSDT').bidPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });




        pairs.push({
            title: 'BTC* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'BTCUSDT').bidPrice,
            buy: +paribu.BTC_TL.lowestAsk,
            result: (+paribu.BTC_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTCUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'ETH* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'ETHUSDT').bidPrice,
            buy: +paribu.ETH_TL.lowestAsk,
            result: (+paribu.ETH_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ETHUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'XRP* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'XRPUSDT').bidPrice,
            buy: +paribu.XRP_TL.lowestAsk,
            result: (+paribu.XRP_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XRPUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'LTC* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'LTCUSDT').bidPrice,
            buy: +paribu.LTC_TL.lowestAsk,
            result: (+paribu.LTC_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LTCUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'XLM* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'XLMUSDT').bidPrice,
            buy: +paribu.XLM_TL.lowestAsk,
            result: (+paribu.XLM_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XLMUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'EOS* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'EOSUSDT').bidPrice,
            buy: +paribu.EOS_TL.lowestAsk,
            result: (+paribu.EOS_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'EOSUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'BAT* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'BATUSDT').bidPrice,
            buy: +paribu.BAT_TL.lowestAsk,
            result: (+paribu.BAT_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BATUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'BTT* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'BTTUSDT').bidPrice,
            buy: +paribu.BTT_TL.lowestAsk,
            result: (+paribu.BTT_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTTUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'TRX* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'TRXUSDT').bidPrice,
            buy: +paribu.TRX_TL.lowestAsk,
            result: (+paribu.TRX_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'TRXUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'HOT* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'HOTUSDT').bidPrice,
            buy: +paribu.HOT_TL.lowestAsk,
            result: (+paribu.HOT_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'HOTUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'CHZ* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'CHZUSDT').bidPrice,
            buy: +paribu.CHZ_TL.lowestAsk,
            result: (+paribu.CHZ_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'CHZUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'ADA* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'ADAUSDT').bidPrice,
            buy: +paribu.ADA_TL.lowestAsk,
            result: (+paribu.ADA_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ADAUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'NEO* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'NEOUSDT').bidPrice,
            buy: +paribu.NEO_TL.lowestAsk,
            result: (+paribu.NEO_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'NEOUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        pairs.push({
            title: 'LINK* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'LINKUSDT').bidPrice,
            buy: +paribu.LINK_TL.lowestAsk,
            result: (+paribu.LINK_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LINKUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
        if (binance.some(x => x.symbol === 'DOGEUSDT'))
            pairs.push({
                title: 'DOGE* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'DOGEUSDT').bidPrice,
                buy: +paribu.DOGE_TL.lowestAsk,
                result: (+paribu.DOGE_TL.lowestAsk * (1 + commissionWithBinance)) /
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
                result: (+paribu.WAVES_TL.lowestAsk * (1 + commissionWithBinance)) /
                    ((binance.find(x => x.symbol === 'WAVESBTC').bidPrice *
                            binance.find(x => x.symbol === 'BTCUSDT').bidPrice) /
                        +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
            });
        pairs.push({
            title: 'USDT* - PARIBU',
            commission: commissionWithBinanceUSDT,
            sell: 1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice,
            buy: +paribu.USDT_TL.lowestAsk,
            result: (+paribu.USDT_TL.lowestAsk * (1 + commissionWithBinanceUSDT)) /
                (1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });
    }



    if (btcturk.some(x => x.pair === 'ADATRY'))
        pairs.push({
            title: 'ADA* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'ADAUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'ADATRY').ask,
            result: (+btcturk.find(x => x.pair === 'ADATRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ADAUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });


    if (btcturk.some(x => x.pair === 'ATOMTRY'))
        pairs.push({
            title: 'ATOM* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'ATOMUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'ATOMTRY').ask,
            result: (+btcturk.find(x => x.pair === 'ATOMTRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ATOMUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });


    if (btcturk.some(x => x.pair === 'DASHTRY'))
        pairs.push({
            title: 'DASH* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'DASHUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'DASHTRY').ask,
            result: (+btcturk.find(x => x.pair === 'DASHTRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'DASHUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });




    if (btcturk.some(x => x.pair === 'DOTTRY'))
        pairs.push({
            title: 'DOT* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'DOTUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'DOTTRY').ask,
            result: (+btcturk.find(x => x.pair === 'DOTTRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'DOTUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });


        if (btcturk.some(x => x.pair === 'AVAXTRY'))
        pairs.push({
            title: 'AVAX* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'AVAXUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'AVAXTRY').ask,
            result: (+btcturk.find(x => x.pair === 'AVAXTRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'AVAXUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });



    if (btcturk.some(x => x.pair === 'EOSTRY'))
        pairs.push({
            title: 'EOS* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'EOSUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'EOSTRY').ask,
            result: (+btcturk.find(x => x.pair === 'EOSTRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'EOSUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });




    if (btcturk.some(x => x.pair === 'LINKTRY'))
        pairs.push({
            title: 'LINK* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'LINKUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'LINKTRY').ask,
            result: (+btcturk.find(x => x.pair === 'LINKTRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LINKUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });


    if (btcturk.some(x => x.pair === 'NEOTRY'))
        pairs.push({
            title: 'NEO* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'NEOUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'NEOTRY').ask,
            result: (+btcturk.find(x => x.pair === 'NEOTRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'NEOUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });




    if (btcturk.some(x => x.pair === 'TRXTRY'))
        pairs.push({
            title: 'TRX* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'TRXUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'TRXTRY').ask,
            result: (+btcturk.find(x => x.pair === 'TRXTRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'TRXUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });


    if (btcturk.some(x => x.pair === 'XTZTRY'))
        pairs.push({
            title: 'XTZ* - BTCTURK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'XTZUSDT').bidPrice,
            buy: +btcturk.find(x => x.pair === 'XTZTRY').ask,
            result: (+btcturk.find(x => x.pair === 'XTZTRY').ask * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XTZUSDT').bidPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        });




    pairs.push({
        title: 'BTC* - BTCTURK',
        commission: commissionWithBinance,
        sell: +binance.find(x => x.symbol === 'BTCUSDT').bidPrice,
        buy: +btcturk.find(x => x.pair === 'BTCTRY').ask,
        result: (+btcturk.find(x => x.pair === 'BTCTRY').ask * (1 + commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'BTCUSDT').bidPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });

    pairs.push({
        title: 'ETH* - BTCTURK',
        commission: commissionWithBinance,
        sell: +binance.find(x => x.symbol === 'ETHUSDT').bidPrice,
        buy: +btcturk.find(x => x.pair === 'ETHTRY').ask,
        result: (+btcturk.find(x => x.pair === 'ETHTRY').ask * (1 + commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'ETHUSDT').bidPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });



    pairs.push({
        title: 'LTC* - BTCTURK',
        commission: commissionWithBinance,
        sell: +binance.find(x => x.symbol === 'LTCUSDT').bidPrice,
        buy: +btcturk.find(x => x.pair === 'LTCTRY').ask,
        result: (+btcturk.find(x => x.pair === 'LTCTRY').ask * (1 + commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'LTCUSDT').bidPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });


    pairs.push({
        title: 'XLM* - BTCTURK',
        commission: commissionWithBinance,
        sell: +binance.find(x => x.symbol === 'XLMUSDT').bidPrice,
        buy: +btcturk.find(x => x.pair === 'XLMTRY').ask,
        result: (+btcturk.find(x => x.pair === 'XLMTRY').ask * (1 + commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'XLMUSDT').bidPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });


    pairs.push({
        title: 'XRP* - BTCTURK',
        commission: commissionWithBinance,
        sell: +binance.find(x => x.symbol === 'XRPUSDT').bidPrice,
        buy: +btcturk.find(x => x.pair === 'XRPTRY').ask,
        result: (+btcturk.find(x => x.pair === 'XRPTRY').ask * (1 + commissionWithBinance)) /
            (+binance.find(x => x.symbol === 'XRPUSDT').bidPrice /
                +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });


    pairs.push({
        title: 'USDT* - BTCTURK',
        commission: commissionWithBinanceUSDT,
        sell: 1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice,
        buy: +btcturk.find(x => x.pair === 'USDTTRY').ask,
        result: (+btcturk.find(x => x.pair === 'USDTTRY').ask * (1 + commissionWithBinanceUSDT)) /
            (1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
    });

    res.send(
        pairs
        .sort((a, b) => a.result - b.result)
        .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result),
    );
});

app.listen(process.env.PORT || 3001, () => console.log('listening..'));

process.on('uncaughtException', function(err) {
    p.send({
            message: err,
        },
        function(err, result) {},
    );
});