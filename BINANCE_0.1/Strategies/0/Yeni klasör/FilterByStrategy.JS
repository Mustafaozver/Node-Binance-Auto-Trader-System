//Analyzer.RemovePair(Currency + Base);
if (Scanner.Pairs[Currency + Base].BUY < 0.00001) return false;
if (Scanner.Pairs[Currency + Base].CandleData.data.length < 25) return false;

//return false;

var checkBase = function(){
	switch (Base) {
		case "USDT":
		case "BUSD":
		case "DAI":
		case "TRY":
		case "BTC":
		case "BNB":
		case "ETH":
		case "TRX":
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

var console_log = function(){
	console.log.apply(console,arguments);
};

if (Scanner.Pairs[Currency + Base].BUY/Scanner.Pairs[Currency + Base].SELL > 1.0055) return;

var len = 55;
var size = 7;
var Osc = {};
var arr2 = new Array(size).fill(0);
var highest = Scanner.Pairs[Currency + Base].CandleData.data[0].high;
var lowest = Scanner.Pairs[Currency + Base].CandleData.data[0].low;
var i;
for (i=1;i<len;i++) {
	if (Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].high > highest) highest = Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].high;
	if (Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].low < lowest) lowest = Scanner.Pairs[Currency + Base].CandleData.data.slice(-i)[0].low;
}
var index,exindex;
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

for (i=0;i<size;i++) {
	if (arr2[i] > avg*0.5) {
		Osc.Lower = i/size*(highest - lowest) + lowest;
		break;
	}
}
for (i=size-1;i>=0;i--) {
	if (arr2[i] > avg*0.5) {
		Osc.Higher = i/size*(highest - lowest) + lowest;
		break;
	}
}

Osc.Volatility = (Osc.Higher/Osc.Lower - 1)*100;
var price = Scanner.Pairs[Currency + Base].CandleData.data.slice(-1)[0].close;

if (Strategy.isAvailableforBalance(Currency)) {
	//console_log("HOLDER => ", Currency + Base, [Osc.Higher,Osc.Lower]);
	return true;
}
if (Osc.Volatility > 2) {
	//console_log("VOLATILE =>\t% " + Osc.Volatility.toFixed(2) + "\t[" + Currency + Base + "]");
	/*ATA.EvalInUI(function(Currency,Base,Volatility){ // Analyzer.AddPair("BTC", "USDT", 2);
		console.log(Currency,Base,Volatility);
	},[Currency,Base,Osc.Volatility]);*/
	Analyzer.AddPair(Currency, Base, Osc.Volatility);
	return true;
}

//console_log("STABLE => ", Currency + Base, price);

//if (Base == "USDT" || Base == "BNB" || Base == "BTC" || Base == "ETH") setTimeout(newFunction("var allqty = Asset.Balances[\""+Currency+"\"].Balance - Asset.Balances[\""+Currency+"\"].onProcess;ATA.Trade.MarketSell(\""+Currency+"\",\""+Base+"\",allqty);"),5000);
Analyzer.RemovePair(Currency + Base);
return false;