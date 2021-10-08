// Parameters

var console_log = function(){
	console.log.apply(console,arguments);
};

var len = 13;
var FibonacciRates = [
	0, // 0
	0.23606797749979, // 1
	0.38196601125011, // 2
	0.5, // 3
	0.61803398874990, // 4
	0.76393202250021, // 5
];

//console_log("\n");
if (Scanner.Pairs[Currency + Base].CandleData.data.length < len) return;
//console_log("NO DATA");

var lastcandles = Scanner.Pairs[Currency + Base].CandleData.data.slice(-len);
var price = lastcandles[lastcandles.length - 1].close;

var min = function(arr){
	return Math.min.apply(Math,arr);
};
var max = function(arr){
	return Math.max.apply(Math,arr);
};
var toScale = function(x,min_,max_){
	return (x - min_) / (max_ - min_);
};

//var TDSequential = ATA.Processors.TDSequential(lastcandles).slice(-1)[0];
var lastOHLC4s = Scanner.Pairs[Currency + Base].CandleData.GetArrayOf("OHLC4").slice(-len);
var highest = lastcandles[0].close;
var lowest = lastcandles[0].close;
var price = lastcandles[lastcandles.length - 1].close;
for (var i=0;i<lastcandles.length;i++) {
	if (highest < lastcandles[i].high) highest = lastcandles[i].high;
	if (lowest < lastcandles[i].low) lowest = lastcandles[i].low;
}

var StrategicCheckSell = function(degs){
	var vol_ = 1.012;
	var tds_ = ATA.Processors.TDSequential(degs);
	var len_ = tds_.length;
	if (len_ == 0) return false;
	tds_ = tds_.slice(-len_);
	var i;
	for (i=len_-1;i>0;i--){
		if (ATA.Indicator.RSI.calculate({
			values : degs.map(function(item){return item["close"];}),
			period : 7
		}).slice(-1)[0] > 75) break;
		if (tds_[i].sellSetup) break;
		//continue;
	}
	if (i == 0) return false;
	var targetPrice = (degs[i].close + degs[i].open) / 2;//,(degs[i].high+degs[i].low)/2);
	for (i++;i<len_;i++){
		if (targetPrice > degs[i].close) return false;
	}
	//if ((targetPrice - lowest)/(highest - lowest) > 0.7) return false;
	if (targetPrice < degs.slice(-1)[0].close*vol_) {
		Trader_MIN = targetPrice;
		return true;
	}
	return false;
};

var StrategicCheck = function(degs){
	var vol_ = 1.012;
	var tds_ = ATA.Processors.TDSequential(degs);
	var len_ = tds_.length;
	if (len_ == 0) return false;
	tds_ = tds_.slice(-len_);
	var i;
	for (i=len_-1;i>0;i--){
		if (ATA.Indicator.RSI.calculate({
			values : degs.map(function(item){return item["close"];}),
			period : 7
		}).slice(-1)[0] < 25) break;
		if (i > 0) if (tds_[i-1].buySetup) if (tds_[i].buySetup) continue;
		if (tds_[i].buySetupPerfection) break;
		//continue;
	}
	if (i == 0) return false;
	var targetPrice = (degs[i].close + degs[i].open) / 2;//,(degs[i].high+degs[i].low)/2);
	for (i++;i<len_;i++){
		if (targetPrice < degs[i].close) return false;
	}
	//if ((targetPrice - lowest)/(highest - lowest) > 0.7) return false;
	if (targetPrice > degs.slice(-1)[0].close*vol_) {
		Trader_MAX = targetPrice;
		return true;
	}
	return false;
};

var min = function(arr){
	return Math.min.apply(Math,arr);
};
var max = function(arr){
	return Math.max.apply(Math,arr);
};
var toScale = function(x,min_,max_){
	return (x - min_) / (max_ - min_);
};

try{ // Filtre "5m", "15m", "1h", "30m"
	if (!Analyzer.Pairs[Currency + Base]) return;
	if (!Analyzer.Pairs[Currency + Base]["5m"]) return;
	if (!Analyzer.Pairs[Currency + Base]["15m"]) return;
	if (!Analyzer.Pairs[Currency + Base]["30m"]) return;
	if (!Analyzer.Pairs[Currency + Base]["1h"]) return;
	
	if (Analyzer.Pairs[Currency + Base]["5m"].data.length < 40) return;
	if (Analyzer.Pairs[Currency + Base]["15m"].data.length < 40) return;
	if (Analyzer.Pairs[Currency + Base]["30m"].data.length < 40) return;
	if (Analyzer.Pairs[Currency + Base]["1h"].data.length < 40) return;
	if (Analyzer.Pairs[Currency + Base]["4h"].data.length < 40) return;
	
	var c_5m = Analyzer.Pairs[Currency + Base]["5m"];
	var c_15m = Analyzer.Pairs[Currency + Base]["15m"];
	var c_30m = Analyzer.Pairs[Currency + Base]["30m"];
	var c_1H = Analyzer.Pairs[Currency + Base]["1h"];
	var c_4H = Analyzer.Pairs[Currency + Base]["4h"];
	
	var RSI_1H = ATA.Indicator.RSI.calculate({period:23,values:c_1H.GetArrayOf("close")}).slice(-1)[0];
	var tdsq9_1H = ATA.Processors.TDSequential(c_1H.GetArrayOf("close")).slice(-1)[0];
	var tdsq9_30m = ATA.Processors.TDSequential(c_30m.GetArrayOf("close")).slice(-1)[0];
	var tdsq9_15m = ATA.Processors.TDSequential(c_15m.GetArrayOf("close")).slice(-1)[0];
	var tdsq9_5m = ATA.Processors.TDSequential(c_5m.GetArrayOf("close")).slice(-1)[0];
	if (40 < RSI_1H) return;
	if (c_1H.GetArrayOf("volume").slice(-2)[0]*Scanner.GetParityPUSDT(Currency) < 100*1000) return;
	var Fu_1d = toScale(c_4H.GetArrayOf("close"));
	if (Fu_1d > 0.40) return;
	if (Fu_1d < 0.03) return;
	if (tdsq9_1H.sellSetup) return;
	if (tdsq9_30m.sellSetup) return;
	if (tdsq9_15m.sellSetup) return;
	if (tdsq9_5m.sellSetup) return;

	var Trader_MAX,Trader_MIN;
	if (StrategicCheckSell(Scanner.Pairs[Currency+Base].CandleData.data)) return;
	else if (StrategicCheckSell(c_5m.data)) return;
	else if (StrategicCheckSell(c_15m.data)) return;
	else if (StrategicCheckSell(c_30m.data)) return;
	else if (StrategicCheckSell(c_1H.data)) return;
	//else if (StrategicCheckSell(c_4H.data)) return;
	else if (StrategicCheck(Scanner.Pairs[Currency+Base].CandleData.data)) console.log("D_OK");
	else if (StrategicCheck(c_5m.data)) console.log("5m_OK");
	else if (StrategicCheck(c_15m.data)) console.log("15m_OK");
	else if (StrategicCheck(c_30m.data)) console.log("30m_OK");
	else if (StrategicCheck(c_1H.data)) console.log("1H_OK");
	
	else return;
	

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/* Long term strategy definition */

	/*

	longterm
	1S rsi ve lokasyon güzel olmalı (35altı, 50-10 arası)
	TDSQ-M9 dan 1 bar sonraki %1.2 düşüş
	1önceki barın saati 20dk geride olmalı
	1:30 saat sonra veya TDSQ-M9 çalışınca ölme
	hacim 1S'te 500K$ dan fazla olmalı
	stratejiyi eski verilerde test et(M9 sonra %1.2 aşagı sonra kes; başarılı/başarısız oranı yüksek olsun)

	*/
	//console.log("TDSQ = ",Analyzer.Pairs[Currency + Base]);//["1h_TD9SQSETUPS"]);
	
	Analyzer.GetDatasFor(Currency + Base);
	//ATA.Alarm();
	
	//console.log(FPrice);
} catch(e) {
	console_log(e);
	return;
}

var Filteredprice = ATA.Indicator.WMA.calculate({
	values : lastOHLC4s,
	period : 3
}).slice(-1)[0];
//

////////////////////////////////////////////////////////////////////////////////////////////////////
var trader = false;
for (var key in Trader.Organizer.Traders) {
	if (Trader.Organizer.Traders[key].Base == Base && Trader.Organizer.Traders[key].Currency == Currency) {
		trader = Trader.Organizer.Traders[key];
		break;
	}
	//else if (Trader.Organizer.Traders[key].Currency == Currency) return;
}
if (trader.isByUser) return;
if (!trader) {
	var FibonacciRates = [
		0, // 0
		0.23606797749979, // 1
		0.38196601125011, // 2
		0.5, // 3
		0.61803398874990, // 4
		0.76393202250021, // 5
	];
	trader = new Trader(Currency,Base,true);
	trader.isByUser = false;
	trader.Vars = {
		candleLength: 40,
		Quantity: 0,
		SS: 1.004,
		lastTime:(new Date()).getTime(),
		SellRate:FibonacciRates[5],
		BuyRate:FibonacciRates[2],
		StopRate:0.10 //FibonacciRates[1],
	};
	trader.Vars.Trader_MAX = Trader_MAX;
	trader.Vars.Trader_MIN = price;
}

//trader.Vars.Quantity = toFixedPrice(15/Scanner.GetParityPUSDT(Currency),Scanner.Pairs[Currency +""+ Base].stepSize);
/*
trader.Vars._Step = 0;
trader.Vars._BuyPrice = 0;
trader.Vars._StopLoss = 0;
trader.Vars._StopLoss_PRC = 1.0035;
trader.Vars._Quantity = 0;
*/

trader.Verify = function(){
	//if ((1000*60*60*6 + this.Vars.StartedTime) < (new Date()).getTime()) return false;
	var len = 60;
	var candles = Scanner.Pairs[this.Currency + this.Base].CandleData.data.slice(-len);
	if (this.Vars.Trader_MAX < candles.slice(-2)[0].close) {
		this.Trade();
		return false;
	}
	if (candles.length < len) len = candles.length;
	var highest = candles[0].high;
	var lowest = candles[0].low;
	
	if (this.Trader_MIN > candles.slice(-1)[0].low) this.Trader_MIN = candles.slice(-1)[0].low;

	for (var i=1;i<len;i++) {
		if (candles[i].high > highest) highest = candles[i].high;
		if (candles[i].low < lowest) lowest = candles[i].low;
	}
	if (highest/lowest > 1.008) return true;
	else return false;
};

trader.Finish = function(){
	/*if (Currency_ASUSDT > 10 // baserLimitUSD
		&& priceForBuy >= Sell_Area) {
		var quantity = Asset.Balances[this.Currency].Balance - Asset.Balances[this.Currency].onProcess;
		ATA.Trade.MarketSell(this.Currency, this.Base, quantity);
	}*/
	this.Trade();
	return true;
};

/*

	var scaleByPrice = function(vF,min,max) {
		return (vF - min) / (max - min);
	};
	var min = function(arr) {
		return Math.min.apply(Math,arr);
	};
	var max = function(arr) {
		return Math.max.apply(Math,arr);
	};
	var len = 50;
	var res = {};
	var ohlc4s = this.GetArrayOf("OHLC4").slice(-len);
	var candles = this.data.slice(-len);
	var highs = candles.map(function(item){return item.high});
	var lows = candles.map(function(item){return item.low});
	var closes = candles.map(function(item){return item.close});
	var opens = candles.map(function(item){return item.open});
	var maxPrice = max(highs);
	var minPrice = min(lows);
	var FPrice = ATA.Indicator.WMA.calculate({
		values : ohlc4s,
		period : 3
	});
	res.FPrice = scaleByPrice(FPrice.slice(-1)[0],minPrice,maxPrice);
	var ema = ATA.Indicator.EMA.calculate({
		values : FPrice,
		period : 17
	});
	res.EMA = scaleByPrice(ema.slice(-1)[0],min(ema),max(ema));
	var stdev = ATA.Indicator.SD.calculate({
		values : FPrice,
		period : 17
	}).slice(-1)[0];
	res.STDEV = stdev / FPrice.slice(-1)[0];
	var TD9SQ = ATA.Processors.TDSequential(candles);
	return res;
	
	
		var data2 = [];
	var ind_FPrice = new ATA.Indicator.WMA({period : 3, values : []});
	var ind_SD = new ATA.Indicator.SD({period : 17, values : []});
	var ind_SMA = new ATA.Indicator.SMA({period : 17, values : []});
	var ind_EMA = new ATA.Indicator.EMA({period : 17, values : []});
	var ind_RSI = new ATA.Indicator.RSI({period : 17, values : []});
	var ind_CCI = new ATA.Indicator.CCI({period : 19, open : [], high : [], low : [], close : []});
	//var ind_BollingerBands = new ATA.Indicator.BollingerBands({ period: 23, values: [], stdDev: 2 });
	var ind_IchimokuCloud = new ATA.Indicator.IchimokuCloud({high : [], low: [], conversionPeriod: 7, basePeriod: 23, spanPeriod: 37, displacement: 23});
	var ind_MACD = new ATA.Indicator.MACD({period : 17, values : [], fastPeriod : 13, slowPeriod : 23, signalPeriod : 3 , SimpleMAOscillator: false, SimpleMASignal:false});
	for (var i=0;i<ticks.length;i++){
		var time = ticks[i][0]/1;
		var open = ticks[i][1]/1;
		var high = ticks[i][2]/1;
		var low = ticks[i][3]/1;
		var close = ticks[i][4]/1;
		var volume = ticks[i][5]/1;
		//var closeTime = ticks[i][6]/1;
		//var assetVolume = ticks[i][7]/1;
		//var trades = ticks[i][8]/1;
		//var buyBaseVolume = ticks[i][9]/1;
		//var buyAssetVolume = ticks[i][10]/1;
		//var ignored = ticks[i][11]/1;
		var candletemp = new CandleStick();
		candletemp.time = time;
		candletemp.open = open;
		candletemp.close = close;
		candletemp.low = low;
		candletemp.high = high;
		candletemp.volume = volume;
		candletemp.Values = {
			OHLC4:open/4 + close/4 + high/4 + low/4,
		};
		candletemp.Values.FPrice = ind_FPrice.nextValue(candletemp.Values.OHLC4);
		candletemp.Params = {
			STDEV:ind_SD.nextValue(close),
			TD9SQ:ATA.Processors.TDSequential(data2),
			SMA:ind_SMA.nextValue(close),
			EMA:ind_EMA.nextValue(close),
			RSI:ind_RSI.nextValue(candletemp.Values.FPrice),
			CCI:ind_CCI.nextValue(candletemp),
			//BB:ind_BollingerBands.
			IchM:ind_IchimokuCloud.nextValue(candletemp),
			MACD:ind_MACD.nextValue(candletemp.Values.FPrice),
		};
		data2.push(candletemp);
	
	

*/

trader.Trade = function(){
	if ((1000*60 + this.Vars.lastTime) > (new Date()).getTime()) return; // işlem seyreltme
	this.Vars.lastTime = (new Date()).getTime();
	
	var candles = Scanner.Pairs[this.Currency + this.Base].CandleData.data.slice(-this.Vars.candleLength);
	var ohlc4s = Scanner.Pairs[this.Currency + this.Base].CandleData.GetArrayOf("OHLC4").slice(-this.Vars.candleLength);
	if (candles.slice(-1)[0].time + 1000*60*5 < (new Date()).getTime()) return;
	var price = candles.slice(-1)[0].close;
	var priceForSell = Math.max(Scanner.Pairs[this.Currency + this.Base].SELL,price);
	var priceForBuy = Math.min(Scanner.Pairs[this.Currency + this.Base].BUY,price);
	var max = this.Vars.Trader_MAX;
	var min = this.Vars.Trader_MIN;
	var priceLocation = (price - min) / (max - min);
	var range = (max - min)/1;
	var Sell_Area = min + range*this.Vars.SellRate;
	var Buy__Area = min + range*this.Vars.BuyRate;
	var Stop__Area = min + range*this.Vars.StopRate;
	var Currency_ASUSDT = (Asset.Balances[this.Currency].Balance - Asset.Balances[this.Currency].onProcess)*Scanner.GetParityPUSDT(this.Currency);
	var Base_ASUSDT = (Asset.Balances[this.Base].Balance - Asset.Balances[this.Base].onProcess)*Scanner.GetParityPUSDT(this.Base);
	var BaseRate = Base_ASUSDT / Asset.TOTALUSDTCandle.Last().close;
	var CurrencyRate = Currency_ASUSDT / Asset.TOTALUSDTCandle.Last().close;
	
	var FPrice = ATA.Indicator.WMA.calculate({
		values : ohlc4s,
		period : 3
	});
	
	var RSI_Asset = ATA.Indicator.RSI.calculate({
		values :  Asset.TOTALUSDTCandle.data.map(function(x){return x.open/4 + x.close/4 + x.high/4 + x.low/4;}),
		period : 23
	});
	
	var FRSI_Currency = ATA.Indicator.RSI.calculate({
		values :  FPrice,
		period : 7
	});
	
	var RSI_BTCUSDT = ATA.Indicator.RSI.calculate({
		values : Scanner.Pairs["BTCUSDT"].CandleData.data.map(function(x){return x.open/4 + x.close/4 + x.high/4 + x.low/4;}),
		period : 13
	});
	
	var RSI_Currency = ATA.Indicator.RSI.calculate({
		values : Scanner.Pairs[this.Currency + this.Base].CandleData.data.map(function(x){return x.close*0.4 + x.high*0.3 + x.low*0.3;}),
		period : 13
	}).slice(-2);
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/*
	var refCloseforEORFA = Scanner.Pairs[this.Currency + this.Base].CandleData.data.map(function(x){return x.close*0.4 + x.high*0.3 + x.low*0.3;});
	
	var FPrice = ATA.Indicator.WMA.calculate({
		values : refCloseforEORFA,
		period : 3
	});
	
	var ema = ATA.Indicator.EMA.calculate({
		values : FPrice,
		period : 23
	}).slice(-2);
	
	var stdev = ATA.Indicator.SD.calculate({
		values : refCloseforEORFA,
		period : 23
	}).slice(-1)[0];
	
	var EoRfA_L = (price - ema[1]) / stdev;
	var EoRfA_F = (candles.slice(-1)[0].close - ema[0]) / stdev;
	//EoRfA_L > eol > EoRfA_F
	*/
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	/*
	ATA.EvalInUI(function(msg){
		console.log(msg);
	},[this.Currency + "/" + this.Base + " is Available for Trading, [" + Sell_Area + ", " + Buy__Area + "]"]);
	*/
	
	var baserLimitUSD = 100;
	if (Base_ASUSDT > baserLimitUSD
		//&& (-1 > EoRfA_L && EoRfA_L >  -1.3 && -1.3 > EoRfA_F) // eorfa rule
		//&& (RSI_Currency[0] < 50 && RSI_Currency[1] > 20) // rsi rule
		//&&  RSI_Currency[1] > 30
		//&& BaseRate > 0.01 //RSI_Asset[RSI_Asset.length-1]/7000
		//&& RSI_BTCUSDT[RSI_BTCUSDT.length-1] < 70
		&& FRSI_Currency[FRSI_Currency.length-1] > 30
		&& CurrencyRate < 0.5
		&& priceLocation < 0.4
		&& priceForBuy > Stop__Area
		&& priceForSell < Buy__Area) { // allow for buying
			
		var quantityUSD = Base_ASUSDT;
		if (quantityUSD > 30) quantityUSD = baserLimitUSD;
		var quantity = toFixedPrice(quantityUSD/Scanner.GetParityPUSDT(this.Currency),Scanner.Pairs[this.Currency + this.Base].stepSize-0);
		this.Vars.Quantity = quantity;
		ATA.Trade.MarketBuy(this.Currency, this.Base, quantity);
		//quantity = toFixedPrice(quantity*0.999999,Scanner.Pairs[this.Currency + this.Base].stepSize-0);
		var Sell_Area_fixed = toFixedPrice(Sell_Area,Scanner.Pairs[this.Currency + this.Base].tickSize);
		setTimeout(newFunction("ATA.Trade.Sell(\""+this.Currency+"\",\""+this.Base+"\","+quantity+","+Sell_Area_fixed+")"),7000);
		//var Sell_Area_fixed2 = Sell_Area_fixed;//toFixedPrice(priceForBuy*1.0042,Scanner.Pairs[this.Currency + this.Base].tickSize);
		//setTimeout(newFunction("ATA.Trade.Sell(\""+this.Currency+"\",\""+this.Base+"\","+quantity+","+Sell_Area_fixed2+")"),5500);
		// waitUntil(if_, eval_,time_=25)
	} else if (Currency_ASUSDT > 10 // baserLimitUSD
		&& priceForBuy >= Sell_Area) {
		var quantity = Asset.Balances[this.Currency].Balance - Asset.Balances[this.Currency].onProcess;
		ATA.Trade.MarketSell(this.Currency, this.Base, quantity);
	} else if (Currency_ASUSDT > 10 // baserLimitUSD
		&& priceLocation > 0.6
		&& priceForBuy >= Sell_Area) { // allow for selling
			
		var quantityUSD = Base_ASUSDT;
		if (quantityUSD > 50) quantityUSD = baserLimitUSD;
		var quantity = toFixedPrice(quantityUSD/Scanner.GetParityPUSDT(this.Currency),(Scanner.Pairs[this.Currency + this.Base].stepSize-0));
		this.Vars.Quantity = quantity;
		ATA.Trade.MarketSell(this.Currency, this.Base, this.Vars.Quantity);
		//quantity = toFixedPrice(quantity*0.999999,Scanner.Pairs[this.Currency + this.Base].stepSize-0);
		var Buy_Area_fixed = toFixedPrice(Buy__Area,Scanner.Pairs[this.Currency + this.Base].tickSize);
		setTimeout(newFunction("ATA.Trade.Sell(\""+this.Currency+"\",\""+this.Base+"\","+quantity+","+Buy_Area_fixed+")"),7000);
		//var Buy_Area_fixed2 = Buy_Area_fixed;//toFixedPrice(priceForSell/1.0042,Scanner.Pairs[this.Currency + this.Base].tickSize);
		//setTimeout(newFunction("ATA.Trade.Sell(\""+this.Currency+"\",\""+this.Base+"\","+quantity+","+Buy_Area_fixed2+")"),5500);
	}
};
trader.Update();

/*
ATA.EvalInUI(function(msg){
	console.log(msg);
},[Currency + "/" + Base + " is Available for Trading , T=" + Trader_MAX + ""]);
*/

////////////////////////////////////////////////////////////////////////////////////////////////////
// Final
return;