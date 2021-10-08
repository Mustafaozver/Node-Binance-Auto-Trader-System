/*
Strategy.FilterByStrategy = function(Currency,Base){};
Strategy.GetPairPointsByStrategy = function(Currency,Base){};
Strategy.UpdatePositionByStrategy = function(Currency,Base){};
Strategy.LongTermProcess = function(Currency,Base){};
*/

ATA.UI = {
	Send:function(oCode){
		ATA.EvalInUI(""+oCode);
	},
	SendObject:function(oObjName){
		ATA.EvalInUI("ATA.UI.UpdateObject(\""+oObjName+"\","+JSON.stringify(eval(oObjName))+")");
	},
	
};