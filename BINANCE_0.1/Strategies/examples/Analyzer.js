
var Analyzer = {
	isReady:false,
	lastActivite:0,
	Period:15*60*1000, // 15 min
	Pairs:{},
	Terms:["15m", "1h", "4h", "1d"], // "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"
	Setup:async function() {
		ATA.Loops.push(function() {
			var time = (new Date()).getTime();
			if (Analyzer.lastActivite+Analyzer.Period*10 < time) Analyzer.Loop();
		});
		this.Loop();
		ATA.log("Scanner is started.");
	},
	Loop:async function() {
		this.lastActivite = (new Date()).getTime();
		for (var key in this.Pairs) {
			for (var i=0;i<this.Terms.length;i++) {
				this.Pairs[key][this.Terms[i]] = await this.GetSpecialTerm(pair,this.Terms[i]);
				var indicators = this.ApplyIndicators(this.Pairs[key][this.Terms[i]]);
				this.Pairs[key][this.Terms[i] + "_OPEN"] = indicators.open;
				this.Pairs[key][this.Terms[i] + "_OPEN_ForFuzzy"] = toScaleforFuzzy(indicators.open);
				this.Pairs[key][this.Terms[i] + "_CLOSE"] = indicators.close;
				this.Pairs[key][this.Terms[i] + "_CLOSE_ForFuzzy"] = toScaleforFuzzy(indicators.close);
				this.Pairs[key][this.Terms[i] + "_HIGH"] = indicators.high;
				this.Pairs[key][this.Terms[i] + "_HIGH_ForFuzzy"] = toScaleforFuzzy(indicators.high);
				this.Pairs[key][this.Terms[i] + "_LOW"] = indicators.low;
				this.Pairs[key][this.Terms[i] + "_LOW_ForFuzzy"] = toScaleforFuzzy(indicators.low);
				this.Pairs[key][this.Terms[i] + "_RSI"] = indicators.RSI;
				this.Pairs[key][this.Terms[i] + "_RSI_ForFuzzy"] = indicators.RSI.map(function(x){return x/100});
				this.Pairs[key][this.Terms[i] + "_FPrice"] = indicators.FPrice;
				this.Pairs[key][this.Terms[i] + "_FPrice_ForFuzzy"] = toScaleforFuzzy(indicators.FPrice);
				this.Pairs[key][this.Terms[i] + "_EMA"] = indicators.EMA;
				this.Pairs[key][this.Terms[i] + "_EMA_ForFuzzy"] = toScaleforFuzzy(indicators.EMA);
				this.Pairs[key][this.Terms[i] + "_SD"] = indicators.SD;
				this.Pairs[key][this.Terms[i] + "_SD_ForFuzzy"] = toScaleforFuzzy(indicators.SD);
				this.Pairs[key][this.Terms[i] + "_IchimokuCloud_DSAB"] = indicators.IchimokuCloud_DSAB;
				this.Pairs[key][this.Terms[i] + "_IchimokuCloud_DSAB_ForFuzzy"] = toScaleforFuzzy(indicators.IchimokuCloud_DSAB);
				this.Pairs[key][this.Terms[i] + "_TDSQ9BUY"] = indicators.TDSQ9_BUYPERFECT ? 1 : (indicators.TDSQ9_BUY ? 0.5 : 0);
				this.Pairs[key][this.Terms[i] + "_TDSQ9SELL"] = indicators.TDSQ9_SELLPERFECT ? 1 : (indicators.TDSQ9_SELL ? 0.5 : 0);
			}
		}
		this.isReady = true;
		setTimeout(function(){Analyzer.Loop();},this.Period);
	},
	GetSpecialTerm:function(pair,per){
		var len = 100;
		return Candle.toCandleSticks((await ATA.axios.get("https://api.binance.com/api/v1/klines?symbol=" + pair + "&interval=" + per + "&limit=" + len)).data);
	},
	ApplyIndicators:function(candles){ // 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97
		var getOHLCArray = function(param){
			return candles.map(function(x){return x[param];});
		};
		var ArrayFMap = function(f,arrs){
			return arrs[0].map(function(item,index){
				return f.apply(null,arrs[index]);
			});
		};
		var Gain = function(arr){
			return arr.map(function(item,index){
				var index2 = index + 4;
				if (index2 < 0) return 0;
				if (index2 > arr.length - 1) return 0;
				var gain = item/arr[index2] / 1.0035;
				return gain;
			});
		};
		var ohlc4 = candles.map(function(x){return x.open/4 + x.close/4 + x.high/4 + x.low/4;});
		var close = getOHLCArray("close");
		var open = getOHLCArray("open");
		var high = getOHLCArray("high");
		var low = getOHLCArray("low");
		var ind_FPrice = ATA.Indicator.WMA.calculate({period : 2, values : ohlc4});
		var ind_RSI = ATA.Indicator.RSI.calculate({period : 17, values : ind_FPrice});
		var ind_SD = ATA.Indicator.SD.calculate({period : 17, values : close});
		var ind_EMA = ATA.Indicator.EMA.calculate({period : 17, values : close});
		var ind_IchimokuCloud = ATA.Indicator.IchimokuCloud.calculate({high : high, low: low, conversionPeriod: 7, basePeriod: 23, spanPeriod: 37, displacement: 23});
		var TDSQ9 = ATA.Processors.TDSequential(candles);
		//var ind_SMA = ATA.Indicator.SMA.calculate({period : 17, values : close});
		//var ind_CCI = ATA.Indicator.CCI.calculate({period : 19, open : open, high : high, low : low, close : close});
		//var deletelastforfilterf = function(item,index,arr){return index < arr.length - 1;};
		/*
		TDSQ9
			TDSTBuy: 36368.350000000006
			TDSTSell: 0
			bearishFlip: false
			bullishFlip: true
			buyCoundownIndex: 8
			buySetup: true
			buySetupIndex: 0
			buySetupPerfection: true
			countdownIndexIsEqualToPreviousElement: true
			countdownResetForTDST: false
			sellCoundownIndex: 0
			sellSetup: false
			sellSetupIndex: 1
			sellSetupPerfection: false
		
		*/
		return {
			OHLC4:ohlc4,
			close:close,
			open:open,
			high:high,
			low:low,
			//
			FPrice:ind_FPrice,
			RSI:ind_RSI,
			EMA:ind_EMA,
			SD:ind_SD,
			IchimokuCloud_DSAB:ind_IchimokuCloud.map(function(item){return item.spanA - item.spanB}),
			TDSQ9_BUY:TDSQ9.buySetup,
			TDSQ9_BUYPERFECT:TDSQ9.buySetupPerfection,
			TDSQ9_SELL:TDSQ9.sellSetup,
			TDSQ9_SELLPERFECT:TDSQ9.sellSetupPerfection,
		};
	},
	toScaleforFuzzy:function(arr){
		var min = Math.min.apply(Math,arr);
		var max = Math.max.apply(Math,arr);
		return app.map(function(x){
			return (x - min) / (max - min);
		});
	},

};












