if (!Infinity) var Infinity = 99999999999999999;

var toFixedPrice = function(num,step=0.00000000000000001) {
	num = Math.floor(num/step)*step;
	return ""+parseFloat(num).toPrecision(5);
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

var ATA = {};
ATA.loopTime = 1000;
ATA.StartTime = (new Date()).getTime();
ATA.lastActivite = ATA.StartTime;
ATA.Loops = [];
ATA.Setups = [];

ATA.Settings = {
	ID:"ATA_Client" + generate_ID(),
};


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

ATA.Setups.push(function(){});

////////////////////////////////////////////////////////////////////////////////////////////////////

var WriteAnswer = function(){};

ATA.EvalInCore = function(oFun,Args){
	var id = generate_ID();
	var ocode = "(" + oFun + ")("+(Args?Args.map(function(x){return JSON.stringify(x)}):"")+");";
	ATA.Post({
		success:function(data) {
			if (data.Error) WriteAnswer(data);
			else if (data.Answer) WriteAnswer(data.Answer);
			else console.log(data);
		}
	},{
		ID:id,
		TODO:btoa("(function(){var Answer=true;try {\n\n\r\n"+ocode+"\n\n\r\n;}catch(e){return false;}return Answer;})()")
	});
};
ATA.Post = function(ajaxd,data) {
	var AjaxData = {
		url:"/?" + $.param(data),
		type:"POST",
		data:{},
		success:function(response) {},
		error:function(){}
	};
	Object.assign(AjaxData,ajaxd);
	$.ajax(AjaxData);
};

ATA.SyncProcess = function() {
	var id = generate_ID();
	ATA.Post({
		success:function(data) {
			console.log(data);
		}
	},{
		ID:id,
		TODO:btoa("ATA")
	});
};

ATA.Communication = {
	Data:function(data){
		if (data.TYPE) {
			switch(data.TYPE) {
				case "LOG":
					ATA.log(data.DATA["0"]);
				break;
				case "EVAL":
					try {
						eval(data.DATA);
					} catch (e) {
						console.log("Error on Client Code, ", e);
					}
				break;
				default:
				break;
			}
		} else {
			console.log("UNKNOWN DATA = ", data);
		}
	}
};

ATA.Setups.push(function(){
	ATA.Socket = io("ws://" + ATA.Settings.DOMAIN + ":" + ATA.Settings.PORT,{
		path:"/SOCKET"
	});
	ATA.Socket.on("0",function(){
		ATA.Socket.emit("0");
		ATA.Socket.on("APPROVED",function(){
			ATA.Socket.emit("JOIN",ATA.Settings.ID);
			ATA.Socket.on("DATA",function(data){ATA.Communication.Data(data);});
			ATA.SendData = function(data){ATA.Socket.emit("DATA",data);};
		});
	});
	setTimeout(function(){
		ATA.EvalInCore(function(id){
			ATA.EvalInUI(function(id){
				if (id == ATA.Settings.ID) console.log(" :))) The console in ui by " +  id);
				else console.log("Socket error :(((( ");
			},[id],id);
			console.log("The console in core send by " + id);
		},[ATA.Settings.ID]);
	},5000);
});

ATA.DataCenter = {};

ATA.UI = {};