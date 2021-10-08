// Parameters

var console_log = function(){
	console.log.apply(console,arguments);
};

var len = 25;
var FibonacciRates = [
	0, // 0
	0.23606797749979, // 1
	0.38196601125011, // 2
	0.5, // 3
	0.61803398874990, // 4
	0.76393202250021, // 5
];

console_log("\n");
if (Scanner.Pairs[Currency + Base].CandleData.data.length < len) return;// console_log("NO DATA");

var lastcandles = Scanner.Pairs[Currency + Base].CandleData.data.slice(-len);
var price = lastcandles[lastcandles.length - 1].close;



try{
	// General check
	console_log("[" + Currency + Base + "] Checking...");
	if (!Analyzer.Pairs[Currency + Base]) return;
	console_log("Not First");
	if (!Analyzer.Pairs[Currency + Base].Volatility) return;// console_log("");
	console_log("Volatility [OK] = " + Analyzer.Pairs[Currency + Base].Volatility);
	if (!Analyzer.Pairs[Currency + Base]["1d_RSI"]) {
		Analyzer.GetDatasFor(Currency + Base);
		return;
	}
	if ((15*60*1000+Analyzer.Pairs[Currency + Base].time) < (new Date()).getTime()) { // not updated
		Analyzer.GetDatasFor(Currency + Base);
		return;
	}
	console_log("Getting OK");
	// TDSequential check
	/*
	if (Analyzer.Pairs[Currency + Base]["1d_TD9SQSETUPS"].filter(function(item,index,array){
		return item > 0;
	}).length > 0) return;
	console_log("TDSequential 1D");
	*/
	/*
	if (Analyzer.Pairs[Currency + Base]["4h_TD9SQSETUPS"].filter(function(item,index,array){
		return item > 0;
	}).length > 0) return;
	console_log("TDSequential 4H");
	*/
	/*
	if (Analyzer.Pairs[Currency + Base]["1h_TD9SQSETUPS"].filter(function(item,index,array){
		return item > 0;
	}).length > 0) return;
	console_log("TDSequential 1H");
	*/
	/*
	if (Analyzer.Pairs[Currency + Base]["15m_TD9SQSETUPS"].filter(function(item,index,array){
		return item > 0;
	}).length > 0) return;
	console_log("TDSequential 15m");
	*/
	// RSI check
	
	if (Analyzer.Pairs[Currency + Base]["1d_RSI"].slice(-1)[0] > 60) return console_log("-");
	console_log("RSI 1D = " + Analyzer.Pairs[Currency + Base]["1d_RSI"].slice(-1)[0].toFixed(2));
	if (Analyzer.Pairs[Currency + Base]["4h_RSI"].slice(-1)[0] > 50) return;
	console_log("RSI 4H = " + Analyzer.Pairs[Currency + Base]["4h_RSI"].slice(-1)[0].toFixed(2));
	if (Analyzer.Pairs[Currency + Base]["1h_RSI"].slice(-1)[0] > 40) return;
	console_log("RSI 1H = " + Analyzer.Pairs[Currency + Base]["1h_RSI"].slice(-1)[0].toFixed(2));
	if (Analyzer.Pairs[Currency + Base]["15m_RSI"].slice(-1)[0] > 35) return;
	console_log("RSI 15m = " + Analyzer.Pairs[Currency + Base]["15m_RSI"].slice(-1)[0].toFixed(2));
	
	// Location of price check
	if (Analyzer.Pairs[Currency + Base]["1h_CLOSE_ForFuzzy"].slice(-1)[0] > 0.5) return;
	console_log("Location 1H = %" + 100*Analyzer.Pairs[Currency + Base]["1h_CLOSE_ForFuzzy"].slice(-1)[0].toFixed(2));
	if (Analyzer.Pairs[Currency + Base]["15m_CLOSE_ForFuzzy"].slice(-1)[0] > 0.4) return;
	console_log("Location 15m = %" + 100*Analyzer.Pairs[Currency + Base]["15m_CLOSE_ForFuzzy"].slice(-1)[0].toFixed(2));
	if (Analyzer.Pairs[Currency + Base]["1d_CLOSE_ForFuzzy"].slice(-1)[0] < 0.05) return;
	console_log("Location Not Deep");
	
	// standart deviation check
	if (Analyzer.Pairs[Currency + Base]["1h_SD"].slice(-1)[0]/price < 0.001) return;
	console_log("Standard Deviation 1H = %" + (100*Analyzer.Pairs[Currency + Base]["1h_SD"].slice(-1)[0]/price).toFixed(2));
	if (Analyzer.Pairs[Currency + Base]["15m_SD"].slice(-1)[0]/price < 0.001) return;
	console_log("Standard Deviation 15m = %" + (100*Analyzer.Pairs[Currency + Base]["15m_SD"].slice(-1)[0]/price).toFixed(2));
	Analyzer.GetDatasFor(Currency + Base);
	//ATA.Alarm();

} catch(e) {
	console_log(e);
	return;
}

var TDSequential = ATA.Processors.TDSequential(lastcandles).slice(-1)[0];
var lastOHLC4s = Scanner.Pairs[Currency + Base].CandleData.GetArrayOf("OHLC4").slice(-len);
var highest = lastcandles[0].close;
var lowest = lastcandles[0].close;
var price = lastcandles[lastcandles.length - 1].close;
for (var i=0;i<lastcandles.length;i++) {
	if (highest < lastcandles[i].high) highest = lastcandles[i].high;
	if (lowest < lastcandles[i].low) lowest = lastcandles[i].low;
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
	} else if (Trader.Organizer.Traders[key].Currency == Currency) return;
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
		Quantity: 0.005,
		EoRfA_Limit: 1.43,
		SS: 1.004,
		lastTime:(new Date()).getTime(),
		SellRate:FibonacciRates[5],
		BuyRate:FibonacciRates[2]
	};
}

//trader.Vars.Quantity = toFixedPrice(15/Scanner.GetParityPUSDT(Currency),Scanner.Pairs[Currency +""+ Base].stepSize);

trader.Verify = function(){
	var size = 5;
	var len = 60;
	var avg = 0;
	var i;
	var index;
	var candles = Scanner.Pairs[this.Currency + this.Base].CandleData.data.slice(-len);
	var arr2 = new Array(size).fill(0);
	var highest = candles[0].high;
	var lowest = candles[0].low;
	var Lower,Higher;
	if (candles.length < len) len = candles.length;
	for (i=1;i<len;i++) {
		if (candles[i].high > highest) highest = candles[i].high;
		if (candles[i].low < lowest) lowest = candles[i].low;
	}
	for (i=0;i<len;i++) {
		index = Math.floor((candles[i].close - lowest) / (highest - lowest) * (size - 1));
		arr2[index]++;
		index = Math.floor((candles[i].low - lowest) / (highest - lowest) * (size - 1));
		arr2[index]++;
		index = Math.floor((candles[i].high - lowest) / (highest - lowest) * (size - 1));
		arr2[index]++;
	}
	for (i=0;i<size;i++) {
		avg += arr2[i] / size;
		if (arr2[i] > avg*0.9) {
			Lower = i/size*(highest - lowest) + lowest;
			break;
		}
	}
	for (i=size-1;i>=0;i--) {
		if (arr2[i] > avg*0.9) {
			Higher = i/size*(highest - lowest) + lowest;
			break;
		}
	}
	if (Higher/Lower > 1.0065) return true;
	else return false;
};

trader.Finish = function(){
	if ((1000*60*60*2 + this.Vars.lastTime)< (new Date()).getTime());
	var buys = Strategy.GetMarketOrders("BUY",this.Currency + this.Base);
	var sells = Strategy.GetMarketOrders("SELL",this.Currency + this.Base);
	
	if (buys.length > 0) {
		binance.cancel(this.Currency + this.Base, buys[0].ID, function(error, response, symbol){
			if (error) return;
			console.info("DELAY ORDER BUY [" + symbol + "]");
		});
		return false;
	}
	if (sells.length > 0) {
		binance.cancel(this.Currency + this.Base, sells[0].ID, function(error, response, symbol){
			if (error) return;
			console.info("DELAY ORDER SELL [" + symbol + "]");
		});
		return false;
	}
	if (Asset.Balances[this.Currency].onProcess**Scanner.GetParityPUSDT(this.Currency) > 10) return false;
	ATA.Trade.MarketSell(this.Currency, this.Base, Asset.Balances[this.Currency].Balance);
	return true;
};

trader.Vars._Step = 0;
trader.Vars._BuyPrice = 0;
trader.Vars._StopLoss = 0;
trader.Vars._StopLoss_PRC = 1.0035;
trader.Vars._Quantity = 0;
trader.Vars.BuyFollow = function(price,quantity){
	this.Vars._BuyPrice = Math.max(this.Vars._BuyPrice, price - 0);
	this.Vars._Quantity += quantity - 0;
	this.Vars._StopLoss = this.Vars._BuyPrice;
	
};

trader.Vars.SellFollow = function(price,quantity){
	price = price - 0;
	this.Vars._StopLoss = price;
};

trader.Vars.AllowFor = function(Side,G){
	return true;
	if (G){
		if (Side == "B"){
			
		} else if (Side == "S"){
			//if (this.Vars._StopLoss/this.Vars._StopLoss_PRC > price) 
			
		}
	} else {
		
	}
};



trader.Trade = function(){
	if ((1000*20 + this.Vars.lastTime) > (new Date()).getTime()) return;
	
	
	this.Vars.lastTime = (new Date()).getTime();
	var candles = Scanner.Pairs[this.Currency + this.Base].CandleData.data.slice(-this.Vars.candleLength);
	var priceForSell = Scanner.Pairs[this.Currency + this.Base].SELL;
	var priceForBuy = Scanner.Pairs[this.Currency + this.Base].BUY;
	var lastOHLC4s = Scanner.Pairs[this.Currency + this.Base].CandleData.GetArrayOf("OHLC4").slice(-this.Vars.candleLength);
	var FPrice = [];
	var max = 0;
	var min = Infinity;
	for (var i=0;i<candles.length;i++) {
		FPrice.push(candles[i].close/4 + candles[i].open/4 + candles[i].low/4 + candles[i].high/4);
		if (max < candles[i].high) max = candles[i].high;
		if (min > candles[i].low) min = candles[i].low;
	}
	var Price = FPrice.slice(-1)[0];
	var price = candles.slice(-1)[0].close;
	var priceLocation = (price - min) / (max - min);
	var range = (max - min)/1;
	var Sell_Area = min + range*this.Vars.SellRate;
	var Buy__Area = min + range*this.Vars.BuyRate;
	var ema = ATA.Indicator.EMA.calculate({
		values : FPrice,
		period : 23
	}).slice(-1)[0];
	var stdev = ATA.Indicator.SD.calculate({
		values : FPrice,
		period : 23
	}).slice(-1)[0];
	var EoRfA = (Price - ema) / stdev;
	
	
	var Currency_ASUSDT = (Asset.Balances[this.Currency].Balance - Asset.Balances[this.Currency].onProcess)*Scanner.GetParityPUSDT(this.Currency);
	var Base_ASUSDT = (Asset.Balances[this.Base].Balance - Asset.Balances[this.Base].onProcess)*Scanner.GetParityPUSDT(this.Base);
	
	if (Base_ASUSDT > 10
		&& EoRfA < -this.Vars.EoRfA_Limit
		&& priceLocation < 0.4
		&& priceForSell <= Buy__Area
		&& this.Vars.AllowFor.apply(this,["B",true])) { // allow for buying
			
		var quantityUSD = Base_ASUSDT;
		if (quantityUSD > 50) quantityUSD = 15+20*Math.random();
		var quantity = toFixedPrice(quantityUSD/Scanner.GetParityPUSDT(this.Currency),Scanner.Pairs[this.Currency + this.Base].stepSize*10);
		this.Vars.BuyFollow.apply(this,[Buy__Area,quantity]);
		ATA.Trade.MarketBuy(this.Currency, this.Base, quantity);
		//var Sell_Area_fixed = toFixedPrice(Sell_Area,Scanner.Pairs[this.Currency + this.Base].tickSize);
		//var Sell_Area_fixed2 = Sell_Area_fixed;//toFixedPrice(priceForBuy*1.0042,Scanner.Pairs[this.Currency + this.Base].tickSize);
		//setTimeout(newFunction("ATA.Trade.Sell(\""+this.Currency+"\",\""+this.Base+"\","+quantity+","+Sell_Area_fixed+")"),4500);
		//setTimeout(newFunction("ATA.Trade.Sell(\""+this.Currency+"\",\""+this.Base+"\","+quantity+","+Sell_Area_fixed2+")"),5500);
	} else if (Currency_ASUSDT > 10
		&& EoRfA > +this.Vars.EoRfA_Limit
		&& priceLocation > 0.6
		&& priceForBuy >= Sell_Area
		&& this.Vars.AllowFor.apply(this,["S",true])) { // allow for selling
			
		var quantityUSD = Base_ASUSDT;
		if (quantityUSD > 50) quantityUSD = 15+20*Math.random();
		var quantity = toFixedPrice(quantityUSD/Scanner.GetParityPUSDT(this.Currency),(Scanner.Pairs[this.Currency + this.Base].stepSize-0));
		this.Vars.SellFollow.apply(this,[Sell_Area,quantity]);
		ATA.Trade.MarketSell(this.Currency, this.Base, this.Vars.Quantity);
		//var Buy_Area_fixed = toFixedPrice(Buy__Area,Scanner.Pairs[this.Currency + this.Base].tickSize);
		//var Buy_Area_fixed2 = Buy_Area_fixed;//toFixedPrice(priceForSell/1.0042,Scanner.Pairs[this.Currency + this.Base].tickSize);
		//setTimeout(newFunction("ATA.Trade.Sell(\""+this.Currency+"\",\""+this.Base+"\","+quantity+","+Buy_Area_fixed+")"),4500);
		//setTimeout(newFunction("ATA.Trade.Sell(\""+this.Currency+"\",\""+this.Base+"\","+quantity+","+Buy_Area_fixed2+")"),5500);
	} else if (Currency_ASUSDT > 10
		&& priceForBuy >= Sell_Area
		&& this.Vars.AllowFor.apply(this,["S",false])) {
			
		var quantity = Asset.Balances[this.Currency].Balance - Asset.Balances[this.Currency].onProcess;
		ATA.Trade.MarketSell(this.Currency, this.Base, quantity);
	} else if (Base_ASUSDT > 10
		&& priceForSell <= Buy__Area
		&& this.Vars.AllowFor.apply(this,["B",false])) {
			
		var quantityUSD = Base_ASUSDT;
		if (quantityUSD > 50) quantityUSD = 15+20*Math.random();
		var quantity = toFixedPrice(quantityUSD/Scanner.GetParityPUSDT(this.Currency),(Scanner.Pairs[this.Currency + this.Base].stepSize-0));
		ATA.Trade.MarketBuy(this.Currency, this.Base, quantity);
	}
	if ((1000*60*60*10 + this.Vars.lastTime)< (new Date()).getTime()) this.Terminate();
	var CheckBuyOrders =  function(){
		for (var key in Strategy.Operation.Orders.BUY) {
			if (Strategy.Operation.Orders.BUY[key].Pair != (Currency+Base)) continue;
			var delay = this.lastActivite - (new Date(Strategy.Operation.Orders.BUY[key].Time)).getTime();
			if (delay > 30*60*1000) ATA.Binance_API["READ"].cancel(Strategy.Operation.Orders.BUY[key].Pair, Strategy.Operation.Orders.BUY[key].ID, function(error, response, symbol){ // 30 min
				console.info("DELAY ORDER BUY [" + symbol + "]");
			});
		}
	};
	//CheckBuyOrders();
	var CheckSellOrders =  function(){
		for (var key in Strategy.Operation.Orders.SELL) {
			if (Strategy.Operation.Orders.SELL[key].Pair != (Currency+Base)) continue;
			var delay = this.lastActivite - (new Date(Strategy.Operation.Orders.SELL[key].Time)).getTime();
			if (delay > 10*60*60*1000) ATA.Binance_API["READ"].cancel(Strategy.Operation.Orders.SELL[key].Pair, Strategy.Operation.Orders.SELL[key].ID, function(error, response, symbol){ // 30 min
				console.info("DELAY ORDER SELL [" + symbol + "]");
			});
		}
	};
	//CheckSellOrders();
};
trader.Update();

ATA.EvalInUI(function(msg){
	console.log(msg);
},[Currency + "/" + Base + " is Available for Trading"]);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Final
return;