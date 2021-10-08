// Brain.js Models

var ___F = async function() {
ATA.AI.Net1 = new brain.NeuralNetwork({
	hiddenLayers: [128,128,128,128,64], // array of ints for the sizes of the hidden layers in the network
	binaryThresh: 0.5,
	activation: "sigmoid", // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
	leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
});

ATA.AI.Net1.train([
	{
		input: {
			RSI:0
		},
		output: {
			BUY:1,
			SELL:0
		}
	},
	{
		input: {
			RSI:1
		},
		output: {
			BUY:0,
			SELL:1
		}
	},
	{
		input: {
			CCI:0
		},
		output: {
			BUY:1,
			SELL:0.2
		}
	},
	{
		input: {
			CCI:1
		},
		output: {
			BUY:0.2,
			SELL:1
		}
	}
],{
	errorThresh: 0.005,		// error threshold to reach before completion
	iterations: 10000,		// maximum training iterations 
	log: true,				// console.log() progress periodically 
	logPeriod: 10,			// number of iterations between logging 
	learningRate: 0.333,	// learning rate ,    // scales with delta to effect training rate --> number between 0 and 1
	momentum: 0.1,			// scales with next layer's change value --> number between 0 and 1
	callback: null,			// a periodic call back that can be triggered while training --> null or function
	callbackPeriod: 10,		// the number of iterations through the training data between callback calls --> number greater than 0
	timeout: Infinity		// number of Tests
});

};

//___F();