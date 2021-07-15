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
    let paribu = await fetch('https://www.paribu.com/ticker').then(r => r.json()).catch(x => console.log(x));
    tetherBuy = +paribu.USDT_TL.lowestAsk + tetherMargin;
    res.send(
        {}
    );
});

app.get('/alarm', async (req, res) => {


    if (kur === 0 && currentAlert !== -1) return;


    fetch('https://ec2-18-222-16-156.us-east-2.compute.amazonaws.com:3000/v2/coinbase')
        .then(response => response.json())
        .then(data => {

            let firsat = {
                message: null,
                bookSum: -1,
            };


            data.forEach(pair => {
                if(tetherBuy > 0 && pair.book && pair.book != {}){
                    let sellAt = (tetherBuy * pair.sell) / pair.result;
                    let bookSum = getBookSum(sellAt, pair.book);
                    if(bookSum > toplamEmirTl){
                        if (
                                pair.result > kur + profitMargin &&
                                alert.some(title => title === pair.title)
                            ) {
                                if (profitMargin == -1) {
                                    if (pair.result > tetherBuy) {

                                        if(bookSum > firsat.bookSum){
                                            firsat.bookSum = bookSum;
                                            firsat.message = pair.title + ": " + sellAt.toString().substring(0, 6) + " <--- " + bookSum.toString().split(".")[0] + " << " + pair.result.toString().substring(0, 5);
                                        }

                                    }
                                    
                                }
                            }
                    }
                }
            });


            if(firsat.message){
                    ee.send({
                        message: firsat.message,
                        sound: 'cashregister',//'none'
                    },
                    function(err, result) {
                        console.log(result);
                    },
                );

            }



        });

    res.send(
        {}
    );
});

setInterval(() => {
    fetch('https://ec2-18-222-16-156.us-east-2.compute.amazonaws.com:3000/tetherTask')
        .then(response => response.json());
}, 30000);

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
    fetch('http://data.fixer.io/api/latest?access_key=a5ff7dc6e98f9c42ef347e296beaa237')
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


var pp = new Push({
    user: 'gejk4fxmy5295mfw9bff3efvej9f7r',
    token: 'acch1inzyi21vzny7ow1io4fx6rc6u',
});

var cc = new Push({
    user: 'g7dfgagzdk8ngeknnbxz1trgwjzk79',
    token: 'aqoyrmbrtmau2q7jfjobgo6p7sa4om',
});

var ee = new Push({
    user: 'gejk4fxmy5295mfw9bff3efvej9f7r',
    token: 'a6bb3vhq67aewvaego3nyguc2f9q9z',
});


let profitMargin = 0.1;
let tetherBuy = -1;
let tetherMargin = 0;
let profitMarginReverse = 0.05;
let text = '';
let myAlarm = 0;
let alarmCaldiMi = 0;
let hataAlarmiSustur = 1;
let ticksizAlarm= 0.10;
let toplamEmirTl= 30000;

cron.schedule('0 5 * * *', () => { tetherMargin = 0; });

setInterval(function(){
    alarmCaldiMi = 0;
}, 600000);


setInterval(() => {


    if (alarmCaldiMi === 1) return;

    if(myAlarm === 0){
        p.send({
                message: "ALARM BOZULDU",
            },
            function(err, result) {
                console.log(result);
            },
        );
        alarmCaldiMi = 1;
        setTimeout(function(){
            alarmCaldiMi = 0;
        }, 30000);
        return;
    }




    if (kur === 0 && currentAlert !== -1) return;
    text = '';




    fetch('https://ec2-18-222-16-156.us-east-2.compute.amazonaws.com:3000/coinbasereverse')
        .then(response => response.json())
        .then(data => {
            data.forEach(pair => {
                if (
                    pair.result < tetherBuy - profitMarginReverse &&
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
                    alarmCaldiMi = 1;
                    setTimeout(function(){
                        alarmCaldiMi = 0;
                    }, 30000);
                    return;
                }

                if (
                    pair.result < tetherBuy - (ticksizAlarm*2) &&
                    text === '' &&
                    !alertReverse.some(title => title === pair.title)
                ) {
                    text = "ticksizTersAlarm: " + pair.title + ": " + pair.result.toString().substring(0, 5);
                    p.send({
                            message: text,
                        },
                        function(err, result) {
                            console.log(result);
                        },
                    );
                    alarmCaldiMi = 1;
                    setTimeout(function(){
                        alarmCaldiMi = 0;
                    }, 30000);
                    return;
                }
            }); 
        });


    fetch('https://ec2-18-222-16-156.us-east-2.compute.amazonaws.com:3000/v2/coinbase')
        .then(response => response.json())
        .then(data => {


            data.forEach(pair => {



                if(tetherBuy > 0 && pair.book && pair.book != {}){
                    let sellAt = (tetherBuy * pair.sell) / pair.result;
                    let bookSum = getBookSum(sellAt, pair.book);
                    if(bookSum > toplamEmirTl){
                        




                        if (
                                pair.result > kur + profitMargin &&
                                text === '' &&
                                alert.some(title => title === pair.title)
                            ) {
                                // text = pair.title + ": " +  + " (sell:" + sellAt.toString().substring(0, 6) + ") Total: " + bookSum.toString().split(".")[0];
                                text = pair.title + ": " + sellAt.toString().substring(0, 6) + " <--- " + bookSum.toString().split(".")[0] + " << " + pair.result.toString().substring(0, 5);
                                if (profitMargin == -1) {
                                    if (pair.result > tetherBuy) {
                                        alarmCaldiMi = 1;
                                        setTimeout(function(){
                                            alarmCaldiMi = 0;
                                        }, 30000);

                                        setTimeout(function(){
                                                cc.send({
                                                    message: text,
                                                },
                                                function(err, result) {
                                                    console.log(result);
                                                },
                                            );
                                        }, 3000);

                                        pp.send({
                                                message: text,
                                            },
                                            function(err, result) {
                                                console.log(result);
                                            },
                                        );


                                        return;
                                    }
                                    
                                } else {

                                    p.send({
                                            message: text,
                                        },
                                        function(err, result) {
                                            console.log(result);
                                        },
                                    );
                                    alarmCaldiMi = 1;
                                    setTimeout(function(){
                                        alarmCaldiMi = 0;
                                    }, 30000);
                                    return;
                                }
                            }

                            if (
                                pair.result > tetherBuy + ticksizAlarm &&
                                text === '' &&
                                !alert.some(title => title === pair.title)
                            ) {
                                text = "ticksizAlarm: " + pair.title + ": " + pair.result.toString().substring(0, 5) + " (sell:" + pair.sell.toString().substring(0, 6) + ")";
                                p.send({
                                        message: text,
                                    },
                                    function(err, result) {
                                        console.log(result);
                                    },
                                );
                                alarmCaldiMi = 1;
                                setTimeout(function(){
                                    alarmCaldiMi = 0;
                                }, 30000);
                                return;
                            }








                    }
                }

                else {
                    if (alarmCaldiMi === 1) return;
                    alarmCaldiMi = 1;
                    setTimeout(function(){
                        alarmCaldiMi = 0;
                    }, 30000);
                    p.send({
                            message: "bi bokluk var",
                        },
                        function(err, result) {
                            console.log(result);
                        },
                    );
                    
                    return;



                }


                


            });
        });



}, 15000);





function getBookSum(sellAt, book) {
    const sum = Object.keys(book).reduce((sum, key) => {
                  if(sellAt > Number(key)) return sum;
                  return sum + book[key] * Number(key);
                }, 0);
    return sum;
}










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
        .then(response => response.json())
        .then(json => res.send(json))
        .catch(e => console.log(e));
});

app.get('/btcturk', (req, res) => {
    fetch('https://api.btcturk.com/api/v2/ticker')
        .then(response => response.json())
        .then(json => res.send(json))
        .catch(e => console.log(e));
});


async function getWithSymbol(binance, symbol, pairs){
    let paribu;
    try{
        let commission = 0.0065;
        let commissionWithBinance = 0.0065;
        let commissionWithBinanceUSDT = 0.0055;

        paribu = await fetch('https://v3.paribu.com/app/markets/'+symbol.toLowerCase()+'-tl?interval=1000').then(r => r.json()).catch(x => console.log(x));

        let pariBuyPrice = Object.keys(paribu.data.orderBook.buy)[0];
        let orderBook = paribu.data.orderBook.buy || {};


        pairs.push({
            title: symbol + '* - PARIBU',
            commission: commissionWithBinance,
            buy: +binance.find(x => x.symbol === symbol+'USDT').askPrice,
            sell: +pariBuyPrice,
            result: (pariBuyPrice * (1 - commissionWithBinance)) /
                +binance.find(x => x.symbol === symbol+'USDT').askPrice,
            book: orderBook
        });
    } catch {

    }
}

app.get('/v2/coinbase', async (req, res) => {
    let pairs = [];

    let binance = await fetch('https://api.binance.com/api/v3/ticker/bookTicker').then(r => r.json());


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
            // getWithSymbol(binance, 'JUV', pairs),
            // getWithSymbol(binance, 'ATM', pairs),
            // getWithSymbol(binance, 'ASR', pairs),
            // getWithSymbol(binance, 'BAR', pairs),
            // getWithSymbol(binance, 'PSG', pairs)        
        ]);



        if (pairs.length < 3) {
        if (alarmCaldiMi === 1) return;
            alarmCaldiMi = 1;
            setTimeout(function(){
                alarmCaldiMi = 0;
            }, 30000);
            p.send({
                    message: "HATA ALDIK:" + pairs.length,
                },
                function(err, result) {
                    console.log(result);
                },
            );
        }



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
    // let btcturk = await fetch('https://api.btcturk.com/api/v2/ticker').then(r => r.json()).then(j => j.data).catch(x => console.log(x));


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




        if (paribu.ENJ_TL)
            pairs.push({
                title: 'ENJ* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'ENJUSDT').askPrice,
                sell: +paribu.ENJ_TL.highestBid,
                result: (+paribu.ENJ_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ENJUSDT').askPrice /
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




        if (paribu.BAND_TL)
            pairs.push({
                title: 'BAND* - PARIBU',
                commission: commissionWithBinance,
                buy: +binance.find(x => x.symbol === 'BANDUSDT').askPrice,
                sell: +paribu.BAND_TL.highestBid,
                result: (+paribu.BAND_TL.highestBid * (1 - commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BANDUSDT').askPrice /
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

    if (paribu) {





// if (paribu.ATM_TL)
        //     pairs.push({
        //         title: 'ATM* - PARIBU',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'ATMUSDT').bidPrice,
        //         buy: +paribu.ATM_TL.lowestAsk,
        //         result: (+paribu.ATM_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'ATMUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });



        // if (paribu.JUV_TL)
        //     pairs.push({
        //         title: 'JUV* - PARIBU',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'JUVUSDT').bidPrice,
        //         buy: +paribu.JUV_TL.lowestAsk,
        //         result: (+paribu.JUV_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'JUVUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });



        // if (paribu.ACM_TL)
        //     pairs.push({
        //         title: 'ACM* - PARIBU',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'ACMUSDT').bidPrice,
        //         buy: +paribu.ACM_TL.lowestAsk,
        //         result: (+paribu.ACM_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'ACMUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });



        // if (paribu.PSG_TL)
        //     pairs.push({
        //         title: 'PSG* - PARIBU',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'PSGUSDT').bidPrice,
        //         buy: +paribu.PSG_TL.lowestAsk,
        //         result: (+paribu.PSG_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'PSGUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });




        // if (paribu.ASR_TL)
        //     pairs.push({
        //         title: 'ASR* - PARIBU',
        //         commission: commissionWithBinance,
        //         sell: +binance.find(x => x.symbol === 'ASRUSDT').bidPrice,
        //         buy: +paribu.ASR_TL.lowestAsk,
        //         result: (+paribu.ASR_TL.lowestAsk * (1 + commissionWithBinance)) /
        //             (+binance.find(x => x.symbol === 'ASRUSDT').bidPrice /
        //                 +binance.find(x => x.symbol === 'USDCUSDT').askPrice),
        //     });








        if (paribu.GRT_TL)
            pairs.push({
                title: 'GRT* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'GRTUSDT').bidPrice,
                buy: +paribu.GRT_TL.lowestAsk,
                result: (+paribu.GRT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'GRTUSDT').bidPrice )
            });


                if (paribu.OXT_TL)
            pairs.push({
                title: 'OXT* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'OXTUSDT').bidPrice,
                buy: +paribu.OXT_TL.lowestAsk,
                result: (+paribu.OXT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'OXTUSDT').bidPrice )
            });


        if (paribu.MATIC_TL)
            pairs.push({
                title: 'MATIC* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'MATICUSDT').bidPrice,
                buy: +paribu.MATIC_TL.lowestAsk,
                result: (+paribu.MATIC_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'MATICUSDT').bidPrice )
            });


        if (paribu.THETA_TL)
            pairs.push({
                title: 'THETA* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'THETAUSDT').bidPrice,
                buy: +paribu.THETA_TL.lowestAsk,
                result: (+paribu.THETA_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'THETAUSDT').bidPrice )
            });

        if (paribu.OGN_TL)
            pairs.push({
                title: 'OGN* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'OGNUSDT').bidPrice,
                buy: +paribu.OGN_TL.lowestAsk,
                result: (+paribu.OGN_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'OGNUSDT').bidPrice )
            });




        if (paribu.ZIL_TL)
            pairs.push({
                title: 'ZIL* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ZILUSDT').bidPrice,
                buy: +paribu.ZIL_TL.lowestAsk,
                result: (+paribu.ZIL_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ZILUSDT').bidPrice )
            });


        if (paribu.BAL_TL)
            pairs.push({
                title: 'BAL* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'BALUSDT').bidPrice,
                buy: +paribu.BAL_TL.lowestAsk,
                result: (+paribu.BAL_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BALUSDT').bidPrice )
            });


        if (paribu.ENJ_TL)
            pairs.push({
                title: 'ENJ* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ENJUSDT').bidPrice,
                buy: +paribu.ENJ_TL.lowestAsk,
                result: (+paribu.ENJ_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ENJUSDT').bidPrice )
            });


        if (paribu.ALGO_TL)
            pairs.push({
                title: 'ALGO* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ALGOUSDT').bidPrice,
                buy: +paribu.ALGO_TL.lowestAsk,
                result: (+paribu.ALGO_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ALGOUSDT').bidPrice )
            });



        if (paribu.REEF_TL)
            pairs.push({
                title: 'REEF* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'REEFUSDT').bidPrice,
                buy: +paribu.REEF_TL.lowestAsk,
                result: (+paribu.REEF_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'REEFUSDT').bidPrice )
            });

        if (paribu.BAND_TL)
            pairs.push({
                title: 'BAND* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'BANDUSDT').bidPrice,
                buy: +paribu.BAND_TL.lowestAsk,
                result: (+paribu.BAND_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'BANDUSDT').bidPrice )
            });



        if (paribu.LRC_TL)
            pairs.push({
                title: 'LRC* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'LRCUSDT').bidPrice,
                buy: +paribu.LRC_TL.lowestAsk,
                result: (+paribu.LRC_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'LRCUSDT').bidPrice )
            });


        if (paribu.UNI_TL)
            pairs.push({
                title: 'UNI* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'UNIUSDT').bidPrice,
                buy: +paribu.UNI_TL.lowestAsk,
                result: (+paribu.UNI_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'UNIUSDT').bidPrice )
            });

        if (paribu.AAVE_TL)
            pairs.push({
                title: 'AAVE* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'AAVEUSDT').bidPrice,
                buy: +paribu.AAVE_TL.lowestAsk,
                result: (+paribu.AAVE_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AAVEUSDT').bidPrice )
            });



        if (paribu.AVAX_TL)
            pairs.push({
                title: 'AVAX* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'AVAXUSDT').bidPrice,
                buy: +paribu.AVAX_TL.lowestAsk,
                result: (+paribu.AVAX_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'AVAXUSDT').bidPrice )
            });


        if (paribu.OMG_TL)
            pairs.push({
                title: 'OMG* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'OMGUSDT').bidPrice,
                buy: +paribu.OMG_TL.lowestAsk,
                result: (+paribu.OMG_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'OMGUSDT').bidPrice )
            });




        if (paribu.XTZ_TL)
            pairs.push({
                title: 'XTZ* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'XTZUSDT').bidPrice,
                buy: +paribu.XTZ_TL.lowestAsk,
                result: (+paribu.XTZ_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'XTZUSDT').bidPrice )
            });




        if (paribu.MKR_TL)
            pairs.push({
                title: 'MKR* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'MKRUSDT').bidPrice,
                buy: +paribu.MKR_TL.lowestAsk,
                result: (+paribu.MKR_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'MKRUSDT').bidPrice )
            });



        if (paribu.RVN_TL)
            pairs.push({
                title: 'RVN* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'RVNUSDT').bidPrice,
                buy: +paribu.RVN_TL.lowestAsk,
                result: (+paribu.RVN_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'RVNUSDT').bidPrice )
            });


        if (paribu.ATOM_TL)
            pairs.push({
                title: 'ATOM* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ATOMUSDT').bidPrice,
                buy: +paribu.ATOM_TL.lowestAsk,
                result: (+paribu.ATOM_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ATOMUSDT').bidPrice )
            });


        if (paribu.DOT_TL)
            pairs.push({
                title: 'DOT* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'DOTUSDT').bidPrice,
                buy: +paribu.DOT_TL.lowestAsk,
                result: (+paribu.DOT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'DOTUSDT').bidPrice )
            });



        if (paribu.ONT_TL)
            pairs.push({
                title: 'ONT* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'ONTUSDT').bidPrice,
                buy: +paribu.ONT_TL.lowestAsk,
                result: (+paribu.ONT_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'ONTUSDT').bidPrice )
            });




        pairs.push({
            title: 'BTC* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'BTCUSDT').bidPrice,
            buy: +paribu.BTC_TL.lowestAsk,
            result: (+paribu.BTC_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTCUSDT').bidPrice )
        });
        pairs.push({
            title: 'ETH* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'ETHUSDT').bidPrice,
            buy: +paribu.ETH_TL.lowestAsk,
            result: (+paribu.ETH_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ETHUSDT').bidPrice )
        });
        pairs.push({
            title: 'XRP* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'XRPUSDT').bidPrice,
            buy: +paribu.XRP_TL.lowestAsk,
            result: (+paribu.XRP_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XRPUSDT').bidPrice )
        });
        pairs.push({
            title: 'LTC* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'LTCUSDT').bidPrice,
            buy: +paribu.LTC_TL.lowestAsk,
            result: (+paribu.LTC_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LTCUSDT').bidPrice )
        });
        pairs.push({
            title: 'XLM* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'XLMUSDT').bidPrice,
            buy: +paribu.XLM_TL.lowestAsk,
            result: (+paribu.XLM_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'XLMUSDT').bidPrice )
        });
        pairs.push({
            title: 'EOS* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'EOSUSDT').bidPrice,
            buy: +paribu.EOS_TL.lowestAsk,
            result: (+paribu.EOS_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'EOSUSDT').bidPrice )
        });
        pairs.push({
            title: 'BAT* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'BATUSDT').bidPrice,
            buy: +paribu.BAT_TL.lowestAsk,
            result: (+paribu.BAT_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BATUSDT').bidPrice )
        });
        pairs.push({
            title: 'BTT* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'BTTUSDT').bidPrice,
            buy: +paribu.BTT_TL.lowestAsk,
            result: (+paribu.BTT_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'BTTUSDT').bidPrice )
        });
        pairs.push({
            title: 'TRX* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'TRXUSDT').bidPrice,
            buy: +paribu.TRX_TL.lowestAsk,
            result: (+paribu.TRX_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'TRXUSDT').bidPrice )
        });
        pairs.push({
            title: 'HOT* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'HOTUSDT').bidPrice,
            buy: +paribu.HOT_TL.lowestAsk,
            result: (+paribu.HOT_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'HOTUSDT').bidPrice )
        });
        pairs.push({
            title: 'CHZ* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'CHZUSDT').bidPrice,
            buy: +paribu.CHZ_TL.lowestAsk,
            result: (+paribu.CHZ_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'CHZUSDT').bidPrice )
        });
        pairs.push({
            title: 'ADA* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'ADAUSDT').bidPrice,
            buy: +paribu.ADA_TL.lowestAsk,
            result: (+paribu.ADA_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'ADAUSDT').bidPrice )
        });
        pairs.push({
            title: 'NEO* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'NEOUSDT').bidPrice,
            buy: +paribu.NEO_TL.lowestAsk,
            result: (+paribu.NEO_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'NEOUSDT').bidPrice )
        });
        pairs.push({
            title: 'LINK* - PARIBU',
            commission: commissionWithBinance,
            sell: +binance.find(x => x.symbol === 'LINKUSDT').bidPrice,
            buy: +paribu.LINK_TL.lowestAsk,
            result: (+paribu.LINK_TL.lowestAsk * (1 + commissionWithBinance)) /
                (+binance.find(x => x.symbol === 'LINKUSDT').bidPrice )
        });
        if (binance.some(x => x.symbol === 'DOGEUSDT'))
            pairs.push({
                title: 'DOGE* - PARIBU',
                commission: commissionWithBinance,
                sell: +binance.find(x => x.symbol === 'DOGEUSDT').bidPrice,
                buy: +paribu.DOGE_TL.lowestAsk,
                result: (+paribu.DOGE_TL.lowestAsk * (1 + commissionWithBinance)) /
                    (+binance.find(x => x.symbol === 'DOGEUSDT').bidPrice )
            });


        if (paribu.WAVES_TL)
            pairs.push({
                title: 'WAVES* - PARIBU',
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