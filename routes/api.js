const express = require('express')
const router = express.Router();
var Web3 = require('web3');
var fs = require('fs');
var web3, tellorMaster, tellorMaster, tellorLens

function useNetwork(netName, res) {
	// "Web3.providers.givenProvider" will be set if in an Ethereum supported browser.
	try {
		console.log(process.cwd())
		const masterABI = JSON.parse(fs.readFileSync("contracts/tellorMaster.json"));
		const lensABI = JSON.parse(fs.readFileSync("contracts/tellorLens.json"));

		switch (netName) {
			case "rinkeby":
				web3 = new Web3(process.env.nodeURLRinkeby || Web3.givenProvider);
				tellorMaster = new web3.eth.Contract(masterABI, '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0');
				tellorLens = new web3.eth.Contract(lensABI, '0xebEF7ceB7C43850898e258be0a1ea5ffcdBc3205');
				break;
			default:
				netName = "mainnet"
				web3 = new Web3(process.env.nodeURL || Web3.givenProvider);
				tellorMaster = new web3.eth.Contract(masterABI, '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0');
				tellorLens = new web3.eth.Contract(lensABI, '0x577417CFaF319a1fAD90aA135E3848D2C00e68CF');
		}
		console.log("using network:", netName)
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
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
	try {
		useNetwork(req.params.netName, res)
		console.log('getting all variable information...')
		//read data from Tellor's contract
		var _stakerCount = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_STAKE_COUNT")).call();
		var _difficulty = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_DIFFICULTY")).call();
		var _currentRequestId = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_CURRENT_REQUESTID")).call();
		var _disputeCount = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_DISPUTE_COUNT")).call();
		var _totalSupply = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_TOTAL_SUPPLY")).call();
		var _timeOfLastValue = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_TIME_OF_LAST_NEW_VALUE")).call();
		var _requestCount = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_REQUEST_COUNT")).call();
		var _slotProgress = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_SLOT_PROGRESS")).call();
		res.send({
			stakerCount: _stakerCount,
			difficulty: _difficulty,
			currentRequestId: _currentRequestId,
			disputeCount: _disputeCount,
			total_supply: _totalSupply,
			timeOfLastNewValue: _timeOfLastValue,
			requestCount: _requestCount,
			slotProgress: _slotProgress
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
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

//Get data for as specific price request
router.get('/:netName?/price/:requestID/:count?', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		var reqCount = req.params.count
		// reqCount is optional so set to 1 when undefined.
		if (reqCount == undefined) {
			reqCount = 1
		}
		var reqID = req.params.requestID
		console.log('getting last', reqCount, 'prices for request ID', reqID);

		var r = await tellorLens.methods.getLastValues(reqID, reqCount).call()
		var results = [];
		for (let index = 0; index < r.length; index++) {
			results.push({
				timestamp: r[index].timestamp,
				value: r[index].value,
			})
		};
		res.send(results);
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

//Get latest data for all data IDs
router.get('/:netName?/prices/:count?', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		var reqCount = req.params.count
		// reqCount is optional so set to 1 when undefined.
		if (reqCount == undefined) {
			reqCount = 1
		}

		console.log('getting last', reqCount, 'prices for for all data IDs');

		var r = await tellorLens.methods.getLastValuesAll(reqCount).call()
		var results = [];
		for (let index = 0; index < r.length; index++) {
			if (+r[index].value != 0) {
				results.push({
					timestamp: r[index].timestamp,
					value: +r[index].value / +r[index].meta.granularity,
					name: r[index].meta.name,
					id: r[index].meta.id,
					tip: r[index].tip,
				})
			}

		};
		res.send(results);
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

//Get data for a specific dispute
router.get('/:netName?/dispute/:disputeID', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		console.log('getting dispute info...', req.params.disputeID);
		var _returned = await tellorMaster.methods.getAllDisputeVars(req.params.disputeID).call();
		res.send({
			hash: _returned[0],
			executed: _returned[1],
			disputeVotePassed: _returned[2],
			isPropFork: _returned[3],
			reportedMiner: _returned[4],
			reportingParty: _returned[5],
			proposedForkAddress: _returned[6],
			requestID: _returned[7][0],
			timestamp: _returned[7][1],
			value: _returned[7][2],
			minExecutionDate: _returned[7][3],
			numberOfVotes: _returned[7][4],
			blockNumber: _returned[7][5],
			minerSlot: _returned[7][6],
			quorum: _returned[7][7],
			fee: _returned[7][8],
			tally: _returned[8]
		})
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})


//Get data for a specific dispute
router.get('/:netName?/requestq', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		console.log('getting requestq...');
		var _returned = await tellorMaster.methods.getRequestQ().call();
		res.send({
			requestq: _returned
		})
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

//Get data for information about the specified requestID
router.get('/:netName?/requestinfo/:requestID', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		console.log('getting requestID information...', req.params.requestID);
		var _returned = await tellorMaster.methods.getRequestVars(req.params.requestID).call();
		res.send({
			requestQPosition: _returned[0],
			totalTip: _returned[1],
		})
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

// Get data for information about the specified requestID
// challenge, currentRequestId, level of difficulty, api/query string, and granularity(number of decimals requested), total tip for the request
router.get('/:netName?/currentVariables', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		let variables = await tellorMaster.methods.getNewCurrentVariables().call();
		res.send({ variables })
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

router.get('/:netName?/getDisputeFee', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		let disputeFee = await tellorMaster.methods.getUintVar(web3.utils.keccak256('_DISPUTE_FEE')).call();
		res.send({ disputeFee })
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

router.get('/:netName?/getMiners/:requestID/:timestamp', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		let data = await tellorMaster.methods.getMinersByRequestIdAndTimestamp(req.params.requestID, req.params.timestamp).call();
		res.send(data)
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

//Get data for a specific dispute
router.get('/:netName?/getStakerInfo/:address', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		var resp = await tellorMaster.methods.getStakerInfo(req.params.address).call();
		res.send({
			status: resp[0],
			stakeDate: resp[1],
		})
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})


module.exports = router;