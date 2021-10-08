//Analyzer.RemovePair(Currency + Base);
// anydesk 814 482 070
if (Scanner.Pairs[Currency + Base].BUY < 0.00001) return false;
if (Scanner.Pairs[Currency + Base].CandleData.data.length < 10) return false;

//return false;

var checkBase = function(){
	switch (Base) {
		case "USDT":
		case "BUSD":
		case "DAI":
		case "TRY":
		case "BTC":
		//case "BNB":
		case "ETH":
		//case "TRX":
		case "RUB":
		case "EUR":
		case "GBP":
		case "AUD":
			return true;
		default:
			return false;
	}
};

if (!checkBase()) return false;

var checkCurrency = function(){
	switch (Base) {
		case "USDT":
		case "BUSD":
		case "DAI":
		case "BNB":
			return true;
		default:
			return false;
	}
};

if (!checkCurrency()) return false;

var checkValuable = function(){
	var buyrate1 = Scanner.Pairs[Currency + Base].BUY;
	var sellrate1 = Scanner.Pairs[Currency + Base].SELL;
	var buyrate2 = ""+toFixedPrice(buyrate1,Scanner.Pairs[Currency + Base].tickSize);
	var sellrate2 = ""+toFixedPrice(sellrate1,Scanner.Pairs[Currency + Base].tickSize);
	if (buyrate2.indexOf("e") > 0) return false;
	if (sellrate2.indexOf("e") > 0) return false;
	buyrate2 = buyrate2/1;
	sellrate2 = sellrate2/1;
	if (buyrate2 == sellrate2) return false;
	if (buyrate1 != buyrate2) return false;
	if (sellrate1 != sellrate2) return false;
	return true;
};

if (!checkValuable()) return false;

var checkPair = function(){
	switch (Currency + Base) {
		case "XRPBTC":
		case "XRPBNB":
		case "XRPETH":
		
		case "TRXBTC":
		case "TRXBNB":
		case "TRXETH":
		
		case "ETHBTC":
		
		case "BNBBTC":
		case "BNBETH":
		
			return false;
		default:
			return true;
	}
};

if (!checkPair()) return false;

var checkToken = function(){
	var tokenext1 = "UPUSDT";
	var tokenext2 = "DOWNUSDT";
	var tokenize = "" + Currency + "" + Base;
	if (tokenize.substr(tokenize.length - tokenext1.length) == tokenext1) return false;
	if (tokenize.substr(tokenize.length - tokenext2.length) == tokenext2) return false;
	return true;
};

if (!checkToken()) return false;

var checkFuzzier = function(){
	var datas = Scanner.Pairs[Currency + Base].CandleData.data.map(function(item){
		return item.high;
	});
	var temp = {};
	var d = 0;
	for (var i=0;i<datas.length;i++){
		var key = Currency + Base + datas[i].toPrecision(5);
		if (temp[key]) d++;
		else temp[key] = 0;
	}
	if ((d / datas.length) > 0.2) return false;
	return true;
};

if (!checkFuzzier()) return false;

var Trader_MAX = Infinity;
var StrategicCheck = function(degs){
	var vol_ = 1.015;
	var tds_ = ATA.Processors.TDSequential(degs);
	var len_ = tds_.length;
	if (len_ == 0) return false;
	tds_ = tds_.slice(-len_);
	var i;
	for (i=len_-1;i>0;i--){
		if (tds_[i].buySetup) break;
		else if (ATA.Indicator.RSI.calculate({
			values : degs.map(function(item){return item["close"];}),
			period : 7
		}).slice(-1)[0] < 30) break;
		else continue;
	}
	if (i == 0) return false;
	var targetPrice = Math.min(degs[i].close,degs[i].open);//,(degs[i].high+degs[i].low)/2);
	for (i++;i<len_;i++){
		if (targetPrice < degs[i].high) return false;
	}
	if ((targetPrice - lowest)/(highest - lowest) > 0.7) return false;
	if (targetPrice > degs.slice(-1)[0].close*vol_) {
		Trader_MAX = targetPrice;
		return true;
	}
	return false;
};

if (StrategicCheck(Scanner.Pairs[Currency+Base].CandleData.data));

var console_log = function(){
	console.log.apply(console,arguments);
};

if (Scanner.Pairs[Currency + Base].BUY/Scanner.Pairs[Currency + Base].SELL > 1.0055) return;

//if (Scanner.Pairs[Currency + Base].CandleData.data)

var len = 13;
var size = 11;
var arr2 = new Array(size).fill(0);
var highest = Scanner.Pairs[Currency + Base].CandleData.data[0].high;
var lowest = Scanner.Pairs[Currency + Base].CandleData.data[0].low;
var i;
for (i=1;i<len;i++) {
	if (Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].high > highest) highest = Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].high;
	if (Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].low < lowest) lowest = Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].low;
}
var index,exindex=0;
for (i=0;i<len;i++) {
	if (i > 0){
		if (index > exindex) for(var j=exindex;j<=index;j++) arr2[j]++;
		if (index < exindex) for(var j=index;j<=exindex;j++) arr2[j]++;
		//exindex = index;
	}
	index = Math.floor((Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].low - lowest) / (highest - lowest) * (size - 1));
	arr2[index]++;
	if (index > exindex) for(var j=exindex;j<=index;j++) arr2[j]++;
	if (index < exindex) for(var j=index;j<=exindex;j++) arr2[j]++;
	//exindex = index;
	index = Math.floor((Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].close - lowest) / (highest - lowest) * (size - 1));
	arr2[index]++;
	if (index > exindex) for(var j=exindex;j<=index;j++) arr2[j]++;
	if (index < exindex) for(var j=index;j<=exindex;j++) arr2[j]++;
	//exindex = index;
	index = Math.floor((Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].high - lowest) / (highest - lowest) * (size - 1));
	arr2[index]++;
	if (index > exindex) for(var j=exindex;j<=index;j++) arr2[j]++;
	if (index < exindex) for(var j=index;j<=exindex;j++) arr2[j]++;
	//exindex = index;
}
var avg = 0;

for (i = 0;i<size;i++) avg += arr2[i] / size;
var Lower,Higher;

for (i=0;i<size;i++) {
	if (arr2[i] > avg*0.3) {
		Lower = i/size*(highest - lowest) + lowest;
		break;
	}
}
for (i=size-1;i>=0;i--) {
	if (arr2[i] > avg*0.3) {
		Higher = i/size*(highest - lowest) + lowest;
		break;
	}
}

Higher = Math.min(Trader_MAX,Higher);

var price = Scanner.Pairs[Currency + Base].CandleData.data.slice(-1)[0].close;
var Volatility = (Trader_MAX/price - 1)*100; //(Higher/Lower - 1)*100;

if (Volatility > 20) {
	Analyzer.RemovePair(Currency + Base);
	return false;
}

console.log(".....filter");
if (Strategy.isAvailableforBalance(Currency) && Volatility > 0.8) {
	//console_log("HOLDER => ", Currency + Base, [Higher,Lower]);
	Analyzer.AddPair(Currency, Base, Volatility);
	return true;
}
if (Volatility > 2) {
	//console_log("VOLATILE =>\t% " + Volatility.toFixed(2) + "\t[" + Currency + Base + "]");
	/*ATA.EvalInUI(function(Currency,Base,Volatility){ // Analyzer.AddPair("BTC", "USDT", 2);
		console.log(Currency,Base,Volatility);
	},[Currency,Base,Volatility]);*/
	/*if (Analyzer.Pairs[Currency + Base]) if ((Analyzer.Pairs[Currency + Base].time + 1000*60*10) < (new Date()).getTime()) {
		Analyzer.AddPair(Currency, Base, Volatility);
		return true;
	}*/
	Analyzer.AddPair(Currency, Base, Volatility);
	return true;
}

if ((Asset.Balances[Currency].Balance - Asset.Balances[Currency].onProcess)*Scanner.GetParityPUSDT(Currency) > 10) {
	Analyzer.AddPair(Currency, Base, Volatility);
	return true;
}

//if ((highest/lowest - 1)*100 > 10 && (price-lowest)/(highest-lowest) < 0.2) return true;

//console_log("STABLE => ", Currency + Base, price);

if (Analyzer.Pairs[Currency + Base]) if ((Analyzer.Pairs[Currency + Base].time + 1000*60*10) > (new Date()).getTime()) {
	//Analyzer.AddPair(Currency, Base, Volatility);
	return true;
}

Analyzer.RemovePair(Currency + Base);
return false;