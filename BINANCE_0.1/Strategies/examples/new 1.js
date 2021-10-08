ATA.EvalInCore(function(){
	ATA.Trade.Allow = true;
	var trader = new Trader("GRT","USDT");
	trader.isByUser = true;
	trader.Verify = function(){return true};
	trader.Finish = function(){return false};
	trader.Vars = {
		candleLength: 100, // 7 hour
		Quantity: 250, // max 100 usdt
		Sensitivity: 100,
		Balance: 500,
		lastTime:0,
		max:0.37,
		min:0.34,
	};
	trader.Trade = function(){
		if (this.Vars.lastTime + 60*1000 > (new Date()).getTime()) return;
		this.Vars.lastTime = (new Date()).getTime();
		var ohlc4s = Scanner.Pairs[this.Currency + this.Base].CandleData.GetArrayOf("OHLC4").slice(-this.Vars.candleLength);
		var candles = Scanner.Pairs[this.Currency + this.Base].CandleData.data.slice(-this.Vars.candleLength);
		var priceForSell = Scanner.Pairs[this.Currency + this.Base].SELL;
		var priceForBuy = Scanner.Pairs[this.Currency + this.Base].BUY;
		var FPrice = ATA.Indicator.WMA.calculate({
			values : ohlc4s,
			period : 3
		});
		var max = 0;
		var min = Infinity;
		for (var i=0;i<candles.length;i++) {
			if (max < candles[i].high) max = candles[i].high;
			if (min > candles[i].low) min = candles[i].low;
		}
		if (this.Vars.min > min || this.Vars.max < max) {
			if (this.Vars.min > min) {
				this.Vars.min = min;
			}
			if (this.Vars.max < max) {
				this.Vars.min = max;
			}
			return;
		}
		var ema = ATA.Indicator.EMA.calculate({
			values : FPrice,
			period : 13
		}).slice(-1)[0];
		var stdev = ATA.Indicator.SD.calculate({
			values : FPrice,
			period : 13
		}).slice(-1)[0];
		var EoRfA = (FPrice.slice(-1)[0] - ema) / stdev;
		var Currency_ASUSDT = (Asset.Balances[this.Currency].Balance)*Scanner.GetParityPUSDT(this.Currency);
		var Base_ASUSDT = this.Vars.Balance - Currency_ASUSDT;//(Asset.Balances[this.Base].Balance)*Scanner.GetParityPUSDT(this.Base);
		
		var ExtendPosForSell = Base_ASUSDT - (priceForSell - this.Vars.min) / (this.Vars.max - this.Vars.min) * (Currency_ASUSDT + Base_ASUSDT);
		var ExtendPosForBuy = Base_ASUSDT - (priceForBuy - this.Vars.min) / (this.Vars.max - this.Vars.min) * (Currency_ASUSDT + Base_ASUSDT);
		
		this.Vars.Quantity = toFixedPrice(this.Vars.Sensitivity/Scanner.GetParityPUSDT(this.Currency),Scanner.Pairs[this.Currency + this.Base].minQty);
		if (this.Vars.max/this.Vars.min < (1 + 0.0035*5)) {
			console.log("ERROR => [" + this.Currency + this.Base + "] LOW PROFIT !!!");
			return;
		}
		if (ExtendPosForSell > this.Vars.Sensitivity && ExtendPosForBuy > this.Vars.Sensitivity
			&& EoRfA < -0
			) {
			ATA.Trade.MarketBuy(this.Currency, this.Base, this.Vars.Quantity);
		} else if (ExtendPosForSell < -this.Vars.Sensitivity && ExtendPosForBuy < -this.Vars.Sensitivity) {
			ATA.Trade.MarketSell(this.Currency, this.Base, this.Vars.Quantity);
		}
	};
	trader.Update();
	console.log("User Trader is started.");
});
alert("Your code was executed.");