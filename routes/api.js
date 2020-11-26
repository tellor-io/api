const express = require('express')
const router = express.Router();
var Web3 = require('web3');
var fs = require('fs');
var tellorGetters = require('../constants/TellorGetters.json');
var tellorLens = require('../constants/Lens.json');
var web3, gettersContract, lensContract

function useNetwork(netName) {
	// "Web3.providers.givenProvider" will be set if in an Ethereum supported browser.
	switch (netName) {
		case "rinkeby":
			web3 = new Web3(process.env.nodeURLRinkeby || Web3.givenProvider);
			gettersContract = new web3.eth.Contract(tellorGetters.abi, '0xFe41Cb708CD98C5B20423433309E55b53F79134a');
			lensContract = new web3.eth.Contract(tellorLens.abi, '0xcd3cf271dE99890e9EB37CE6EEDFA1CB2533D6Af');
			break;
		default:
			netName = "mainnet"
			web3 = new Web3(process.env.nodeURL || Web3.givenProvider);
			gettersContract = new web3.eth.Contract(tellorGetters.abi, '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5');
	}
	console.log("using network:", netName)
}

function processInput(filename, json) {
	fs.open(filename, 'a', function (e, id) {
		if (e != null) {
			console.log("open stats file for appending", e)
			return
		}
		fs.write(id, json + "\n", null, 'utf8', function () {
			fs.close(id, function () {
				console.log('file is updated');
			});
		});
	});
}

// Get general Tellor state data and saves the data under data/state.json
router.get('/:netName?/info', async function (req, res) {
	useNetwork(req.params.netName)
	console.log('getting all variable information...')
	//read data from Tellor's contract
	var _stakerCount = await gettersContract.methods.getUintVar("0xedddb9344bfe0dadc78c558b8ffca446679cbffc17be64eb83973fce7bea5f34").call();
	var _difficulty = await gettersContract.methods.getUintVar("0xb12aff7664b16cb99339be399b863feecd64d14817be7e1f042f97e3f358e64e").call();
	var _currentRequestId = await gettersContract.methods.getUintVar("0x7584d7d8701714da9c117f5bf30af73b0b88aca5338a84a21eb28de2fe0d93b8").call();
	var _disputeCount = await gettersContract.methods.getUintVar("0x475da5340e76792184fb177cb85d21980c2530616313aef501564d484eb5ca1e").call();
	var _totalSupply = await gettersContract.methods.getUintVar("0xb1557182e4359a1f0c6301278e8f5b35a776ab58d39892581e357578fb287836").call();
	var _timeOfLastValue = await gettersContract.methods.getUintVar("0x97e6eb29f6a85471f7cc9b57f9e4c3deaf398cfc9798673160d7798baf0b13a4").call();
	var _requestCount = await gettersContract.methods.getUintVar("0x05de9147d05477c0a5dc675aeea733157f5092f82add148cf39d579cafe3dc98").call();
	res.send({
		stakerCount: _stakerCount,
		difficulty: _difficulty,
		currentRequestId: _currentRequestId,
		disputeCount: _disputeCount,
		total_supply: _totalSupply,
		timeOfLastNewValue: _timeOfLastValue,
		requestCount: _requestCount
	})

	//Allows user to save the API data requested to a file under the data folder
	let _now = Date.now();
	var state = "state";
	state = {
		timeChecked: _now,
		stakerCount: _stakerCount,
		difficulty: _difficulty,
		currentRequestId: _currentRequestId,
		disputeCount: _disputeCount,
		total_supply: _totalSupply,
		timeOfLastNewValue: _timeOfLastValue,
		requestCount: _requestCount
	}
	var jsonStats = JSON.stringify(state);
	let filename = "public/state.json";
	processInput(filename, jsonStats);
})

//Get data for as specific price request
router.get('/:netName?/price/:requestID/:count?', async function (req, res) {
	useNetwork(req.params.netName)
	var reqCount = req.params.count
	// reqCount is optional so set to 1 when undefined.
	if (reqCount == undefined) {
		reqCount = 1
	}
	var reqID = req.params.requestID
	console.log('getting last', reqCount, 'prices for request ID', reqID);

	var r = await lensContract.methods.getLastNewValues(reqID, reqCount).call()
	var results = [];
	for (let index = 0; index < r.length; index++) {
		results.push({
			timestamp: r[index][0],
			value: r[index][1],
		})
	};
	res.send(results);
})

//Get data for a specific dispute
router.get('/:netName?/dispute/:disputeID', async function (req, res) {
	useNetwork(req.params.netName)
	console.log('getting dispute info...', req.params.disputeID);
	var _returned = await gettersContract.methods.getAllDisputeVars(req.params.disputeID).call();
	res.send({
		hash: _returned[0],
		executed: _returned[1],
		disputeVotePassed: _returned[2],
		isPropFork: _returned[3],
		reportedMiner: _returned[4],
		reportingParty: _returned[5],
		proposedForkAddress: _returned[6],
		requestId: _returned[7],
		timestamp: _returned[8],
		value: _returned[9],
		minExecutionDate: _returned[10],
		numberOfVotes: _returned[11],
		blockNumber: _returned[12],
		minerSlot: _returned[13],
		quorum: _returned[14],
		fee: _returned[15],
	})
})

//Get data for a specific dispute
router.get('/:netName?/requestq', async function (req, res) {
	useNetwork(req.params.netName)
	console.log('getting requestq...');
	var _returned = await gettersContract.methods.getRequestQ().call();
	res.send({
		requestq: _returned
	})
})

//Get data for information about the specified requestID
router.get('/:netName?/requestinfo/:requestID', async function (req, res) {
	useNetwork(req.params.netName)
	console.log('getting requestID information...', req.params.requestID);
	var _returned = await gettersContract.methods.getRequestVars(req.params.requestID).call();
	res.send({
		apiString: _returned[0],
		dataSymbol: _returned[1],
		queryHash: _returned[2],
		granularity: _returned[3],
		requestQPosition: _returned[4],
		totalTip: _returned[5]
	})
})

module.exports = router;