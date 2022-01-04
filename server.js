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

app.get('/tetherTask', async (req, res) => {
    // let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => {});
    // tetherBuy = +paribu.USDT_TL.lowestAsk + tetherMargin;


    paribu = await fetch('https://v3.paribu.com/app/markets/usdt-tl?interval=1000').then(r => r.json()).catch(x => {});            
    let book = paribu.data.orderBook.sell || {};

    let tetherEnergy = 40000;
    let tetherResult = -1;
    Object.keys(book).forEach((key,item) => { 
        tetherEnergy = tetherEnergy - book[key];
      if (tetherEnergy < 0 && tetherResult == -1) {
        tetherResult = Number(key); 
      }
    })
    if(tetherResult === -1) {
        tetherBuy = 99;
    } else {
        tetherBuy = +tetherResult + tetherMargin;    
    }
    

    res.send(
        {}
    );
});

setInterval(() => {
    fetch('http://18.222.16.156:3000/tetherTask')
        .then(response => response.json());
}, 5000);

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

//a5ff7dc6e98f9c42ef347e296beaa237
//547f1508205c1568706666c56bc02f4e
//dbd68dd34460118330481bafbcc9740d

let kur = 8.5;
setInterval(() => {
    fetch('http://data.fixer.io/api/latest?access_key=4a267b6b3eaa5f8fd0a2e9e08852741b')
        .then(response => response.json())
        .then(data => {
            kur = data.rates.TRY / data.rates.USD;
        })
        .catch(x => {
            {};
        });
}, 3600000);

var Push = require('pushover-notifications');

var p = new Push({
    user: 'g6qgivbzbg1nrakurqaaecmwrmcaxj',
    token: 'aimiivzn6eh82mih6n21vu347aneum',
});


var pp = new Push({
    user: 'gejk4fxmy5295mfw9bff3efvej9f7r',
    token: 'anehcwe5dwzpgboqmrxzy83hmy5fth',
    //acch1inzyi21vzny7ow1io4fx6rc6u anehcwe5dwzpgboqmrxzy83hmy5fth
});

var cc = new Push({
    user: 'g7dfgagzdk8ngeknnbxz1trgwjzk79',
    token: 'ariy3tcfr165zs3xxjjz1ezyyutqjs',
    //aqoyrmbrtmau2q7jfjobgo6p7sa4om ariy3tcfr165zs3xxjjz1ezyyutqjs
});

var ee = new Push({
    user: 'gejk4fxmy5295mfw9bff3efvej9f7r',
    token: 'a6bb3vhq67aewvaego3nyguc2f9q9z',
});


let profitMargin = -1;
let tetherBuy = -1;
let tetherMargin = 0;
let profitMarginReverse = 0.05;
let text = '';
let myAlarm = 0;
let alarmCaldiMi = 0;
let hataAlarmiSustur = 1;
let ticksizAlarm= 0.10;
let toplamEmirTl= 30000;
let artibirkr = ["OXT", "LINK", "AAVE", "UNI", "BAL", "MKR"];
let eksibirkr = ["DOGE", "WAVES", "BTT"]

setInterval(async function(){
    
    if(alarmCaldiMi === 1) return;
    
    let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => {});
    let tetheriniz = +paribu.USDT_TL.lowestAsk + 0.1;

    fetch('http://ec2-18-222-16-156.us-east-2.compute.amazonaws.com:3000/v2/coinbase')
    .then(response => response.json())
    .then(data => {


        data.filter(pair => (pair.title.includes("BTCTURK") 
                             && !pair.title.includes("xxxx") 
                             && !pair.title.includes("bbbbbb") 
                             && !pair.title.includes("cccccccc") 
                             && !pair.title.includes("ddddddddd") 
                             && !pair.title.includes("xxxxxx")))
            .forEach(pair => {


                if(tetheriniz < pair.result){
                            p.send({
                                    message: "btcturke bi bak",
                                },
                                function(err, result) {
                                    {};
                                },
                            );
                            alarmCaldiMi = 1;
                            setTimeout(function(){
                                alarmCaldiMi = 0;
                            }, 300000);
                    return;
                }
            
            
            });

        });


}, 10000);

let pair_sayisi = 90;
setInterval(async function(){
    
    let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => {});


    

                if(Object.keys(paribu).length > pair_sayisi){
                            p.send({
                                    message: "coin geldi " + Object.keys(paribu).length + " " + Object.keys(paribu)[pair_sayisi],
                                },
                                function(err, result) {
                                    {};
                                },
                            );

                            setTimeout(function(){
                                pair_sayisi = 91;
                            }, 60000);
                }
            



}, 10000);

setTimeout(() => {
    fetch('http://data.fixer.io/api/latest?access_key=547f1508205c1568706666c56bc02f4e')
        .then(response => response.json())
        .then(data => {
            kur = data.rates.TRY / data.rates.USD;
        })
        .catch(x => {
            {};
        });
}, 20000);

app.get('/', (req, res) => {    
    if (req.query.toplamEmirTl) {
        toplamEmirTl = +req.query.toplamEmirTl
    }
    if (req.query.profit) {
        profitMargin = +req.query.profit
        myAlarm = 1;
    }
    if (req.query.ticksizAlarm) {
        ticksizAlarm = +req.query.ticksizAlarm
    }
    if (req.query.tetherMargin) {
        tetherMargin = +req.query.tetherMargin
    }
    if (profitMargin == -1) {
        res.send({
            profitMargin: profitMargin,
            tetherBuyAlertActive: tetherBuy,
            currentAlert: +profitMargin + kur,
            tetherMargin: tetherMargin,
            ticksizAlarm: ticksizAlarm,
            toplamEmirTl: toplamEmirTl
        });

    } else {
        res.send({
            profitMargin: profitMargin,
            currentAlert: +profitMargin + kur,
            ticksizAlarm: ticksizAlarm,
            toplamEmirTl: toplamEmirTl
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

app.get('/reelkur', (req, res) => {

        res.send({
            kur: kur.toFixed(4)
        });
});


app.get('/paribu', (req, res) => {
        fetch('https://www.paribu.com/ticker')
        .then(response => response.json())
        .then(json => res.send(json))
        .catch(e => {});
});

app.get('/btcturk', (req, res) => {
    fetch('https://api.btcturk.com/api/v2/ticker')
        .then(response => response.json())
        .then(json => res.send(json))
        .catch(e => {});
});


async function getWithSymbol(binance, symbol, pairs){
    let paribu;
    try{
        let commission = 0.0065;
        let commissionWithBinance = 0.0065;
        let commissionWithBinanceUSDT = 0.0055;

                if(symbol === "IOTA"){
                    paribu = await fetch('https://v3.paribu.com/app/markets/miota-tl?interval=1000').then(r => r.json()).catch(x => {});

                }else{
        paribu = await fetch('https://v3.paribu.com/app/markets/'+symbol.toLowerCase()+'-tl?interval=1000').then(r => r.json()).catch(x => {});            
                }


        let pariBuyPrice = Object.keys(paribu.data.orderBook.buy)[0];
        let orderBook = paribu.data.orderBook.buy || {};


        if(symbol === "SHIB"){
            pairs.push({
                title: symbol,
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === symbol+'USDT').askPrice * 1000,
                sell: +pariBuyPrice * 1000,
                result: (pariBuyPrice * (1 - commissionWithBinance)) /
                    +binance.find(x => x.symbol === symbol+'USDT').askPrice,
                book: orderBook
            });
        }
        else {

            pairs.push({
                title: symbol,
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === symbol+'USDT').askPrice,
                sell: +pariBuyPrice,
                result: (pariBuyPrice * (1 - commissionWithBinance)) /
                    +binance.find(x => x.symbol === symbol+'USDT').askPrice,
                book: orderBook
            });

        }
    } catch {

    }
}


async function getBtcturk(binance, pairs){
    let btcturk;
    try{



        let commission = 0.0065;
        let commissionWithBinance = 0.0065;
        let commissionWithBinanceUSDT = 0.0055;

        btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => console.log(x));
        
        btcturk.forEach(item => {



            try {
            
            let mySymbol = item.pairNormalized.split("_")[0];
            if(item.pairNormalized.split("_")[1] != "TRY") return;
            
            if (binance.find(x => x.symbol === mySymbol + 'USDT'))
                
                if(mySymbol === 'SHIB'){
                    
                  pairs.push({
                    title: mySymbol + ' - BTCTURK',
                    commission: commissionWithBinance,
                    buy: +binance.find(x => x.symbol === mySymbol + 'USDT').askPrice * 1000,
                    sell: +btcturk.find(x => x.pair === mySymbol + 'TRY').bid * 1000,
                    result: (+btcturk.find(x => x.pair === mySymbol + 'TRY').bid * (1 - commissionWithBinance)) /
                        (+binance.find(x => x.symbol === mySymbol + 'USDT').askPrice ),
                 });
                    
                
                
                
                } else {
                    
                 pairs.push({
                    title: mySymbol + ' - BTCTURK',
                    commission: commissionWithBinance,
                    buy: +binance.find(x => x.symbol === mySymbol + 'USDT').askPrice,
                    sell: +btcturk.find(x => x.pair === mySymbol + 'TRY').bid,
                    result: (+btcturk.find(x => x.pair === mySymbol + 'TRY').bid * (1 - commissionWithBinance)) /
                        (+binance.find(x => x.symbol === mySymbol + 'USDT').askPrice ),
                 });
                    
                    
                }
                
               
                


            
            
            
            
            
            }
            catch{}



        });

    } catch {

    }
}

async function getBox(gate, symbol, pairs){
    try{
    let paribu; 
    
        let commission = 0.02;

        paribu = await fetch('https://v3.paribu.com/app/markets/'+symbol.toLowerCase()+'-tl?interval=1000').then(r => r.json()).catch(x => {});            

        let pariBuyPrice = Object.keys(paribu.data.orderBook.buy)[0];
        let orderBook = paribu.data.orderBook.buy || {};

        item = gate.find(x => x.currency_pair === symbol + "_USDT");
    
        pairs.push({
            title: symbol + ' - GATE',
            commission: commission,
            buy: +item.lowest_ask,
            sell: +pariBuyPrice,
            result: (pariBuyPrice * (1 - commission)) /
                +item.lowest_ask,
            book: orderBook
        });
    } catch {

    }

}

async function binanceTask() {
    return fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json()).catch(x => {console.log("binance get failed\n")})
}

async function gateTask() {
    return fetch('https://api.gateio.ws/api/v4/spot/tickers?currency_pair=CEEK_USDT').then(r => r.json()).catch(x => console.log('ceek gate failied'));
    // return {};
}

async function gateTaskRaca() {
    return fetch('https://api.gateio.ws/api/v4/spot/tickers?currency_pair=RACA_USDT').then(r => r.json()).catch(x => console.log('raca gate failied'));
    // return {};
}


async function gateTaskAtlas() {
    return fetch('https://api.gateio.ws/api/v4/spot/tickers?currency_pair=ATLAS_USDT').then(r => r.json()).catch(x => console.log('atlas gate failied'));
    // return {};
}



app.get('/v2/coinbase', async (req, res) => {
    let pairs = [];

    // let binance = await fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json()).catch(x => {console.log("binance get failed\n")});
    // let gate = await fetch('https://api.gateio.ws/api/v4/spot/tickers').then(r => r.json()).catch(x => console.log('gate failied'));
    const [binance, gate, gateRaca, gateAtlas] = await Promise.all([binanceTask(), gateTask(), gateTaskRaca(), gateTaskAtlas()]);


    await Promise.all([
            getWithSymbol(binance, 'UNI', pairs),
            getWithSymbol(binance, 'BAL', pairs),
            getWithSymbol(binance, 'REEF', pairs),
            getWithSymbol(binance, 'BAND', pairs),
            getWithSymbol(binance, 'LRC', pairs),
            getWithSymbol(binance, 'AAVE', pairs),
            getWithSymbol(binance, 'AVAX', pairs),
            getWithSymbol(binance, 'OMG', pairs),
            getWithSymbol(binance, 'RVN', pairs),
            getWithSymbol(binance, 'XTZ', pairs),
            getWithSymbol(binance, 'MKR', pairs),
            getWithSymbol(binance, 'ATOM', pairs),
            getWithSymbol(binance, 'ONT', pairs),
            getWithSymbol(binance, 'DOT', pairs),
            getWithSymbol(binance, 'BTC', pairs),
            getWithSymbol(binance, 'ETH', pairs),
            getWithSymbol(binance, 'XRP', pairs),
            getWithSymbol(binance, 'LTC', pairs),
            getWithSymbol(binance, 'XLM', pairs),
            getWithSymbol(binance, 'EOS', pairs),
            getWithSymbol(binance, 'BAT', pairs),
            getWithSymbol(binance, 'BTT', pairs),
            getWithSymbol(binance, 'TRX', pairs),
            getWithSymbol(binance, 'HOT', pairs),
            getWithSymbol(binance, 'CHZ', pairs),
            getWithSymbol(binance, 'ADA', pairs),
            getWithSymbol(binance, 'NEO', pairs),
            getWithSymbol(binance, 'LINK', pairs),
            getWithSymbol(binance, 'DOGE', pairs),
            getWithSymbol(binance, 'WAVES', pairs),
            getWithSymbol(binance, 'ZIL', pairs),
            getWithSymbol(binance, 'ENJ', pairs),
            getWithSymbol(binance, 'THETA', pairs),
            getWithSymbol(binance, 'OGN', pairs),
            getWithSymbol(binance, 'ALGO', pairs),
            getWithSymbol(binance, 'GRT', pairs),
            getWithSymbol(binance, 'MATIC', pairs),
            getWithSymbol(binance, 'OXT', pairs),
            getWithSymbol(binance, 'BCH', pairs),
            getWithSymbol(binance, 'CRV', pairs),
            getWithSymbol(binance, 'MANA', pairs),
            getWithSymbol(binance, 'MINA', pairs),
            getWithSymbol(binance, 'IOTA', pairs),
            getWithSymbol(binance, 'SOL', pairs),
            getWithSymbol(binance, 'KEEP', pairs),
            getWithSymbol(binance, 'VET', pairs),
            getWithSymbol(binance, 'ANKR', pairs),
            getWithSymbol(binance, 'SHIB', pairs),
            getWithSymbol(binance, 'ICP', pairs),
            getWithSymbol(binance, 'FTM', pairs),
            getWithSymbol(binance, 'INJ', pairs),
            getWithSymbol(binance, 'LPT', pairs),
            getWithSymbol(binance, 'AXS', pairs),
            getWithSymbol(binance, 'ENS', pairs),
            getWithSymbol(binance, 'AUDIO', pairs),
            getWithSymbol(binance, 'SAND', pairs),
            getWithSymbol(binance, 'CLV', pairs),
            getWithSymbol(binance, 'ALICE', pairs),
            getWithSymbol(binance, 'TLM', pairs),
            getWithSymbol(binance, 'GALA', pairs),
            getWithSymbol(binance, 'TVK', pairs),
            getBtcturk(binance, pairs),
            getBox(gate, 'CEEK', pairs),
            getBox(gateRaca, 'RACA', pairs),
            getBox(gateAtlas, 'ATLAS', pairs)
            // getWithSymbol(binance, 'JUV', pairs),
            // getWithSymbol(binance, 'ATM', pairs),
            // getWithSymbol(binance, 'ASR', pairs),
            // getWithSymbol(binance, 'BAR', pairs),
            // getWithSymbol(binance, 'PSG', pairs)        
        ]);




    res.send(
        pairs
        .sort((a, b) => b.result - a.result)
        .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result),
    );
});

app.get('/vur', (req, res) => {
        console.log("ALARM TEST" + "\n");
        p.send({
            message: "ALARM TEST",
        },
        function(err, result) {
            {};
        },
        );

        res.send({
            kur: kur.toFixed(4)
        });

});

app.get('/coinbase', async (req, res) => {
    let pairs = [];
    let commission = 0.0065;
    let commissionWithBinance = 0.0065;
    let commissionWithBinanceUSDT = 0.0055;


    let binance = await fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json());

    let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => {});
    // let btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => {});


    if (paribu) {

        tetherBuy = +paribu.USDT_TL.lowestAsk + tetherMargin;


        if (paribu.UNI_TL)
            pairs.push({
                title: 'UNI',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'UNIUSDT').askPrice,
                sell: +paribu.UNI_TL.highestBid,
                result: (+paribu.UNI_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'UNIUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });


        if (paribu.BAL_TL)
            pairs.push({
                title: 'BAL',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'BALUSDT').askPrice,
                sell: +paribu.BAL_TL.highestBid,
                result: (+paribu.BAL_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BALUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.ENJ_TL)
            pairs.push({
                title: 'ENJ',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ENJUSDT').askPrice,
                sell: +paribu.ENJ_TL.highestBid,
                result: (+paribu.ENJ_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ENJUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });






        if (paribu.ATM_TL)
            pairs.push({
                title: 'ATM',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ATMUSDT').askPrice,
                sell: +paribu.ATM_TL.highestBid,
                result: (+paribu.ATM_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ATMUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.ASR_TL)
            pairs.push({
                title: 'ASR',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ASRUSDT').askPrice,
                sell: +paribu.ASR_TL.highestBid,
                result: (+paribu.ASR_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ASRUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });


        if (paribu.REEF_TL)
            pairs.push({
                title: 'REEF',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'REEFUSDT').askPrice,
                sell: +paribu.REEF_TL.highestBid,
                result: (+paribu.REEF_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'REEFUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.BAND_TL)
            pairs.push({
                title: 'BAND',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'BANDUSDT').askPrice,
                sell: +paribu.BAND_TL.highestBid,
                result: (+paribu.BAND_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BANDUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });


        if (paribu.LRC_TL)
            pairs.push({
                title: 'LRC',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'LRCUSDT').askPrice,
                sell: +paribu.LRC_TL.highestBid,
                result: (+paribu.LRC_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'LRCUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.BAR_TL && binance.find(x => x.symbol === 'BARUSDT'))
            pairs.push({
                title: 'BAR',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'BARUSDT').askPrice,
                sell: +paribu.BAR_TL.highestBid,
                result: (+paribu.BAR_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BARUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.AAVE_TL)
            pairs.push({
                title: 'AAVE',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'AAVEUSDT').askPrice,
                sell: +paribu.AAVE_TL.highestBid,
                result: (+paribu.AAVE_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AAVEUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.AVAX_TL)
            pairs.push({
                title: 'AVAX',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'AVAXUSDT').askPrice,
                sell: +paribu.AVAX_TL.highestBid,
                result: (+paribu.AVAX_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AVAXUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.OMG_TL)
            pairs.push({
                title: 'OMG',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'OMGUSDT').askPrice,
                sell: +paribu.OMG_TL.highestBid,
                result: (+paribu.OMG_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'OMGUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.RVN_TL)
            pairs.push({
                title: 'RVN',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'RVNUSDT').askPrice,
                sell: +paribu.RVN_TL.highestBid,
                result: (+paribu.RVN_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'RVNUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.XTZ_TL)
            pairs.push({
                title: 'XTZ',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'XTZUSDT').askPrice,
                sell: +paribu.XTZ_TL.highestBid,
                result: (+paribu.XTZ_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'XTZUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.MKR_TL)
            pairs.push({
                title: 'MKR',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'MKRUSDT').askPrice,
                sell: +paribu.MKR_TL.highestBid,
                result: (+paribu.MKR_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'MKRUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.ATOM_TL)
            pairs.push({
                title: 'ATOM',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ATOMUSDT').askPrice,
                sell: +paribu.ATOM_TL.highestBid,
                result: (+paribu.ATOM_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ATOMUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });




        if (paribu.ONT_TL)
            pairs.push({
                title: 'ONT',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ONTUSDT').askPrice,
                sell: +paribu.ONT_TL.highestBid,
                result: (+paribu.ONT_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ONTUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        if (paribu.DOT_TL)
            pairs.push({
                title: 'DOT',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'DOTUSDT').askPrice,
                sell: +paribu.DOT_TL.highestBid,
                result: (+paribu.DOT_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'DOTUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });



        pairs.push({
            title: 'BTC',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'BTCUSDT').askPrice,
            sell: +paribu.BTC_TL.highestBid,
            result: (+paribu.BTC_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTCUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'ETH',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'ETHUSDT').askPrice,
            sell: +paribu.ETH_TL.highestBid,
            result: (+paribu.ETH_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ETHUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'XRP',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'XRPUSDT').askPrice,
            sell: +paribu.XRP_TL.highestBid,
            result: (+paribu.XRP_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XRPUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'LTC',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'LTCUSDT').askPrice,
            sell: +paribu.LTC_TL.highestBid,
            result: (+paribu.LTC_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LTCUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({

            title: 'XLM',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'XLMUSDT').askPrice,
            sell: +paribu.XLM_TL.highestBid,
            result: (+paribu.XLM_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XLMUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'EOS',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'EOSUSDT').askPrice,
            sell: +paribu.EOS_TL.highestBid,
            result: (+paribu.EOS_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'EOSUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({

            title: 'BAT',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'BATUSDT').askPrice,
            sell: +paribu.BAT_TL.highestBid,
            result: (+paribu.BAT_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BATUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'BTT',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'BTTUSDT').askPrice,
            sell: +paribu.BTT_TL.highestBid,
            result: (+paribu.BTT_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTTUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'TRX',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'TRXUSDT').askPrice,
            sell: +paribu.TRX_TL.highestBid,
            result: (+paribu.TRX_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'TRXUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'HOT',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'HOTUSDT').askPrice,
            sell: +paribu.HOT_TL.highestBid,
            result: (+paribu.HOT_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'HOTUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'CHZ',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'CHZUSDT').askPrice,
            sell: +paribu.CHZ_TL.highestBid,
            result: (+paribu.CHZ_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'CHZUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'ADA',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'ADAUSDT').askPrice,
            sell: +paribu.ADA_TL.highestBid,
            result: (+paribu.ADA_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ADAUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        pairs.push({
            title: 'NEO',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === 'NEOUSDT').askPrice,
            sell: +paribu.NEO_TL.highestBid,
            result: (+paribu.NEO_TL.highestBid * (1 - commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'NEOUSDT').askPrice /
                    +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
        if (paribu.LINK_TL)
            pairs.push({
                title: 'LINK',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'LINKUSDT').askPrice,
                sell: +paribu.LINK_TL.highestBid,
                result: (+paribu.LINK_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'LINKUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });

        if (binance.some(x => x.symbol === 'DOGEUSDT'))
            pairs.push({
                title: 'DOGE',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'DOGEUSDT').askPrice,
                sell: +paribu.DOGE_TL.highestBid,
                result: (+paribu.DOGE_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'DOGEUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });
        if (binance.some(x => x.symbol === 'WAVESUSDT'))
            pairs.push({
                title: 'WAVES',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'WAVESUSDT').askPrice,
                sell: +paribu.WAVES_TL.highestBid,
                result: (+paribu.WAVES_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'WAVESUSDT').askPrice /
                        +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
            });
        pairs.push({
            title: 'USDT',
            commission: commissionWithBinanceUSDT,
            buy: 1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice,
            sell: +paribu.USDT_TL.highestBid,
            result: (+paribu.USDT_TL.highestBid * (1 - commissionWithBinanceUSDT)) /
                (1 / +binance.find(x => x.symbol === 'USDCUSDT').bidPrice),
        });
    }

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

    let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => {});

    if (paribu) {





// if (paribu.ATM_TL)
        //     pairs.push({
        //         title: 'ATM',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'ATMUSDT').bidPrice,
        //         buy: +paribu.ATM_TL.lowestAsk,
        //         result: (+paribu.ATM_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'ATMUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });



        // if (paribu.JUV_TL)
        //     pairs.push({
        //         title: 'JUV',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'JUVUSDT').bidPrice,
        //         buy: +paribu.JUV_TL.lowestAsk,
        //         result: (+paribu.JUV_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'JUVUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });



        // if (paribu.ACM_TL)
        //     pairs.push({
        //         title: 'ACM',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'ACMUSDT').bidPrice,
        //         buy: +paribu.ACM_TL.lowestAsk,
        //         result: (+paribu.ACM_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'ACMUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });



        // if (paribu.PSG_TL)
        //     pairs.push({
        //         title: 'PSG',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'PSGUSDT').bidPrice,
        //         buy: +paribu.PSG_TL.lowestAsk,
        //         result: (+paribu.PSG_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'PSGUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });




        // if (paribu.ASR_TL)
        //     pairs.push({
        //         title: 'ASR',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'ASRUSDT').bidPrice,
        //         buy: +paribu.ASR_TL.lowestAsk,
        //         result: (+paribu.ASR_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'ASRUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });

                if (paribu.INJ_TL)
            pairs.push({
                title: 'INJ',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'INJUSDT').bidPrice,
                buy: +paribu.INJ_TL.lowestAsk,
                result: (+paribu.INJ_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'INJUSDT').bidPrice )
            });
        
                if (paribu.ALICE_TL)
            pairs.push({
                title: 'ALICE',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ALICEUSDT').bidPrice,
                buy: +paribu.ALICE_TL.lowestAsk,
                result: (+paribu.ALICE_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ALICEUSDT').bidPrice )
            });
        
                        if (paribu.TVK_TL)
            pairs.push({
                title: 'TVK',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'TVKUSDT').bidPrice,
                buy: +paribu.TVK_TL.lowestAsk,
                result: (+paribu.TVK_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'TVKUSDT').bidPrice )
            });

                        if (paribu.GALA_TL)
            pairs.push({
                title: 'GALA',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'GALAUSDT').bidPrice,
                buy: +paribu.GALA_TL.lowestAsk,
                result: (+paribu.GALA_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'GALAUSDT').bidPrice )
            });

                            if (paribu.TLM_TL)
            pairs.push({
                title: 'TLM',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'TLMUSDT').bidPrice,
                buy: +paribu.TLM_TL.lowestAsk,
                result: (+paribu.TLM_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'TLMUSDT').bidPrice )
            });
        
                if (paribu.LPT_TL)
            pairs.push({
                title: 'LPT',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'LPTUSDT').bidPrice,
                buy: +paribu.LPT_TL.lowestAsk,
                result: (+paribu.LPT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'LPTUSDT').bidPrice )
            });
        
                if (paribu.AUDIO_TL)
            pairs.push({
                title: 'AUDIO',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'AUDIOUSDT').bidPrice,
                buy: +paribu.AUDIO_TL.lowestAsk,
                result: (+paribu.AUDIO_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AUDIOUSDT').bidPrice )
            });
        
                if (paribu.CLV_TL)
            pairs.push({
                title: 'CLV',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'CLVUSDT').bidPrice,
                buy: +paribu.CLV_TL.lowestAsk,
                result: (+paribu.CLV_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'CLVUSDT').bidPrice )
            });
        
                if (paribu.SAND_TL)
            pairs.push({
                title: 'SAND',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'SANDUSDT').bidPrice,
                buy: +paribu.SAND_TL.lowestAsk,
                result: (+paribu.SAND_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'SANDUSDT').bidPrice )
            });
        
        
                if (paribu.AXS_TL)
            pairs.push({
                title: 'AXS',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'AXSUSDT').bidPrice,
                buy: +paribu.AXS_TL.lowestAsk,
                result: (+paribu.AXS_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AXSUSDT').bidPrice )
            });
        
                if (paribu.ENS_TL)
            pairs.push({
                title: 'ENS',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ENSUSDT').bidPrice,
                buy: +paribu.ENS_TL.lowestAsk,
                result: (+paribu.ENS_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ENSUSDT').bidPrice )
            });

                if (paribu.MANA_TL)
            pairs.push({
                title: 'MANA',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'MANAUSDT').bidPrice,
                buy: +paribu.MANA_TL.lowestAsk,
                result: (+paribu.MANA_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'MANAUSDT').bidPrice )
            });
        
                    if (paribu.ANKR_TL)
            pairs.push({
                title: 'ANKR',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ANKRUSDT').bidPrice,
                buy: +paribu.ANKR_TL.lowestAsk,
                result: (+paribu.ANKR_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ANKRUSDT').bidPrice )
            });
        
        
                            if (paribu.SHIB_TL)
            pairs.push({
                title: 'SHIB',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'SHIBUSDT').bidPrice * 1000,
                buy: +paribu.SHIB_TL.lowestAsk * 1000,
                result: (+paribu.SHIB_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'SHIBUSDT').bidPrice )
            });


        
        
                if (paribu.KEEP_TL)
            pairs.push({
                title: 'KEEP',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'KEEPUSDT').bidPrice,
                buy: +paribu.KEEP_TL.lowestAsk,
                result: (+paribu.KEEP_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'KEEPUSDT').bidPrice )
            });
        
                                if (paribu.VET_TL)
            pairs.push({
                title: 'VET',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'VETUSDT').bidPrice,
                buy: +paribu.VET_TL.lowestAsk,
                result: (+paribu.VET_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'VETUSDT').bidPrice )
            });



        if (paribu.CRV_TL)
            pairs.push({
                title: 'CRV',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'CRVUSDT').bidPrice,
                buy: +paribu.CRV_TL.lowestAsk,
                result: (+paribu.CRV_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'CRVUSDT').bidPrice )
            });
       
        if (paribu.ICP_TL)
            pairs.push({
                title: 'ICP',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ICPUSDT').bidPrice,
                buy: +paribu.ICP_TL.lowestAsk,
                result: (+paribu.ICP_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ICPUSDT').bidPrice )
            });
        
                if (paribu.FTM_TL)
            pairs.push({
                title: 'FTM',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'FTMUSDT').bidPrice,
                buy: +paribu.FTM_TL.lowestAsk,
                result: (+paribu.FTM_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'FTMUSDT').bidPrice )
            });
        
                if (paribu.SOL_TL)
            pairs.push({
                title: 'SOL',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'SOLUSDT').bidPrice,
                buy: +paribu.SOL_TL.lowestAsk,
                result: (+paribu.SOL_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'SOLUSDT').bidPrice )
            });
        
                        if (paribu.MINA_TL)
            pairs.push({
                title: 'MINA',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'MINAUSDT').bidPrice,
                buy: +paribu.MINA_TL.lowestAsk,
                result: (+paribu.MINA_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'MINAUSDT').bidPrice )
            });
        

                if (paribu.MIOTA_TL)
            pairs.push({
                title: 'IOTA',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'IOTAUSDT').bidPrice,
                buy: +paribu.MIOTA_TL.lowestAsk,
                result: (+paribu.MIOTA_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'IOTAUSDT').bidPrice )
            });



        if (paribu.BCH_TL)
            pairs.push({
                title: 'BCH',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'BCHUSDT').bidPrice,
                buy: +paribu.BCH_TL.lowestAsk,
                result: (+paribu.BCH_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BCHUSDT').bidPrice )
            });



        if (paribu.GRT_TL)
            pairs.push({
                title: 'GRT',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'GRTUSDT').bidPrice,
                buy: +paribu.GRT_TL.lowestAsk,
                result: (+paribu.GRT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'GRTUSDT').bidPrice )
            });


                if (paribu.OXT_TL)
            pairs.push({
                title: 'OXT',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'OXTUSDT').bidPrice,
                buy: +paribu.OXT_TL.lowestAsk,
                result: (+paribu.OXT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'OXTUSDT').bidPrice )
            });


        if (paribu.MATIC_TL)
            pairs.push({
                title: 'MATIC',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'MATICUSDT').bidPrice,
                buy: +paribu.MATIC_TL.lowestAsk,
                result: (+paribu.MATIC_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'MATICUSDT').bidPrice )
            });


        if (paribu.THETA_TL)
            pairs.push({
                title: 'THETA',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'THETAUSDT').bidPrice,
                buy: +paribu.THETA_TL.lowestAsk,
                result: (+paribu.THETA_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'THETAUSDT').bidPrice )
            });

        if (paribu.OGN_TL)
            pairs.push({
                title: 'OGN',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'OGNUSDT').bidPrice,
                buy: +paribu.OGN_TL.lowestAsk,
                result: (+paribu.OGN_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'OGNUSDT').bidPrice )
            });




        if (paribu.ZIL_TL)
            pairs.push({
                title: 'ZIL',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ZILUSDT').bidPrice,
                buy: +paribu.ZIL_TL.lowestAsk,
                result: (+paribu.ZIL_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ZILUSDT').bidPrice )
            });


        if (paribu.BAL_TL)
            pairs.push({
                title: 'BAL',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'BALUSDT').bidPrice,
                buy: +paribu.BAL_TL.lowestAsk,
                result: (+paribu.BAL_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BALUSDT').bidPrice )
            });


        if (paribu.ENJ_TL)
            pairs.push({
                title: 'ENJ',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ENJUSDT').bidPrice,
                buy: +paribu.ENJ_TL.lowestAsk,
                result: (+paribu.ENJ_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ENJUSDT').bidPrice )
            });


        if (paribu.ALGO_TL)
            pairs.push({
                title: 'ALGO',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ALGOUSDT').bidPrice,
                buy: +paribu.ALGO_TL.lowestAsk,
                result: (+paribu.ALGO_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ALGOUSDT').bidPrice )
            });



        if (paribu.REEF_TL)
            pairs.push({
                title: 'REEF',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'REEFUSDT').bidPrice,
                buy: +paribu.REEF_TL.lowestAsk,
                result: (+paribu.REEF_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'REEFUSDT').bidPrice )
            });

        if (paribu.BAND_TL)
            pairs.push({
                title: 'BAND',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'BANDUSDT').bidPrice,
                buy: +paribu.BAND_TL.lowestAsk,
                result: (+paribu.BAND_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BANDUSDT').bidPrice )
            });



        if (paribu.LRC_TL)
            pairs.push({
                title: 'LRC',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'LRCUSDT').bidPrice,
                buy: +paribu.LRC_TL.lowestAsk,
                result: (+paribu.LRC_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'LRCUSDT').bidPrice )
            });


        if (paribu.UNI_TL)
            pairs.push({
                title: 'UNI',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'UNIUSDT').bidPrice,
                buy: +paribu.UNI_TL.lowestAsk,
                result: (+paribu.UNI_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'UNIUSDT').bidPrice )
            });

        if (paribu.AAVE_TL)
            pairs.push({
                title: 'AAVE',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'AAVEUSDT').bidPrice,
                buy: +paribu.AAVE_TL.lowestAsk,
                result: (+paribu.AAVE_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AAVEUSDT').bidPrice )
            });



        if (paribu.AVAX_TL)
            pairs.push({
                title: 'AVAX',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'AVAXUSDT').bidPrice,
                buy: +paribu.AVAX_TL.lowestAsk,
                result: (+paribu.AVAX_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AVAXUSDT').bidPrice )
            });


        if (paribu.OMG_TL)
            pairs.push({
                title: 'OMG',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'OMGUSDT').bidPrice,
                buy: +paribu.OMG_TL.lowestAsk,
                result: (+paribu.OMG_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'OMGUSDT').bidPrice )
            });




        if (paribu.XTZ_TL)
            pairs.push({
                title: 'XTZ',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'XTZUSDT').bidPrice,
                buy: +paribu.XTZ_TL.lowestAsk,
                result: (+paribu.XTZ_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'XTZUSDT').bidPrice )
            });




        if (paribu.MKR_TL)
            pairs.push({
                title: 'MKR',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'MKRUSDT').bidPrice,
                buy: +paribu.MKR_TL.lowestAsk,
                result: (+paribu.MKR_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'MKRUSDT').bidPrice )
            });



        if (paribu.RVN_TL)
            pairs.push({
                title: 'RVN',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'RVNUSDT').bidPrice,
                buy: +paribu.RVN_TL.lowestAsk,
                result: (+paribu.RVN_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'RVNUSDT').bidPrice )
            });


        if (paribu.ATOM_TL)
            pairs.push({
                title: 'ATOM',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ATOMUSDT').bidPrice,
                buy: +paribu.ATOM_TL.lowestAsk,
                result: (+paribu.ATOM_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ATOMUSDT').bidPrice )
            });


        if (paribu.DOT_TL)
            pairs.push({
                title: 'DOT',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'DOTUSDT').bidPrice,
                buy: +paribu.DOT_TL.lowestAsk,
                result: (+paribu.DOT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'DOTUSDT').bidPrice )
            });



        if (paribu.ONT_TL)
            pairs.push({
                title: 'ONT',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ONTUSDT').bidPrice,
                buy: +paribu.ONT_TL.lowestAsk,
                result: (+paribu.ONT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ONTUSDT').bidPrice )
            });




        pairs.push({
            title: 'BTC',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'BTCUSDT').bidPrice,
            buy: +paribu.BTC_TL.lowestAsk,
            result: (+paribu.BTC_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTCUSDT').bidPrice )
        });
        pairs.push({
            title: 'ETH',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'ETHUSDT').bidPrice,
            buy: +paribu.ETH_TL.lowestAsk,
            result: (+paribu.ETH_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ETHUSDT').bidPrice )
        });
        pairs.push({
            title: 'XRP',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'XRPUSDT').bidPrice,
            buy: +paribu.XRP_TL.lowestAsk,
            result: (+paribu.XRP_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XRPUSDT').bidPrice )
        });
        pairs.push({
            title: 'LTC',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'LTCUSDT').bidPrice,
            buy: +paribu.LTC_TL.lowestAsk,
            result: (+paribu.LTC_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LTCUSDT').bidPrice )
        });
        pairs.push({
            title: 'XLM',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'XLMUSDT').bidPrice,
            buy: +paribu.XLM_TL.lowestAsk,
            result: (+paribu.XLM_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XLMUSDT').bidPrice )
        });
        pairs.push({
            title: 'EOS',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'EOSUSDT').bidPrice,
            buy: +paribu.EOS_TL.lowestAsk,
            result: (+paribu.EOS_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'EOSUSDT').bidPrice )
        });
        pairs.push({
            title: 'BAT',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'BATUSDT').bidPrice,
            buy: +paribu.BAT_TL.lowestAsk,
            result: (+paribu.BAT_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BATUSDT').bidPrice )
        });
        pairs.push({
            title: 'BTT',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'BTTUSDT').bidPrice,
            buy: +paribu.BTT_TL.lowestAsk,
            result: (+paribu.BTT_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTTUSDT').bidPrice )
        });
        pairs.push({
            title: 'TRX',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'TRXUSDT').bidPrice,
            buy: +paribu.TRX_TL.lowestAsk,
            result: (+paribu.TRX_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'TRXUSDT').bidPrice )
        });
        pairs.push({
            title: 'HOT',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'HOTUSDT').bidPrice,
            buy: +paribu.HOT_TL.lowestAsk,
            result: (+paribu.HOT_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'HOTUSDT').bidPrice )
        });
        pairs.push({
            title: 'CHZ',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'CHZUSDT').bidPrice,
            buy: +paribu.CHZ_TL.lowestAsk,
            result: (+paribu.CHZ_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'CHZUSDT').bidPrice )
        });
        pairs.push({
            title: 'ADA',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'ADAUSDT').bidPrice,
            buy: +paribu.ADA_TL.lowestAsk,
            result: (+paribu.ADA_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ADAUSDT').bidPrice )
        });
        pairs.push({
            title: 'NEO',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'NEOUSDT').bidPrice,
            buy: +paribu.NEO_TL.lowestAsk,
            result: (+paribu.NEO_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'NEOUSDT').bidPrice )
        });
        pairs.push({
            title: 'LINK',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'LINKUSDT').bidPrice,
            buy: +paribu.LINK_TL.lowestAsk,
            result: (+paribu.LINK_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LINKUSDT').bidPrice )
        });
        if (binance.some(x => x.symbol === 'DOGEUSDT'))
            pairs.push({
                title: 'DOGE',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'DOGEUSDT').bidPrice,
                buy: +paribu.DOGE_TL.lowestAsk,
                result: (+paribu.DOGE_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'DOGEUSDT').bidPrice )
            });


        if (paribu.WAVES_TL)
            pairs.push({
                title: 'WAVES',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'WAVESBTC').bidPrice,
                buy: +paribu.WAVES_TL.lowestAsk,
                result: (+paribu.WAVES_TL.lowestAsk * (1 + commissionWithBinance)) /
                    ((binance.find(x => x.symbol === 'WAVESBTC').bidPrice *
                            binance.find(x => x.symbol === 'BTCUSDT').bidPrice) )
            });
    }



    // if (btcturk.some(x => x.pair === 'ADATRY'))
    //     pairs.push({
    //         title: 'ADA* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'ADAUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'ADATRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'ADATRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'ADAUSDT').bidPrice )
    //     });


    // if (btcturk.some(x => x.pair === 'ATOMTRY'))
    //     pairs.push({
    //         title: 'ATOM* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'ATOMUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'ATOMTRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'ATOMTRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'ATOMUSDT').bidPrice )
    //     });


    // if (btcturk.some(x => x.pair === 'DASHTRY'))
    //     pairs.push({
    //         title: 'DASH* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'DASHUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'DASHTRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'DASHTRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'DASHUSDT').bidPrice )
    //     });




    // if (btcturk.some(x => x.pair === 'DOTTRY'))
    //     pairs.push({
    //         title: 'DOT* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'DOTUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'DOTTRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'DOTTRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'DOTUSDT').bidPrice )
    //     });


    //     if (btcturk.some(x => x.pair === 'AVAXTRY'))
    //     pairs.push({
    //         title: 'AVAX* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'AVAXUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'AVAXTRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'AVAXTRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'AVAXUSDT').bidPrice )
    //     });



    // if (btcturk.some(x => x.pair === 'EOSTRY'))
    //     pairs.push({
    //         title: 'EOS* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'EOSUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'EOSTRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'EOSTRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'EOSUSDT').bidPrice )
    //     });




    // if (btcturk.some(x => x.pair === 'LINKTRY'))
    //     pairs.push({
    //         title: 'LINK* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'LINKUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'LINKTRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'LINKTRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'LINKUSDT').bidPrice )
    //     });


    // if (btcturk.some(x => x.pair === 'NEOTRY'))
    //     pairs.push({
    //         title: 'NEO* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'NEOUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'NEOTRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'NEOTRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'NEOUSDT').bidPrice )
    //     });




    // if (btcturk.some(x => x.pair === 'TRXTRY'))
    //     pairs.push({
    //         title: 'TRX* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'TRXUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'TRXTRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'TRXTRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'TRXUSDT').bidPrice )
    //     });


    // if (btcturk.some(x => x.pair === 'XTZTRY'))
    //     pairs.push({
    //         title: 'XTZ* - BTCTURK',
    //         commission: commissionWithBinance,
    //         sell: +binance.find(x => x.symbol === 'XTZUSDT').bidPrice,
    //         buy: +btcturk.find(x => x.pair === 'XTZTRY').ask,
    //         result: (+btcturk.find(x => x.pair === 'XTZTRY').ask * (1 + commissionWithBinance)) /
    //             (+binance.find(x => x.symbol === 'XTZUSDT').bidPrice )
    //     });




    // pairs.push({
    //     title: 'BTC* - BTCTURK',
    //     commission: commissionWithBinance,
    //     sell: +binance.find(x => x.symbol === 'BTCUSDT').bidPrice,
    //     buy: +btcturk.find(x => x.pair === 'BTCTRY').ask,
    //     result: (+btcturk.find(x => x.pair === 'BTCTRY').ask * (1 + commissionWithBinance)) /
    //         (+binance.find(x => x.symbol === 'BTCUSDT').bidPrice )
    // });

    // pairs.push({
    //     title: 'ETH* - BTCTURK',
    //     commission: commissionWithBinance,
    //     sell: +binance.find(x => x.symbol === 'ETHUSDT').bidPrice,
    //     buy: +btcturk.find(x => x.pair === 'ETHTRY').ask,
    //     result: (+btcturk.find(x => x.pair === 'ETHTRY').ask * (1 + commissionWithBinance)) /
    //         (+binance.find(x => x.symbol === 'ETHUSDT').bidPrice )
    // });



    // pairs.push({
    //     title: 'LTC* - BTCTURK',
    //     commission: commissionWithBinance,
    //     sell: +binance.find(x => x.symbol === 'LTCUSDT').bidPrice,
    //     buy: +btcturk.find(x => x.pair === 'LTCTRY').ask,
    //     result: (+btcturk.find(x => x.pair === 'LTCTRY').ask * (1 + commissionWithBinance)) /
    //         (+binance.find(x => x.symbol === 'LTCUSDT').bidPrice )
    // });


    // pairs.push({
    //     title: 'XLM* - BTCTURK',
    //     commission: commissionWithBinance,
    //     sell: +binance.find(x => x.symbol === 'XLMUSDT').bidPrice,
    //     buy: +btcturk.find(x => x.pair === 'XLMTRY').ask,
    //     result: (+btcturk.find(x => x.pair === 'XLMTRY').ask * (1 + commissionWithBinance)) /
    //         (+binance.find(x => x.symbol === 'XLMUSDT').bidPrice )
    // });


    // pairs.push({
    //     title: 'XRP* - BTCTURK',
    //     commission: commissionWithBinance,
    //     sell: +binance.find(x => x.symbol === 'XRPUSDT').bidPrice,
    //     buy: +btcturk.find(x => x.pair === 'XRPTRY').ask,
    //     result: (+btcturk.find(x => x.pair === 'XRPTRY').ask * (1 + commissionWithBinance)) /
    //         (+binance.find(x => x.symbol === 'XRPUSDT').bidPrice )
    // });


    // pairs.push({
    //     title: 'USDT* - BTCTURK',
    //     commission: commissionWithBinanceUSDT,
    //     sell: 1 / +binance.find(x => x.symbol === 'USDCUSDT').askPrice,
    //     buy: +btcturk.find(x => x.pair === 'USDTTRY').ask,
    //     result: (+btcturk.find(x => x.pair === 'USDTTRY').ask * (1 + commissionWithBinanceUSDT)) )
    // });

    res.send(
        pairs
        .sort((a, b) => a.result - b.result)
        .filter(pair => pair.title && pair.commission && pair.sell && pair.buy && pair.result),
    );
});

app.listen(3000, () => console.log('listening..'));

process.on('uncaughtException', function(err) {
    p.send({
            message: err,
        },
        function(err, result) {},
    );
});
