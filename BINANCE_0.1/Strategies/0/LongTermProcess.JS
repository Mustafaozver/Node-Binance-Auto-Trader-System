// Currency, Base
var LongTermPairs = {};

// Ana koinler
if (true)
Object.assign(LongTermPairs,{ //	STOPLOSS[0]			BUY[1]				SELL[2]		QTY[3]
	//"BTCUSDT"	:	[				19000,				20000,				25000,		0.1		],
	//"ETHUSDT"	:	[				515,				540,				620,		0.3		],
	//
	"_":0
});

// Alt koinler
if (true)
Object.assign(LongTermPairs,{ //	STOPLOSS[0]			BUY[1]				SELL[2]		QTY[3]
	//"NEOUSDT"	:	[				13.44,				16.47,				24,			5		],
	//"XMRUSDT"	:	[				85,					115.77,				190,		2		],
	//"ADAUSDT"	:	[				0.11026,			0.12430,			0.40,		1000	],
	//"XRPUSDT"	:	[				0.30,				0.35,				0.60,		200		],
	//
	"_":0
});































////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////
switch(Base){
	case "DAI": // dont buy or sell
		return false;
	break;
	default:
	break;
}
switch(Currency){
	case "DAI": // dont buy or sell
		return false;
	break;
	default:
	break;
}
if (LongTermPairs[Currency+Base]) {
	var price = 0;
	try {
		price = Scanner.Pairs[Currency + Base].CandleData.Last().close;
		if (LongTermPairs[Currency+Base][0] > 0) { // stoploss
			if (LongTermPairs[Currency+Base][0] >= price) {
				var qty = Asset.Balances[Currency].Balance - Asset.Balances[Currency].onProcess;
				ATA.Trade.MarketSell(Currency,Base,qty);
			}
		}
		if (LongTermPairs[Currency+Base][1] > 0) { // buy
			if (LongTermPairs[Currency+Base][0] < price && price <= LongTermPairs[Currency+Base][1]) {
				var qty = LongTermPairs[Currency+Base][3];
				if (Asset.Balances[Currency].Balance < qty*0.9) ATA.Trade.MarketBuy(Currency,Base,qty);
			}
		}
		if (LongTermPairs[Currency+Base][2] > 0) { // sell
			if (LongTermPairs[Currency+Base][2] <= price) {
				var qty = LongTermPairs[Currency+Base][3];
				ATA.Trade.MarketSell(Currency,Base,qty);
			}
		}
	} catch (e) {
		return true;
	}
	return false;
} else return true;