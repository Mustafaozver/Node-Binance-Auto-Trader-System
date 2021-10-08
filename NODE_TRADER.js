/*

	Binance Auto Trader Robot
		Version 1.0
		By Mustafa ÖZVER
		2020
	
	Required Modules:
		fs
		url
		http
		node-binance-api
		technicalindicators
		axios
		brain.js
		socket.io
		express
		express-session
		body-parser
		serve-index
		cookie-parser
		multer
*/

if (!Infinity) var Infinity = 99999999999999999;

var E = function() { // fast exit
	process.reallyExit(0);
};

var LOGs___ = {};
process.on("unhandledRejection", function(err){
	console.log("Unhandled rejection:", err);
	LOGs___[(new Date()).getTime()] = err;
});

process.stdin.on("char",function(){
	var chunk = process.stdin.read();
	if (chunk !== null) {
		console.log(chunk);
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////////

// Additional Functions and Objects

var toFixedPrice = function(num,step=0.00000000000000001) {
	num = (num/1).toPrecision(5)/1;
	num = Math.round(num/step)*step;
	num = ""+parseFloat(num.toFixed(14));
	if (num.split(".").length > 1) while (num[num.length-1] == "0") num = num.slice(0,-1);
	if (num[num.length-1] == ".") num = num.slice(0,-1);
	return num;
};

var varIDs = {};
var generate_ID = function() {
	var len = 16;
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
	while (true) {
		var text = "_";
		for (var i=0;i<len;i++) text += chars.charAt(Math.floor(chars.length*Math.random()));
		if (!varIDs[text]) {
			varIDs[text] = true;
			return text;
		}
	}
};

var newFunction = function(uCode) {
	var __DF = "__DF = function(){var Keys = arguments;try{" + uCode + ";}catch(e){console.log(e);}};__DF";
	try {
		return eval(__DF);
	} catch (e) {
		return function(){};
	}
};

var AddCon = function(ofun,oeval){
	var __DF = "__DF = " + (ofun+"").replace(/\}$/,oeval+"};__DF");
	try {
		return eval(__DF);
	} catch (e) {
		return ofun;
	}
};

var timerEval = async function(uCode,time=10) {
	var __DF = "__DF = async function(){" + uCode + ";};__DF";
	setTimeout(eval(__DF),time);
};

var FormatTime = function(oMsec) {
	function addzero(onum) {
		return onum > 9 ? (""+onum) : ("0"+onum);
	}
	var ftext = "";
	var totalcount = Math.floor(oMsec/1000);
	var sec = totalcount%60;
	
	totalcount = Math.floor(totalcount/60);
	var min = totalcount%60;
	
	totalcount = Math.floor(totalcount/60);
	var hour = totalcount%24;
	
	totalcount = Math.floor(totalcount/24);
	var day = totalcount%30;
	
	totalcount = Math.floor(totalcount/30);
	var month = totalcount%12;

	if (month > 0) return "[" + month + "-" + day + "] [" + addzero(hour) + ":" + addzero(min) + ":" + addzero(sec) + "]";
	else if (day > 0) return "[" + day + "] [" + addzero(hour) + ":" + addzero(min) + ":" + addzero(sec) + "]";
	else if (hour > 0) return "[" + addzero(hour) + ":" + addzero(min) + ":" + addzero(sec) + "]";
	else if (min > 0) return "[" + addzero(min) + ":" + addzero(sec) + "]";
	else return "[00:" + addzero(sec) + "]";
};

var waitUntil = async function(if_, eval_,time_=25) {
	var promise = new Promise(function(resolve, reject) {
		var f_temp = function() {
			if (eval(if_)) {
				delete f_temp;
				resolve();
			} else {
				setTimeout(f_temp,time_);
			}
		};
		f_temp();
	}).then(function() {
		return eval(eval_);
	});
	promise = await promise;
	return promise;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// ATA Setups

console.log(""
	+ "#######################################################################################################\n"
	+ "#                                                                                                     #\n" // 
	+ "#                        ######          #####################          ######                        #\n" // 
	+ "#                       ########         #####################         ########                       #\n" // 
	+ "#                      ###    ###                 ###                 ###    ###                      #\n" // 
	+ "#                     ###      ###                ###                ###      ###                     #\n" // 
	+ "#                    ##############               ###               ##############                    #\n" // 
	+ "#                   ################              ###              ################                   #\n" // 
	+ "#                  ###            ###             ###             ###            ###                  #\n" // 
	+ "#                 ###              ###            ###            ###              ###                 #\n" // 
	+ "#                ###                ###           ###           ###                ###                #\n" // 
	+ "#                                                                                                     #\n" // 
	+ "#######################################################################################################\n" //
);

var ATA = {};
ATA.loopTime = 1000;
ATA.StartTime = (new Date()).getTime();
ATA.lastActivite = ATA.StartTime;
ATA.Loops = [];
ATA.Setups = [];

ATA.Http = require("http");
ATA.V8 = require("v8");
ATA.Binance = require("node-binance-api");
ATA.Indicator = require("technicalindicators");
ATA.Fs = require("fs");
ATA.Url = require("url");
ATA.axios = require("axios");
ATA.Brain = require("brain.js");
ATA.Express = require("express");
ATA.Socket = require("socket.io");
ATA.CP = require("child_process");
//ATA.AppJS = require("appjs");

ATA.Settings = {
	ID:"ATA_5_Server_" + generate_ID(),
	HTTP_PORT:Math.floor(100*Math.random() + 200),
	ROOT:""+__dirname+"\\BINANCE_0.1\\"
};

//ATA.Settings.ROOT = "C:\\Users\\Mustafa\\BINANCE_0.1\\";

ATA.Processors = {};

ATA.log = function(message) {
	var thisDate = new Date();
	console.log("#\t[" + thisDate.getTime() + "] = ",thisDate);
	console.log("#\tSystem : " + message + "");
	LOGs___[(new Date()).getTime()] = message;
};

ATA.CheckSystem = function() { // Check system
	this.lastActivite = (new Date()).getTime();
	if (this.Setups.length > 0) {
		this.Setup();
		return;
	}
	this.Loop();
	this.timeoutCheck = setTimeout(function(){ATA.CheckSystem();},this.loopTime);
};

ATA.Setup = function() { // Setup function
	for (var i=0;i<this.Setups.length;i++) {
		try {
			this.Setups[i]();
		} catch (e) {
			console.warn(e,this.Setups[i],i);
		}
	}
	setInterval(function() {
		var time = (new Date()).getTime();
		if (ATA.lastActivite+ATA.loopTime*10 < time) {
			ATA.Loop();
			console.clear();
			console.warn("ATA is restarted.\n Because unexpected ATA had stopped.");
		}
	},this.loopTime*10);
	this.Setups = [];
	this.CheckSystem();
};

ATA.Loop = function() {
	var newdate = new Date();
	for (var i=0;i<this.Loops.length;i++) {
		try {
			this.Loops[i](newdate);
		} catch (e) {
			console.warn(e);
		}
	}
};

ATA.Setups.push(function(){
	ATA.V8.setFlagsFromString("--max-old-space-size=10000");
	ATA.V8.setFlagsFromString("--harmony");
	//ATA.AppJS.serveFilesFrom(ATA.Settings.ROOT + "\\UI");
	ATA.Window = null;//ATA.CP.spawn(ATA.Settings.ROOT + "tools\\GoogleChromePortable\\GoogleChromePortable.exe", ["--app=http://localhost:"+ATA.Settings.HTTP_PORT+"/"]);
});

ATA.RemininCloseTime = 20;
ATA.Loops.push(function(){
	if (ATA.RemininCloseTime < 0) {
		ATA.RemininCloseTime = 10;
		ATA.Window = ATA.CP.spawn(ATA.Settings.ROOT + "tools\\GoogleChromePortable\\GoogleChromePortable.exe", ["--app=http://localhost:"+ATA.Settings.HTTP_PORT+"/"]);
	} else {
		ATA.RemininCloseTime--;
	}
});

ATA.Setups.push(function(){
	ATA.Alarm_running = false;
	ATA.Alarm = async function(){
		if (this.Alarm_running) return;
		this.Alarm_running = true;
		var lim = 5;
		for(var i=0;i<lim;i++) setTimeout(async function(){console.log("\u0007");},i*800);
		setTimeout(async function(){ATA.Alarm_running = false;},lim*800 + 1000);
	};
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Binance API

ATA.Binance_API = {};
ATA.Binance_API["READ"] = ATA.Binance(); // reader
ATA.Binance_API["BUY"] = ATA.Binance(); // reader
ATA.Binance_API["SELL"] = ATA.Binance(); // reader

ATA.Setups.push(function() {
	var APIS = {
		// API from binance
		"READ":{
			useServerTime: true,
			APIKEY		: "xx", // Scalper Robot API 0
			APISECRET	: "xx" // 13 aralık 2020
		},
		"BUY":{
			APIKEY		: "xx", // Scalper Robot API 0
			APISECRET	: "xx" // 13 aralık 2020
		},
		"SELL":{
			APIKEY		: "xx", // Scalper Robot API 1
			APISECRET	: "xx" // 13 aralık 2020
		}
	};
	for (var key in APIS) ATA.Binance_API[key].options(Object.assign({
		//useServerTime: true,
		verbose: true,
		reconnect: true,
		//recvWindow: 60000, // Set a higher recvWindow to increase response timeout
		log:function(log){ATA.log("API Message: ", log);}
	},APIS[key]));
	ATA.log("Binance API is started.");
});

ATA.Trade = {
	Allow: false,
	Buy:async function(curr1,curr2,quantity,price,func) {
		try {
			quantity = toFixedPrice(quantity,Scanner.Pairs[curr1+curr2].minQty);
			price = toFixedPrice(price,Scanner.Pairs[curr1+curr2].tickSize);
			if (!this.Allow) return;
			var resp = await ATA.Binance_API["BUY"].buy("" + curr1 + curr2,quantity,price, {type:'LIMIT'});
			console.log("TRADE REQUEST => BUY [" + curr1 + curr2 + "]\t" + quantity + "\t" + price + "");
			if (func) func(resp);
			return resp;
		} catch (e) {console.log(e);}
	},
	Sell:async function(curr1,curr2,quantity,price,func) {
		try {
			quantity = toFixedPrice(quantity,Scanner.Pairs[curr1+curr2].minQty);
			price = toFixedPrice(price,Scanner.Pairs[curr1+curr2].tickSize);
			if (!this.Allow) return;
			var resp = await ATA.Binance_API["SELL"].sell("" + curr1 + curr2,quantity,price, {type:'LIMIT'});
			console.log("TRADE REQUEST => SELL [" + curr1 + curr2 + "]\t" + quantity + "\t" + price + "");
			if (func) func(resp);
			return resp;
		} catch (e) {console.log(e);}
	},
	MarketBuy: async function(curr1,curr2,quantity) {
		try {
			quantity = toFixedPrice(quantity,Scanner.Pairs[curr1+curr2].minQty);
			console.log("TRADE MARKET => BUY [" + curr1 + curr2 + "]\t" + quantity + "");
			if (!this.Allow) return;
			return await ATA.Binance_API["BUY"].marketBuy("" + curr1 + curr2, quantity);
		} catch (e) {console.log(e);}
	},
	MarketSell: async function(curr1,curr2,quantity) {
		try {
			quantity = toFixedPrice(quantity,Scanner.Pairs[curr1+curr2].minQty);
			console.log("TRADE MARKET => SELL [" + curr1 + curr2 + "]\t" + quantity + "");
			if (!this.Allow) return;
			return await ATA.Binance_API["SELL"].marketSell("" + curr1 + curr2, quantity);
		} catch (e) {console.log(e);}
	}
};



////////////////////////////////////////////////////////////////////////////////////////////////////
// Server System

ATA.GenerateHttpAnswer = function(reqParameters,Resources) {
	var ___F_ans;
	var err = false;
	try {
		var code = Buffer.from(reqParameters.query.TODO, 'base64').toString();
		___F_ans = eval("try{var ___F_ans=("+code+");}catch(e){___F_ans=e};___F_ans");
	} catch (e) {
		___F_ans = e.message;
		err = true;
	}
	Resources.writeHead(200,{"Content-Type":"application/json"});
	try {
		Resources.write(JSON.stringify({
			ID: reqParameters.query.ID,
			Answer: ___F_ans,
			Error:err
		}));
	} catch (e) {
		Resources.write(JSON.stringify({
			ID: reqParameters.query.ID,
			Answer: e.message,
			Error:true
		}));
	}
	Resources.end();
};

ATA.Communication = {
	Settings:{
		ID:"ATA" + generate_ID(),
		SECRET:"ATA"+generate_ID()+generate_ID()+generate_ID(),
		ROOT:"BINANCE_0.1/UI/",
		PORT:ATA.Settings.HTTP_PORT,
		DOMAIN:"localhost",
		Version:new Date(2020,12,18), // year, month, day, hours, minutes, seconds, milliseconds
		SOCKET:{
			path: "/SOCKET",
			serveClient:false,
			// below are engine.IO options
			pingInterval:10000,
			pingTimeout:5000,
			cookie:false
		}
	},
	GenerateCodeForBrowser:function(){
		var code = "";
		code += "ATA.Settings.PORT=" + this.Settings.PORT + ";";
		code += "ATA.Settings.DOMAIN=\"" + this.Settings.DOMAIN + "\";";
		code += "ATA.Setup();";
		return code;
	},
	isReady:false,
	lastActivite:(new Date()).getTime(),
	APP:ATA.Express(),
	Setup:function(){
		this.APP.set("port",this.Settings.PORT);
		var bodyparser = require("body-parser");
		this.APP.use(bodyparser.json());
		this.APP.use(bodyparser.urlencoded({extended:true}));
		this.APP.use(bodyparser.json());
		this.APP.use(require("multer")().array());
		this.APP.use(require("cookie-parser")());
		this.APP.use(require("express-session")({secret:this.Settings.SECRET}));
		/*app.get("/JS", function(Request, Resources){
			Resources.sendFile(this.Settings.ROOT+"JS.js");
		});*/
		this.APP.get("/JS", function(Request, Resources){
			//var opts = ATA.Url.parse(Request.url, true);
			var mimeType = "text/html";
			Resources.writeHead(200,{"Content-Type":"text/javascript"});
			return Resources.end(ATA.Communication.GenerateCodeForBrowser());
		});
		this.APP.post("/", function(Request, Resources){
			ATA.GenerateHttpAnswer(Request,Resources);
			return;
		});
		this.APP.use("/static", ATA.Express.static("node_modules"));
		//this.APP.use('/0/*', require("serve-index")(this.Settings.ROOT));
		this.APP.use("/", ATA.Express.static(this.Settings.ROOT,{index:"index.html"}));
		this.APP.use("/*", ATA.Express.static(this.Settings.ROOT));
		this.APP.get("/*",function(Request, Resources){
			Resources.send("NO ONE HERE", 404);
		});
		this.HTTP = ATA.Http.createServer(this.APP);
		this.IO = ATA.Socket(this.HTTP,this.Settings.SOCKET);
		this.HTTP.listen(this.Settings.PORT,function(){});
		this.IO.engine.generateId = function (Request) {
			return "SOCKET_" + generate_ID();
		};
		this.IO.on("connection",function(socket){
			socket.emit("0",ATA.Communication.Settings.ID);
			socket.join("STR0");
			socket.on("0",newFunction("ATA.Communication.SOCKET.Socket(\""+socket.id+"\");"));
		});
		console.log("PORT = " + this.Settings.PORT);
	},
	SOCKET:{
		Sockets:{},
		Socket:async function(socketid){
			//if () verify...
			ATA.Communication.IO.sockets.sockets.get(socketid).on("JOIN",newFunction("ATA.Communication.SOCKET.Join(\""+socketid+"\",Keys[0]);"));
			ATA.Communication.IO.sockets.sockets.get(socketid).emit("APPROVED");
			ATA.Communication.IO.sockets.sockets.get(socketid).join("STR1");
		},
		Join:function(socketid,name){
			this.Sockets[""+name] = {
				ROOT:ATA.Communication.IO.sockets.sockets.get(socketid),
				DATA:function(){},
			};
			//
				this.Sockets[""+name].DATA = function(){
					console.log(arguments);
				};
			//
			this.Sockets[""+name].ROOT.join("STR2");
			this.Sockets[""+name].ROOT.on("DATA",newFunction("ATA.Communication.SOCKET.Sockets[\""+name+"\"].DATA(\""+socketid+"\");"));
		},
		DATA:function(name,data){
			if (this.Sockets[""+name]) this.Sockets[""+name].ROOT.emit("DATA",data);
			ATA.Communication.IO.to(""+name).emit("DATA",data);
		}
	},
};

ATA.EvalInUI = function(){};
ATA.Setups.push(function(){
	ATA.Communication.Setup();
	ATA.EvalInUI = function(oCode,Args,oWho="STR2"){
		ATA.Communication.SOCKET.DATA(oWho,{TYPE:"EVAL",DATA:"("+oCode+")("+(Args?Args.map(function(x){return JSON.stringify(x)}):"")+");"});
	};
});

////////////////////////////////////////////////////////////////////////////////////////////////////

// Strategy

var Strategy = {
	Folder:"0",
	isReady:false,
	lastActivite:(new Date()).getTime(),
	Period:40*1000, // 1 min
	Setup:async function() {
		this.Loop();
		ATA.Loops.push(function() {
			var time = (new Date()).getTime();
			if (Strategy.lastActivite+Strategy.Period*10 < time) Strategy.Loop();
		});
		ATA.log("Strategy is started.");
	},
	Loop:async function() {
		this.lastActivite = (new Date()).getTime();
		this.ProcessOffers();
		ATA.Binance_API["READ"].openOrders(false, function(error, openOrders) {
			if (error) return;
			Strategy.Operation.Orders = {
				SELL:{},
				BUY:{}
			};
			for (var i=0;i<openOrders.length;i++) {
				Strategy.Operation.Orders[openOrders[i].side][openOrders[i].updateTime] = {
					Quantity:openOrders[i].origQty/1,
					Price:openOrders[i].price/1,
					ID:openOrders[i].orderId,
					Time:openOrders[i].updateTime,
					Pair:openOrders[i].symbol
				};
				Strategy.Operation.Orders[openOrders[i].side][openOrders[i].updateTime].Comes = openOrders[i].price/1 * openOrders[i].origQty/1;
			}
		});
		
		/*for (var key in Strategy.Operation.Orders.BUY) {
			var delay = this.lastActivite - (new Date(Strategy.Operation.Orders.BUY[key].Time)).getTime();
			if (delay > 20*60*1000) ATA.Binance_API["READ"].cancel(Strategy.Operation.Orders.BUY[key].Pair, Strategy.Operation.Orders.BUY[key].ID, function(error, response, symbol){ // 30 min
				console.info("DELAY ORDER BUY [" + symbol + "]");
			});
		}

		for (var key in Strategy.Operation.Orders.SELL) {
			var delay = this.lastActivite - (new Date(Strategy.Operation.Orders.SELL[key].Time)).getTime();
			if (delay > 10*60*60*1000) ATA.Binance_API["READ"].cancel(Strategy.Operation.Orders.SELL[key].Pair, Strategy.Operation.Orders.SELL[key].ID, function(error, response, symbol){ // 10 hours
				console.info("DELAY ORDER SELL [" + symbol + "]");
			});
		}*/
		this.isReady = true;
		setTimeout(function(){Strategy.Loop();},this.Period);
	},
	GetMarketOrders:function(side,pair){
		var arr = [];
		for (var key in Strategy.Operation.Orders[side]) {
			if (Strategy.Operation.Orders[side][key].Pair == pair)
				arr.push(Strategy.Operation.Orders[side][key]);
		}
		return arr;
	},
	isAvailableforBalance:function(cur){
		return (Asset.Balances[cur].Balance - Asset.Balances[cur].onProcess)*Scanner.GetParityPUSDT(cur) >= this.Operation.Lot_Size;
	},
	isAvailableforPair:function(pair){
		if (Scanner.Pairs[pair].status == "TRADING") return true;
		if (Scanner.Pairs[pair].status == "BREAK") return false;
		return true;
	},
	Operation:{
		Orders:{
			SELL:{},
			BUY:{}
		},
		TEMPPAIRS:{},
		Lot_Size:12,
		"NO":function(){},
		"BUY":function(pair){
			if (Strategy.isAvailableforBalance(pair[1])) {
				var qty = toFixedPrice(this.Lot_Size/Scanner.GetParityPUSDT(pair[0]),Scanner.Pairs[pair.join("")].minQty);
				var price = toFixedPrice(Scanner.Pairs[pair.join("")].SELL,Scanner.Pairs[pair.join("")].tickSize);
				ATA.Trade.MarketBuy(pair[0],pair[1],qty);
				//ATA.Trade.Buy(pair[0],pair[1],qty,price,function(){console.log(pair);});
			}
		},
		"SELL":function(pair){
			if (Strategy.isAvailableforBalance(pair[0])) {
				var qty = toFixedPrice(this.Lot_Size/Scanner.GetParityPUSDT(pair[0]),Scanner.Pairs[pair.join("")].minQty);
				var price = toFixedPrice(Scanner.Pairs[pair.join("")].SELL,Scanner.Pairs[pair.join("")].tickSize);
				ATA.Trade.MarketSell(pair[0],pair[1],qty);
				//ATA.Trade.Sell(pair[0],pair[1],qty,price,function(){console.log(pair);});
			}
		},
		"SELLALL":function(pair){
			if (Strategy.isAvailableforBalance(pair[0])) {
				var qty = (Asset.Balances[pair[0]].Balance - Asset.Balances[pair[0]].onProcess);
				var price = toFixedPrice(Scanner.Pairs[pair.join("")].SELL,Scanner.Pairs[pair.join("")].tickSize);
				ATA.Trade.MarketSell(pair[0],pair[1],qty);
				//ATA.Trade.Sell(pair[0],pair[1],qty,price,function(){console.log(pair);});
			}
		}
	},
	Offer:function(pairs){
		pairs = pairs.filter(function(item){
			if (!Strategy.TradeByUser(item[0],item[1])) return false;
			if (!Strategy.LongTermProcess(item[0],item[1])) return false;
			if (!Strategy.isAvailableforPair(item.join(""))) return false;
			if (!Strategy.FilterByStrategy(item[0],item[1])) return false;
			if (!(Strategy.isAvailableforBalance(item[0]) || Strategy.isAvailableforBalance(item[1]))) return false;
			//if (!Strategy.GetPossibilityAnalyzer(item[0],item[1])) return false;
			return true;
		});
		for (var i=0;i<pairs.length;i++) {
			var key = pairs[i].join("");
			if (this.Operation.TEMPPAIRS[key]) {
				this.Operation.TEMPPAIRS[key].Count++;
			} else {
				this.Operation.TEMPPAIRS[key] = {Count:1,Currency:pairs[i][0],Base:pairs[i][1]};
			}
		}
	},
	GetPossibilityAnalyzer:function(cur1,cur2){
		return Analyzer.GetPossibility(cur1+cur2).Volatility > 0;
	},
	UpdatePosition:function(cur1,cur2){
		var resp = this.UpdatePositionByStrategy(cur1,cur2);
	},
	Follows:{},
	TradeByUser:function(cur1,cur2){
		if(this.Follows[cur1+"/"+cur2]) {
			switch(this.Follows[cur1+"/"+cur2]) {
				case "FOLLOW":
					return true;
				break;
				case "TRADE":
					return false;
				break;
			}
		}
		return true;
	},
	ProcessOffers:function(){
		var pairs = Analyzer.GetPairList();
		/*var pairs = Object.keys(Analyzer.Pairs).map(function(item){
			if (Strategy.Operation.TEMPPAIRS[item]) return Strategy.Operation.TEMPPAIRS[item];
			else return "BTCUSDT";
		});*/
		this.Operation.TEMPPAIRS = {};
		pairs = pairs.sort(function(item1,item2){
			try{
				var vol1 = Analyzer.Pairs[item1].Volatility;//Strategy.GetPairPointsByStrategy(item1.Currency,item1.Base);
				var vol2 = Analyzer.Pairs[item2].Volatility;
				return vol1 >= vol2 ? -1 : 1;
			}catch(e){
				return 0;
			}
		});
		var cLen = pairs.length;
		//if (cLen > 25) cLen = 20;
		console.log("\nOffers:");
		if (cLen==0) console.log("No");
		for (var i=0;i<cLen;i++) {
			var Currency = Analyzer.Pairs[pairs[i]].Currency;
			var Base = Analyzer.Pairs[pairs[i]].Base;
			this.UpdatePosition(Currency,Base);
			console.log(Currency,Base,"\t\t P = " + Analyzer.Pairs[pairs[i]].Volatility);
		}
		/*
		var availableBalances = Asset.GetAvailableAssets();
		for (var i=0;i<availableBalances.length;i++){
			
		}
		*/
	}
};

Object.assign(Strategy,{
	FilterByStrategy:function(cur1,cur2){ // #
		return false;
	},
	GetPairPointsByStrategy:function(cur1,cur2){ // #
		return 1;
	},
	UpdatePositionByStrategy:function(cur1,cur2){ // #
		return "NO";
	},
	LongTermProcess:function(cur1,cur2){ // #
		return false;
	}
});

ATA.CHcodes = function(){};

ATA.Loops.push(async function(){
	var basefolder = ATA.Settings.ROOT + "Strategies\\" + Strategy.Folder + "\\";
	ATA.CHcodes();
	ATA.Fs.readFile(basefolder + "ChangeableCodes.JS", function(err, data) {
		if (err) return;
		ATA.CHcodes = newFunction(";"+data+";");
	});
	ATA.Fs.readFile(basefolder + "FilterByStrategy.JS", function(err, data) {
		if (err) return;
		Strategy.FilterByStrategy = newFunction("var Answer=false;var Currency = Keys[0];var Base = Keys[1];"+data+";return Answer;");
	});
	ATA.Fs.readFile(basefolder + "GetPairPointsByStrategy.JS", function(err, data) {
		if (err) return;
		Strategy.GetPairPointsByStrategy = newFunction("var Answer=false;var Currency = Keys[0];var Base = Keys[1];"+data+";return Answer;");
	});
	ATA.Fs.readFile(basefolder + "UpdatePositionByStrategy.JS", function(err, data) {
		if (err) return;
		Strategy.UpdatePositionByStrategy = newFunction("var Answer=false;var Currency = Keys[0];var Base = Keys[1];"+data+";return Answer;");
	});
	ATA.Fs.readFile(basefolder + "LongTermProcess.JS", function(err, data) {
		if (err) return;
		Strategy.LongTermProcess = newFunction("var Answer=false;var Currency = Keys[0];var Base = Keys[1];"+data+";return Answer;");
	});
});

/*
ATA.Loops.push(function() {
	if (Strategy_Start) Strategy_Start();
});*/

ATA.Setups.push(function(){
	Strategy.Setup();
});

// Scanner

var Scanner = {
	isReady:false,
	lastActivite:0,
	Period:10*1000, // 10 sec
	//Terms:["5m","4h","1d"], // 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
	DEFAULTBASE:"USDT",
	Pairs:{},
	Setup:async function() {
		var prices = await ATA.Binance_API["READ"].prices();
		for (var key in prices) this.Pairs[key] = {
			BUY:prices[key]/1,
			SELL:prices[key]/1,
			CandleData:new Candle()
		};
		ATA.Loops.push(function() {
			var time = (new Date()).getTime();
			if (Scanner.lastActivite+Scanner.Period*10 < time) Scanner.Loop();
		});
		ATA.Binance_API["READ"].exchangeInfo(function(error, data) {
			if (error) return;
			for (var obj of data.symbols) {
				let filters = {status:obj.status};
				for (var filter of obj.filters) {
					if (filter.filterType == "MIN_NOTIONAL") {
						filters.minNotional = filter.minNotional/1;
					} else if(filter.filterType == "PRICE_FILTER"){
						filters.minPrice = filter.minPrice/1;
						filters.maxPrice = filter.maxPrice/1;
						filters.tickSize = filter.tickSize/1;
					} else if ( filter.filterType == "LOT_SIZE"){
						filters.stepSize = filter.stepSize/1;
						filters.minQty = filter.minQty/1;
						filters.maxQty = filter.maxQty/1;
					}
				}
				filters.baseAssetPrecision = obj.baseAssetPrecision;
				filters.quoteAssetPrecision = obj.quoteAssetPrecision;
				filters.orderTypes = obj.orderTypes;
				filters.icebergAllowed = obj.icebergAllowed;
				Object.assign(Scanner.Pairs[obj.symbol],filters);
			}
		});
		this.Loop();
		ATA.log("Scanner is started.");
	},
	Loop:async function() {
		this.lastActivite = (new Date()).getTime();
		var prices = (await ATA.axios.get("https://www.binance.com/api/v3/ticker/bookTicker")).data;
		var prices2 = await ATA.Binance_API["READ"].prices();
		for (var i=0;i<prices.length;i++) {
			var key = prices[i].symbol;
			//var pricePair = (await ATA.axios.get("https://api.binance.com/api/v1/klines?symbol="+key+"&interval=1m&limit=1")).data;
			if (this.Pairs[key]) {
				var obj = {
					SELL: (prices[i].bidQty/1 == 0) ? (prices2[key]/1) : Math.max(prices[i].bidPrice/1, prices2[key]/1),
					BUY: (prices[i].askQty/1 == 0) ? (prices2[key]/1) : Math.min(prices[i].askPrice/1, prices2[key]/1)
				};
				Object.assign(this.Pairs[key], obj);
				var price = this.Pairs[key].BUY/2 + this.Pairs[key].SELL/2;
				this.Pairs[key].CandleData.Update(price);
				this.Pairs[key].CandleData.Update(Math.max(this.Pairs[key].CandleData.Last().high,this.Pairs[key].BUY));
				this.Pairs[key].CandleData.Update(Math.min(this.Pairs[key].CandleData.Last().low,this.Pairs[key].SELL));
				this.Pairs[key].CandleData.Update(price);
				//this.Pairs[key].CandleData.Last().volume += 0;
				
			} else { // new pair
				console.log("NEW PAIR : ", prices[i]);
				var price = (prices[i].askPrice + prices[i].bidPrice)/2;
				this.Pairs[key] = {
					SELL:prices[i].bidPrice/1,
					BUY:prices[i].askPrice/1,
					CandleData:new Candle()
				};
			}
		}
		this.ScanPairs();
		this.isReady = true;
		setTimeout(function(){Scanner.Loop();},this.Period);
	},
	ScanPairs:function() {
		var availableAssets = Asset.GetAvailableAssets(); // a b c
		var allAssets = Object.keys(Asset.Balances); // a b c d e 
		var availablePairs = [];
		for (var i=0;i<availableAssets.length;i++) {
			for (var j=0;j<allAssets.length;j++) {
				if (availableAssets[i] == allAssets[j]) continue;
				if (this.Pairs[availableAssets[i] +""+ allAssets[j]]) availablePairs.push([availableAssets[i], allAssets[j]]);
				if (this.Pairs[allAssets[j] +""+ availableAssets[i]]) availablePairs.push([allAssets[j], availableAssets[i]]);
			}
		}
		Strategy.Offer(availablePairs);
	},
	GetParityPUSDT:function(key) {
		// normal pariteler
		if (key == "USDT") return 1;
		else if (this.Pairs[key + "USDT"]) return this.GetParity(key + "USDT");
		else if (this.Pairs[key + "BNB"]) return this.GetParity(key + "BNB") * this.GetParity("BNBUSDT");
		else if (this.Pairs[key + "BTC"]) return this.GetParity(key + "BTC") * this.GetParity("BTCUSDT");
		else if (this.Pairs[key + "ETH"]) return this.GetParity(key + "ETH") * this.GetParity("ETHUSDT");
		else if (this.Pairs[key + "XRP"]) return this.GetParity(key + "XRP") * this.GetParity("XRPUSDT");
		else if (this.Pairs[key + "TRX"]) return this.GetParity(key + "TRX") * this.GetParity("TRXUSDT");
		// ters pariteler
		else if (this.Pairs["USDT" + key]) return 1 / this.GetParity("USDT" + key);
		else if (this.Pairs["BNB" + key]) return 1 / this.GetParity("BNB" + key) / this.GetParity("BNBUSDT");
		else if (this.Pairs["BTC" + key]) return 1 / this.GetParity("BTC" + key) / this.GetParity("BTCUSDT");
		else if (this.Pairs["ETH" + key]) return 1 / this.GetParity("ETH" + key) / this.GetParity("ETHUSDT");
		else if (this.Pairs["XRP" + key]) return 1 / this.GetParity("XRP" + key) / this.GetParity("XRPUSDT");
		else if (this.Pairs["TRX" + key]) return 1 / this.GetParity("TRX" + key) / this.GetParity("TRXUSDT");
		else return 0;
	},
	GetParity:function(key) {
		return toFixedPrice((this.Pairs[key].BUY + this.Pairs[key].SELL)/2,0.00000000001);
	},
	GetCandle:function(key) {
		return this.Pairs[key].CandleData;
	},
	
};

ATA.Setups.push(function() {
	Scanner.Setup();
});

// Balances
/*
 Get balances of all currencies
*/
var Asset = {
	isReady:false,
	Period:10*1000,
	TOTALUSDTCandle:null,
	Golden:{
		Currencies:[],
		GetBalances:function(){
			
		}
	},
	Bases:{
		Currencies:["USDT","BNB","BTC","ETH","XRP","TRX","USDC","TUSD","BUSD","USDS","DAI","EUR","BKRW","GBP","PAX","ZAR","BIDR","NGN","RUB","TRY","UAH","ZAR","AUD","BRL"]
	},
	Balances:{},
	lastActivite:0,
	Setup:function() {
		this.Loop();
		ATA.log("Asset is started.");
		ATA.Loops.push(function() {
			var time = (new Date()).getTime();
			if (Asset.lastActivite+Asset.Period*10 < time) Asset.Loop();
		});
		this.TOTALUSDTCandle = new Candle();
		this.TOTALUSDTCandle.Update(0);
	},
	Loop:async function() {
		this.lastActivite = (new Date()).getTime();
		var balances = await ATA.Binance_API["READ"].balance();
		for (var key in balances) {
			if (this.Balances[key]) {
				Object.assign(this.Balances[key], {
					Balance:balances[key].available/1 + balances[key].onOrder/1,
					Currency:key
				});
			} else { // new asset
				this.Balances[key] = {
					Balance:balances[key].available/1 + balances[key].onOrder/1,
					onProcess:balances[key].onOrder/1,
					Currency:key,
					Base:""
				};
			}
		}
		if (Scanner.isReady) {
			var total = 0;
			for (var key in this.Balances) {
				this.ProcessAsset(key);
				if (!isNaN(this.Balances[key].Asset_ASUSDT)) total += this.Balances[key].Balance*Scanner.GetParityPUSDT(key);
			}
			this.TOTALUSDTCandle.Update(total);
		}
		this.isReady = true;
		setTimeout(function(){Asset.Loop();},this.Period);
	},
	GetAvailableAssets:function(){
		var balanceslist = Object.keys(this.Balances);
		return balanceslist.filter(function(item){
			return Asset.Balances[item].Asset_ASUSDT > 20;
		});
	},
	EmergencySell:function(){
		if (Scanner.isReady) {
			for (var key in this.Balances) {
				if (this.Balances[key].Asset_ASUSDT < 10) continue;
				if (key == "USDT"
					|| key == "DAI"
					|| key == "BNB"
					|| key == "BTC"
					|| key == "ETH"
					|| key == "XRP"
				) continue;
				var pair = key + this.Balances[key].Base;
				var qty = toFixedPrice(this.Balances[key].Balance - this.Balances[key].onProcess,Scanner.Pairs[key].minQty);
				var price = toFixedPrice(Scanner.Pairs[pair].BUY,Scanner.Pairs[pair].tickSize);
				console.log("SELL => [Emergency]" + key + " ["+pair+"] P=" + price + ", Q=" + qty + " ;\n");
				//ATA.Trade.MarketSell(key,this.Balances[key].Base,qty);
				ATA.Trade.Sell(key,this.Balances[key].Base,qty,price);
			}
		}
	},
	OrderEqualize:function(){
		if (Scanner.isReady) {
			for (var key in this.Balances) {
				if (this.Balances[key].Asset_ASUSDT < 10) continue;
				if (key == "USDT"
					|| key == "DAI"
					|| key == "BNB"
					|| key == "BTC"
					|| key == "ETH"
					|| key == "XRP"
				) continue;
				var pair = key + this.Balances[key].Base;
				var prices = Strategy.GetMarketOrders("SELL",pair);
				var price = toFixedPrice(Scanner.Pairs[pair].BUY,Scanner.Pairs[pair].tickSize);
				if (prices.length > 0) price = toFixedPrice(prices[0].Price,Scanner.Pairs[pair].tickSize);
				var qty = toFixedPrice(this.Balances[key].Balance - this.Balances[key].onProcess,Scanner.Pairs[pair].minQty);
				ATA.Trade.Sell(key,this.Balances[key].Base,qty,price);
				
			}
		}
	},
	ProcessAsset:function(key) {
		if (key == "USDT") { // USDT
			this.Balances["USDT"].Base = "";
			var price = 1;
			var asset = price*this.Balances["USDT"].Balance;
			this.Balances["USDT"].Asset_ASBASE = asset;
			this.Balances["USDT"].Asset_ASUSDT = asset;
		} else if (Scanner.Pairs[key + "USDT"]) { // USDT
			this.Balances[key].Base = "USDT";
			var price = Scanner.Pairs[key + "USDT"].BUY/2 + Scanner.Pairs[key + "USDT"].SELL/2;
			var asset = price*this.Balances[key].Balance;
			this.Balances[key].Asset_ASBASE = asset;
			this.Balances[key].Asset_ASUSDT = asset*Scanner.GetParityPUSDT("USDT");
		} else if (Scanner.Pairs[key + "BNB"]) { // BNB
			this.Balances[key].Base = "BNB";
			var price = Scanner.Pairs[key + "BNB"].BUY/2 + Scanner.Pairs[key + "BNB"].SELL/2;
			var asset = price*this.Balances[key].Balance;
			this.Balances[key].Asset_ASBASE = asset;
			this.Balances[key].Asset_ASUSDT = asset*Scanner.GetParityPUSDT("BNB");
		} else if (Scanner.Pairs[key + "BTC"]) { // BTC
			this.Balances[key].Base = "BTC";
			var price = Scanner.Pairs[key + "BTC"].BUY/2 + Scanner.Pairs[key + "BTC"].SELL/2;
			var asset = price*this.Balances[key].Balance;
			this.Balances[key].Asset_ASBASE = asset;
			this.Balances[key].Asset_ASUSDT = asset*Scanner.GetParityPUSDT("BTC");
		} else if (Scanner.Pairs[key + "ETH"]) { // ETH
			this.Balances[key].Base = "ETH";
			var price = Scanner.Pairs[key + "ETH"].BUY/2 + Scanner.Pairs[key + "ETH"].SELL/2;
			var asset = price*this.Balances[key].Balance;
			this.Balances[key].Asset_ASBASE = asset;
			this.Balances[key].Asset_ASUSDT = asset*Scanner.GetParityPUSDT("ETH");
		} else if (Scanner.Pairs[key + "XRP"]) { // XRP
			this.Balances[key].Base = "XRP";
			var price = Scanner.Pairs[key + "XRP"].BUY/2 + Scanner.Pairs[key + "XRP"].SELL/2;
			var asset = price*this.Balances[key].Balance;
			this.Balances[key].Asset_ASBASE = asset;
			this.Balances[key].Asset_ASUSDT = asset*Scanner.GetParityPUSDT("XRP");
		} else if (Scanner.Pairs[key + "TRX"]) { // TRX
			this.Balances[key].Base = "TRX";
			var price = Scanner.Pairs[key + "TRX"].BUY/2 + Scanner.Pairs[key + "TRX"].SELL/2;
			var asset = price*this.Balances[key].Balance;
			this.Balances[key].Asset_ASBASE = asset;
			this.Balances[key].Asset_ASUSDT = asset*Scanner.GetParityPUSDT("TRX");
		} else {
			//console.log("UNKNOWN BALANCE =>" + key);
			try {
				this.Balances[key].Base = "";
				this.Balances[key].Asset_ASBASE = 0;
				this.Balances[key].Asset_ASUSDT = 0;
			} catch (e) {}
		}
	}
};

ATA.Setups.push(function() {
	Asset.Setup();
});

// Candle and CandleStick

var CandleStick = function() {
	this.open = null;
	this.close = null;
	this.low = null;
	this.high = null;
	this.volume = null;
	this.time = (new Date()).getTime();
	this.Params = {};
};

CandleStick.prototype.Update = function(price,vol=0) {
	if (this.open == null) this.time = (new Date()).getTime();
	if (this.open == null) this.open = price;
	this.close = price;
	this.low = (this.low == null) ? price : Math.min(price,this.low);
	this.high = (this.high == null) ? price : Math.max(price,this.high);
	this.volume = (this.volume == null) ? vol : (vol+this.volume);
};

CandleStick.prototype.valueOf = function() {
	return this;
};

CandleStick.prototype.get = function() {
	return this;
};

//

var Candle = function(start) {
	this.data = [new CandleStick()];
	this.start = start ? start : ((new Date()).getTime());
	this.period = Candle.config.period-0;
	this.Params = {};
	this.Values = {
		OHLC4:function(T) {
			return (T.open + T.close + T.low + T.high)/4
		}
	};
};

Candle.config = {
	period: 80, // 200sec = 3min20sec // Candle.getPeriod("3m") as second Scanner.Period
	limit: 200 // 200*3 = 10 hours
};

Candle.prototype.Update = async function(price) {
	price = price/1;
	var limit = Candle.config.limit-0;
	if (this.data.length > limit) {
		this.data = this.data.slice(20-limit);
		this.start = this.data[0].time;
	}
	this.period = Candle.config.period-0
	var index = Math.floor(((new Date()).getTime() - this.start)/this.period/1000);
	//if (this.data.length > 1) this.start = this.data[0].time;
	while (index >= this.data.length) {
		var CandleStick1 = new CandleStick();
		CandleStick1.Update(price);
		for (var key in this.Values) CandleStick1.Params[key] = this.Values[key](CandleStick1);
		this.data.push(CandleStick1);
	}
	var Lind = this.data.length - 1;
	this.Last().Update(price);
	if (Lind > 0) Object.assign(this.data[Lind].Params, this.data[Lind-1].Params);
	for (var key in this.Values) this.data[Lind].Params[key] = this.Values[key](this.data[Lind]);
};

Candle.prototype.valueOf = function() {
	return this.data[this.data.length - 1];
};

Candle.prototype.Last = function() {
	return this.data[this.data.length - 1];
};

Candle.prototype.getPeriodical = function(per=2) {
	var arr = [];
	for (var i=0;i<this.data.length;i++) {
		if (i % per == 0) arr.push(new CandleStick());
		arr[arr.length-1].Update(this.data[i].open);
		arr[arr.length-1].Update(this.data[i].high);
		arr[arr.length-1].Update(this.data[i].low);
		arr[arr.length-1].Update(this.data[i].close);
	}
	return arr;
};

Candle.getPeriod = function(oper) { // 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
	if(typeof oper === "number") {
		//if (43200 > oper)
		if (oper == 1) return "1m";
		else if (oper == 3) return "3m";
		else if (oper == 5) return "5m";
		else if (oper == 15) return "15m";
		else if (oper == 30) return "30m";
		else if (oper == 60) return "1h";
		else if (oper == 120) return "2h";
		else if (oper == 240) return "4h";
		else if (oper == 360) return "6h";
		else if (oper == 480) return "8h";
		else if (oper == 720) return "12h";
		else if (oper == 1440) return "1d";
		else if (oper == 4320) return "3d";
		else if (oper == 10080) return "1w";
		else if (oper == 43200) return "1M";
		else return "1m"; 
	} else {
		switch (oper) {
			default:
			case "1m":
				return 1;
			break;
			case "3m":
				return 3;
			break;
			case "5m":
				return 5;
			break;
			case "15m":
				return 15;
			break;
			case "30m":
				return 30;
			break;
			case "1h":
				return 60;
			break;
			case "2h":
				return 120;
			break;
			case "4h":
				return 240;
			break;
			case "6h":
				return 360;
			break;
			case "8h":
				return 480;
			break;
			case "12h":
				return 720;
			break;
			case "1d":
				return 1440;
			break;
			case "3d":
				return 4320;
			break;
			case "1w":
				return 10080;
			break;
			case "1M":
				return 43200;
			break;
		}
	}
};

Candle.prototype.GetArrayOf = function(rates="close"){
	var arr = [];
	for (var i=0;i<this.data.length;i++) {
		if (this.data[i][rates]) arr.push(this.data[i][rates]/1);
		if (this.data[i].Params[rates]) arr.push(this.data[i].Params[rates]/1);
	}
	return arr;
};

Candle.prototype.GetNominals = function() {
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
};

Candle.GetSpecialTerm = async function(pair,per){
	var L = {};
	L.Indicator = Candle.ApplyIndicators(L.data);
	L.Fuzzies = Candle.toFuzzy(pair,L.Indicator);
	return L;
};

Candle.toFuzzy = function(pair,ticks){
	var Fuzzy = [];
	var min = function(arr){
		return Math.min.apply(Math,arr);
	};
	var max = function(arr){
		return Math.max.apply(Math,arr);
	};
	var toScale = function(x,min_,max_){
		return (x - min_) / (max_ - min_);
	};
	var maxPrice = max(ticks.map(function(item){return item.high}));
	var minPrice = min(ticks.map(function(item){return item.low}));
	for (var i=0;i<ticks.length;i++){
		var fuzz = {};
		fuzz[pair + "open"] = toScale(ticks[i].open,minPrice,maxPrice);
		fuzz[pair + "close"] = toScale(ticks[i].close,minPrice,maxPrice);
		fuzz[pair + "high"] = toScale(ticks[i].high,minPrice,maxPrice);
		fuzz[pair + "low"] = toScale(ticks[i].low,minPrice,maxPrice);
		fuzz[pair + "FPrice"] = toScale(ticks[i].Values.FPrice,minPrice,maxPrice);
		fuzz[pair + "RSI"] = ticks[i].Params.RSI/100;
		fuzz[pair + "STDEV"] = ticks[i].Params.STDEV/ticks[i].Values.FPrice;
		fuzz[pair + "volume"] = toScale(ticks[i].volume,min(ticks.map(function(item){return item.volume})),max(ticks.map(function(item){return item.volume})));
		Fuzzy.push(fuzz);
	}
	/*for (var i=0;i<ticks.length;i++){
		ticks[i].open
	}*/
	return Fuzzy;
};

Candle.ApplyIndicators = function(ticks){
	/*for (var i=0;i<ticks.length;i++){
		ticks[i].open
	}*/
	return ticks;
};

Candle.toCandleSticks = function(ticks){
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
	}
	return data2;
};

var Trader = function(curr,base,wnm=false){
	this.ID = wnm ? ("#"+curr+base) : generate_ID();
	this.Base = base;
	this.Currency = curr;
	this.Vars = {};
	this.Verify = function(){return true};
	this.Trade = function(){return true};
	this.Finish = function(){return true};
	this.isByUser = false;
	//
	Trader.Organizer.Traders[this.ID] = this;
};

Trader.Organizer = {
	Traders:{},
	isReady:false,
	Period:1000, // 1 sec
	lastActivite:0,
	Setup:function() {
		ATA.log("Trader System is started.");
		ATA.Loops.push(function() {
			var time = (new Date()).getTime();
			if (Trader.Organizer.lastActivite+Trader.Organizer.Period*10 < time) Trader.Organizer.Loop();
		});
		this.Loop();
	},
	Loop:async function() {
		this.lastActivite = (new Date()).getTime();
		for (var key in this.Traders) {
			this.Traders[key].Update();
		}
		this.isReady = true;
		setTimeout(function(){Trader.Organizer.Loop();},this.Period);
	},
	Reset:function(){
		this.Traders = {};
	}
};

Trader.prototype.Update = async function(){
	var verify = await this.Verify();
	if (verify) {
		this.Trade();
	} else {
		this.Terminate();
	}
};

Trader.prototype.Terminate = async function(){
	if ((await this.Finish())) delete Trader.Organizer.Traders[this.ID];
};

Trader.prototype.setTimeout = function(oTime=10){
	return setTimeout(newFunction("Trader.Organizer.Traders[\""+this.ID+"\"].Update()"),oTime);
};

ATA.Setups.push(function() {
	Trader.Organizer.Setup();
});

ATA.Loops.push(function() { // 
	var thistime = new Date();
	var totalasset = Asset.TOTALUSDTCandle.Last().close;
	//ATA.EvalInUI(newFunction("ATA.Communication.Eval(\"UpdateAsset\","+totalasset+")"));
	//ATA.EvalInUI(newFunction("ATA.Communication.Eval(\"UpdateTime\","+(thistime.getTime() - ATA.StartTime)+")"));
});

ATA.Setups.push(function(){
	ATA.Processors.TDSequential = require("./BINANCE_0.1/TDSQ.js");
});

ATA.BackUp = {
	Folder:ATA.Settings.ROOT + "DATA\\",
	isReady:false,
	Period:60*1000, // 1 min
	lastActivite:0,
	List:[],
	Save:function(){
		
	},
	BackUpObject:function(objName){
		var text = "" + objName + " = ";
		text += DecodeObject(eval(objName)) + ";";
		ATA.Fs.writeFile(this.Folder + objName + ".js", text, "utf8", function(err,data) {});
	},
	Restore:function(){
		for (var i=0;i<this.List.length;i++){
			ATA.Fs.readFile(this.Folder + this.List[i] +  + ".js", {encoding:"utf8"}, function(err,data) {
				if (err) return;
				eval(data);
			});
		}
	},
	Setup:function(){
		ATA.log("BackUp System is started.");
		this.Restore();
		ATA.Loops.push(function() {
			var time = (new Date()).getTime();
			if (ATA.BackUp.lastActivite+ATA.BackUp.Period*10 < time) ATA.BackUp.Loop();
		});
	},
	Loop:function(){
		this.lastActivite = (new Date()).getTime();
		for (var i=0;i<this.List.length;i++) this.BackUpObject(this.List[i]);
		this.isReady = true;
		setTimeout(function(){ATA.BackUp.Loop();},this.Period);
	},
};

var DecodeObject = function(obj) {
	switch (typeof obj) {
		default:
		case "string":
			return JSON.stringify(obj);
		break;
		case "object":
			var keys = Object.keys(obj);
			var text = "{";
			for (var i=0;i<keys.length;i++) {
				text += JSON.stringify(keys[i]) + ":" + DecodeObject(obj[keys[i]]) + "";
				if (i < keys.length - 1) text += ",";
			}
			if (obj.constructor.name == "object") return text + "}";
			else return "Object.assign(new " + obj.constructor.name + "()," + text + "})";
		break;
		case "number":
			return obj;
		break;
		case "function":
			return obj+"";
		break;
		case "boolean":
			return obj+"";
		break;
	}
};

ATA.Setups.push(function(){
	ATA.BackUp.List.push("Trader.Organizer.Traders");
	setTimeout(function(){
		ATA.BackUp.Setup();
	},5000);
});

var Analyzer = {
	isReady:false,
	lastActivite:0,
	Period:30*1000, // 30 sec
	Pairs:{},
	Terms:["15m", "1h", "4h", "1d"], // "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"
	Setup:async function() {
		ATA.Loops.push(function() {
			var time = (new Date()).getTime();
			if (Analyzer.lastActivite+Analyzer.Period*10 < time) Analyzer.Loop();
		});
		this.Loop();
		ATA.log("Analyzer is started.");
	},
	Loop:async function() {
		this.lastActivite = (new Date()).getTime();
		//this.SendDatas();
		this.GetDatas();
		this.isReady = true;
		setTimeout(function(){Analyzer.Loop();},this.Period);
	},
	GetPossibility:function(key){
		var resp = {Volatility:0};
		if (!this.Pairs[key]) return resp;
		resp.Points = this.Pairs[key].Volatility;//Strategy.GetPairPointsByStrategy(item1.Currency,item1.Base);
		var weights = []; // [point,weight]...
		
		if (this.Pairs[key]["1d_TD9SQSETUPS"].filter(function(item,index,array){
			return item > 0;
		}).length > 0) resp.Points *= 0.9;
		if (this.Pairs[key]["4h_TD9SQSETUPS"].filter(function(item,index,array){
			return item > 0;
		}).length > 0) resp.Points *= 0.99;
		if (this.Pairs[key]["1h_TD9SQSETUPS"].filter(function(item,index,array){
			return item > 0;
		}).length > 0) resp.Points *= 0.99;
		if (this.Pairs[key]["15m_TD9SQSETUPS"].filter(function(item,index,array){
			return item > 0;
		}).length > 0) resp.Points *= 0.999;
		
		if (this.Pairs[key]["1d_RSI"].slice(-1)[0] > 65) resp.Points *= 0.9;
		if (this.Pairs[key]["4h_RSI"].slice(-1)[0] > 65) resp.Points *= 0.9;
		if (this.Pairs[key]["1h_RSI"].slice(-1)[0] > 65) resp.Points *= 0.8;
		if (this.Pairs[key]["15m_RSI"].slice(-1)[0] > 60) resp.Points *= 0.5;
		
		return resp;
	},
	SendDatas:function(){
		var pairs = [];
		for (var key in this.Pairs) {
			var params = this.GetPossibility(key);
			pairs.push({
				K:key,
				P:params.Points
			});
		}
		pairs.sort(function(a,b){
			if (a.P && b.P) {
				if (a.P >= b.P) return 1;
				else if (a.P >= b.P) return -1;
			}
			return 0;
		});
		
	},
	GetDatasFor:async function(key){
		if ((this.Pairs[key].time + 1000*60*10) > (new Date()).getTime()) return;
		this.Pairs[key].time = (new Date()).getTime();
		for (var i=0;i<this.Terms.length;i++) {
			this.Pairs[key][this.Terms[i]] = await this.GetSpecialTerm(key,this.Terms[i]);
			var indicators = this.ApplyIndicators(this.Pairs[key][this.Terms[i]]);
			var limit = 10;
			var ForFuzzy = true;
			this.Pairs[key].time = (new Date()).getTime();
			this.Pairs[key][this.Terms[i] + "_OPEN"] = indicators.open.slice(-limit);
			this.Pairs[key][this.Terms[i] + "_CLOSE"] = indicators.close.slice(-limit);
			this.Pairs[key][this.Terms[i] + "_HIGH"] = indicators.high.slice(-limit);
			this.Pairs[key][this.Terms[i] + "_LOW"] = indicators.low.slice(-limit);
			this.Pairs[key][this.Terms[i] + "_FPrice"] = indicators.FPrice.slice(-limit);
			
			this.Pairs[key][this.Terms[i] + "_RSI"] = indicators.RSI.slice(-limit);
			this.Pairs[key][this.Terms[i] + "_EMA"] = indicators.EMA.slice(-limit);
			this.Pairs[key][this.Terms[i] + "_SD"] = indicators.SD.slice(-limit);
			this.Pairs[key][this.Terms[i] + "_IchimokuCloud_DSAB"] = indicators.IchimokuCloud_DSAB.slice(-limit);
			this.Pairs[key][this.Terms[i] + "_TD9SQ"] = indicators.TD9SQ.slice(-limit);
			this.Pairs[key][this.Terms[i] + "_TD9SQSETUPS"] = indicators.TD9SQ.map(function(item){
				var sd_ = 0.33
				if (item.sellSetupPerfection) return 1;
				if (item.sellSetup) return 1-sd_;
				if (item.buySetupPerfection) return 0;
				if (item.buySetup) return sd_;
				return 0.5;
			}).slice(-limit);
			this.Pairs[key][this.Terms[i] + "_GAIN"] = indicators.Gain.slice(-limit);
			if (ForFuzzy) {
				this.Pairs[key][this.Terms[i] + "_OPEN_ForFuzzy"] = this.toScaleforFuzzy(indicators.open).slice(-limit);
				this.Pairs[key][this.Terms[i] + "_CLOSE_ForFuzzy"] = this.toScaleforFuzzy(indicators.close).slice(-limit);
				this.Pairs[key][this.Terms[i] + "_HIGH_ForFuzzy"] = this.toScaleforFuzzy(indicators.high).slice(-limit);
				this.Pairs[key][this.Terms[i] + "_LOW_ForFuzzy"] = this.toScaleforFuzzy(indicators.low).slice(-limit);
				this.Pairs[key][this.Terms[i] + "_FPrice_ForFuzzy"] = this.toScaleforFuzzy(indicators.FPrice).slice(-limit);
				this.Pairs[key][this.Terms[i] + "_RSI_ForFuzzy"] = indicators.RSI.map(function(x){return x/100}).slice(-limit);
				this.Pairs[key][this.Terms[i] + "_EMA_ForFuzzy"] = this.toScaleforFuzzy(indicators.EMA).slice(-limit);
				this.Pairs[key][this.Terms[i] + "_SD_ForFuzzy"] = this.toScaleforFuzzy(indicators.SD).slice(-limit);
				this.Pairs[key][this.Terms[i] + "_IchimokuCloud_DSAB_ForFuzzy"] = this.toScaleforFuzzy(indicators.IchimokuCloud_DSAB).slice(-limit);
				this.Pairs[key][this.Terms[i] + "_GAIN_ForFuzzy"] = indicators.Gain.map(function(x){return x-1}).slice(-limit);
			}
		}
	},
	GetDatas:async function(){
		var keys = Object.keys(this.Pairs).sort(function(key1,key2){
			try{
				var comp2 = this.Pairs[key2].time;
				var comp1 = this.Pairs[key1].time;
				if (comp1 > comp2) return -1;
				else if (comp1 < comp2) return 1;
			} catch (e) {}
			return 0;
		});
		var limit = Math.min(keys.length,10);
		for (var i=0;i<limit;i++) {
			var key = keys[i];
			this.GetDatasFor(key);
		}
	},
	GetSpecialTerm:async function(pair,per){
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
		var TD9SQ = ATA.Processors.TDSequential(candles);
		var Gains = Gain(ind_FPrice);
		//var ind_SMA = ATA.Indicator.SMA.calculate({period : 17, values : close});
		//var ind_CCI = ATA.Indicator.CCI.calculate({period : 19, open : open, high : high, low : low, close : close});
		//var deletelastforfilterf = function(item,index,arr){return index < arr.length - 1;};
		/*
		
		TD9SQ
		
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
			TD9SQ:TD9SQ,
			Gain:Gains,
		};
	},
	toScaleforFuzzy:function(arr){
		var min = Math.min.apply(Math,arr);
		var max = Math.max.apply(Math,arr);
		return arr.map(function(x){
			return (x - min) / (max - min);
		});
	},
	GetPairList:function(){
		return Object.keys(this.Pairs);
	},
	AddPair:function(cur1, cur2, vlt=1){
		var pair = "" + cur1 + cur2;
		if (!this.Pairs[pair]) this.Pairs[pair]={
			time:(new Date()).getTime() - 1000*60*15, // 15min
			Currency:cur1,
			Base:cur2
		};
		this.Pairs[pair].Volatility = vlt-0;
		this.GetDatasFor(pair);
	},
	RemovePair:function(pair){
		if (this.Pairs[pair]) delete this.Pairs[pair];
	},
};

ATA.Setups.push(function(){
	Analyzer.Setup();
});

// Start the system
ATA.Setup();