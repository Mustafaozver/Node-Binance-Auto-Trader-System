ATA.EvalInCore(function(){
	var trader = new Trader("LRC","USDT");
	trader.isByUser = true;
	trader.Verify = function(){return true};
	trader.Finish = function(){return false};
	trader.Vars = {
		candleLength: 100, // 7 hour
		Quantity: 250, // max 100 usdt
		Sensitivity: 1000,
		Balance: 5000,
		lastTime:0,
		max:0.45,
		min:0.40,
	};
	trader.Trade = function(){
		if (this.Vars.lastTime + 30*1000 > (new Date()).getTime()) return;
		this.Vars.lastTime = (new Date()).getTime();
		var candles = Scanner.Pairs[this.Currency + this.Base].CandleData.data.slice(-this.Vars.candleLength);
		var priceForSell = Scanner.Pairs[this.Currency + this.Base].SELL;
		var priceForBuy = Scanner.Pairs[this.Currency + this.Base].BUY;
		var max = 0;
		var min = Infinity;
		for (var i=0;i<candles.length;i++) {
			if (max < candles[i].high) max = candles[i].high;
			if (min > candles[i].low) min = candles[i].low;
		}
		
		if (this.Vars.min > min || this.Vars.max < max) {
			if (this.Vars.min > min) this.Vars.min = min;
			if (this.Vars.max < max) this.Vars.max = max;
			return;
		} else {
			this.Vars.min = min;
			this.Vars.max = max;
		}
		
		var TDSQ9 = ATA.Processors.TDSequential(candles);
		
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
			&& TDSQ9.slice(-1)[0].buySetup
			) {
			ATA.Trade.MarketBuy(this.Currency, this.Base, this.Vars.Quantity);
		} else if (ExtendPosForSell < -this.Vars.Sensitivity && ExtendPosForBuy < -this.Vars.Sensitivity
			&& TDSQ9.slice(-1)[0].sellSetup
			) {
			ATA.Trade.MarketSell(this.Currency, this.Base, this.Vars.Quantity);
		}
	};
	trader.Update();
	console.log("User Trader is started.");
});
alert("Your code was executed.");