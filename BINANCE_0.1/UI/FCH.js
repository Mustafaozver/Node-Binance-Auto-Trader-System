// ATA
// Chrome Extension Javascript File
// 2021 (Mustafa ÖZVER)

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

var ATA = {};
ATA.loopTime = 1000;
ATA.StartTime = (new Date()).getTime();
ATA.lastActivite = ATA.StartTime;
ATA.Loops = [];
ATA.Setups = [];

ATA.Settings = {
	ID:"ATA_Client_MEGALODON",
	DOMAIN:"localhost",
	PORT:224
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

ATA.Setups.push(function(){
	/*var element = document.createElement("IFRAME");
	element.src = "http://"+ATA.Settings.DOMAIN+":"+ATA.Settings.PORT+"/deneme.html";
	document.body.append(element);
	ATA.FRAME = element;*/
});

ATA.Post = function(ajaxd,data) {
	var AjaxData = {
		url:"http://"+ATA.Settings.DOMAIN+":"+ATA.Settings.PORT+"/?" + $.param(data),
		headers: {  'Access-Control-Allow-Origin': '*' },
		crossDomain: true,
		secure: true,
		dataType: 'jsonp',
		beforeSend: function (xhr) {
			xhr.setRequestHeader ("Authorization", "Basic " + btoa(""));
		},
		type:"POST",
		data:{},
		success:function(response) {},
		error:function(){}
	};
	Object.assign(AjaxData,ajaxd);
	$.ajax(AjaxData);
};

ATA.EvalInCore = function(oFun,Args){
	return;
	var id = generate_ID();
	var ocode = "(" + oFun + ")("+(Args?Args.map(function(x){return JSON.stringify(x)}):"")+");";
	ATA.Post({
		success:function(data) {
			if (data.Error) WriteAnswer(data);
			else console.log(data);
		}
	},{
		ID:id,
		TODO:btoa("(function(){var Answer=true;try {\n\n\r\n"+ocode+"\n\n\r\n;}catch(e){return false;}return Answer;})()")
	});
};

ATA.Setups.push(function(){
	ATA.EvalInCore(function(){
		console.log("The console in core");
	});
});

ATA.DataCenter = {};

ATA.UI = {};

setTimeout(function(){ATA.Setup();},5000);

/////////////////////////////////////////

