ATA.EvalInCore(function(){
	var trader = new Trader("BTC","USDT");
	trader.isByUser = true;
	trader.Verify = function(){return true};
	trader.Finish = function(){return false};
	trader.Vars = {
		candleLength: 60,
		Quantity: 0.005,
		EoRfA_Limit: 1.43,
		SS: 1.004,
	};
	trader.Trade = function(){
		var candles = Scanner.Pairs[this.Currency + this.Base].CandleData.getPeriodical(3).slice(-this.Vars.candleLength);
		var priceForSell = Scanner.Pairs[this.Currency + this.Base].SELL;
		var priceForBuy = Scanner.Pairs[this.Currency + this.Base].BUY;
		var lastOHLC4s = Scanner.Pairs[this.Currency + this.Base].CandleData.GetArrayOf("OHLC4").slice(-this.Vars.candleLength);
		var FPrice = [];
		var max = 0;
		var min = Infinity;
		for (var i=0;i<candles.length;i++) {
			FPrice.push(candles[i].close/4 + candles[i].open/4 + candles[i].low/4 + candles[i].high/4);
			if (max < candles[i].high) max = candles[i].high;
			if (min > candles[i].high) min = candles[i].low;
		}
		var Price = FPrice.slice(-1)[0];
		var priceLocation = (Price - min) / (max - min);
		var ema = ATA.Indicator.EMA.calculate({
			values : FPrice,
			period : 23
		}).slice(-1)[0];
		var stdev = ATA.Indicator.SD.calculate({
			values : FPrice,
			period : 23
		}).slice(-1)[0];
		var EoRfA = (Price - ema) / stdev;
		
		var Currency_ASUSDT = (Asset.Balances[this.Currency].Balance)*Scanner.GetParityPUSDT(this.Currency);
		var Base_ASUSDT = (Asset.Balances[this.Base].Balance)*Scanner.GetParityPUSDT(this.Base);
		this.Vars.Quantity = toFixedPrice(25/Scanner.GetParityPUSDT(this.Currency),Scanner.Pairs[this.Currency + this.Base].minQty);
		
		if (EoRfA < -this.Vars.EoRfA_Limit && priceLocation < 0.4) {
			ATA.Trade.MarketBuy(this.Currency, this.Base, this.Vars.Quantity);
			console.log("User Trader Strategy buys ", this.Currency, this.Base);
		} else if (EoRfA > +this.Vars.EoRfA_Limit && priceLocation > 0.6) {
			ATA.Trade.MarketSell(this.Currency, this.Base, this.Vars.Quantity);
			console.log("User Trader Strategy sells ", this.Currency, this.Base);
		} else if (stdev/Price > 0.003) {
			if (Currency_ASUSDT < Base_ASUSDT*0.5 && priceLocation < 0.5) ATA.Trade.Buy(this.Currency, this.Base, this.Vars.Quantity, (Price/this.Vars.SS).toPrecision(5));
			if (Currency_ASUSDT > Base_ASUSDT*0.01 && priceLocation > 0.5) ATA.Trade.Sell(this.Currency, this.Base, this.Vars.Quantity, (Price*this.Vars.SS).toPrecision(5));
		}
	};
	trader.Update();
	console.log("User Trader is started.");
});
alert("Your code was executed.");