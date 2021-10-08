var token = "";
var TelegramBot = require('node-telegram-bot-api');
var bot =  new TelegramBot(token, {polling: true});
bot.on('message', async function(msg){bot.sendMessage(msg.chat.id, 'Received your message');console.log(msg);});
bot.getChat("@avalancheavax").then(function(chat){console.log(chat);});

var Telegram = {
	isReady:false,
	Period:10*60*1000,
	lastActivite:0,
	Token:"",
	Bot:null,
	Setup:function() {
		this.Bot = new ATA.Telegram(this.Token, {polling: true});
		this.Loop();
		ATA.log("Telegram is started.");
		ATA.Loops.push(function() {
			var time = (new Date()).getTime();
			if (Telegram.lastActivite+Telegram.Period*10 < time) Telegram.Loop();
		});
		this.Bot.on("message",async function(msg){
			Telegram.OnMessage(msg);
		});
	},
	Loop:async function() {
		this.lastActivite = (new Date()).getTime();
		this.isReady = true;
		setTimeout(function(){Telegram.Loop();},this.Period);
	},
	SendMessage:function(who,message){
		this.Bot.sendMessage(who,message);
	},
	OnMessage:function(msg){},
};

ATA.Setups.push(function() {
	Telegram.Setup();
});