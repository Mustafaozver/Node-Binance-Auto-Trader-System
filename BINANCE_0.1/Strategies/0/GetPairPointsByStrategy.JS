var len = 32;

if (Scanner.Pairs[Currency + Base].CandleData.data.length < len) return 0;

var candles = Scanner.Pairs[Currency + Base].CandleData.data.slice(-len);
var ohlc4s = Scanner.Pairs[Currency + Base].CandleData.GetArrayOf("OHLC4").slice(-len);

var max = candles[0].high;
var min = candles[0].low;

for (var i=1;i<len;i++) {
	max = Math.max(max,candles[i].high);
	min = Math.min(min,candles[i].low);
}

var FRSI_Currency = ATA.Indicator.RSI.calculate({
	values : ohlc4s,
	period : 13
}).slice(-1)[0];
console.log(".....getpoints");
if (min == 0 || max == 0) return 0;
return max/min;




