const express = require('express')
const router = express.Router();
// const { ethers } = require("hardhat");
var Web3 = require('web3');
var fs = require('fs');
var web3, tellorMaster, tellorMaster, tellorLens, tellorGovernance, tellorOracle

function useNetwork(netName, res) {
	// "Web3.providers.givenProvider" will be set if in an Ethereum supported browser.
	try {
		console.log(process.cwd())
		const masterABI = JSON.parse(fs.readFileSync("contracts/tellorMaster.json"));
		const lensABI = JSON.parse(fs.readFileSync("contracts/tellorLens.json"));
		const governanceABI = JSON.parse(fs.readFileSync("contracts/tellorGovernance.json"));
		const oracleABI = JSON.parse(fs.readFileSync("contracts/tellorOracle.json"));

		switch (netName) {
			case "rinkeby":
				web3 = new Web3(process.env.nodeURLRinkeby || Web3.givenProvider);
				tellorMaster = new web3.eth.Contract(masterABI, '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0');
				tellorLens = new web3.eth.Contract(lensABI, '0x16aC7874290B086D37D1B1ABC18153A8dCe8A335');
				break;
			default:
				netName = "mainnet"
				web3 = new Web3(process.env.nodeURL || Web3.givenProvider);
				tellorMaster = new web3.eth.Contract(masterABI, '0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x51d4088d4EeE00Ae4c55f46E0673e9997121DB00');
				tellorLens = new web3.eth.Contract(lensABI, '0xd259A9F7d5b263C400284e9544C9c0088c481cfd');
				tellorOracle = new web3.eth.Contract(oracleABI, '0xe8218cACb0a5421BC6409e498d9f8CC8869945ea');
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
		var _disputeCount = await tellorGovernance.methods.getVoteCount().call();
		var _totalSupply = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_TOTAL_SUPPLY")).call();
		var _timeOfLastValue = await tellorOracle.methods.getTimeOfLastNewValue().call();
		res.send({
			stakerCount: _stakerCount,
			disputeCount: _disputeCount,
			total_supply: _totalSupply,
			timeOfLastNewValue: _timeOfLastValue,
		})

		//Allows user to save the API data requested to a file under the data folder
		let _now = Date.now();
		var state = "state";
		state = {
			timeChecked: _now,
			stakerCount: _stakerCount,
			difficulty: _difficulty,
			//currentRequestId: _currentRequestId,
			disputeCount: _disputeCount,
			total_supply: _totalSupply,
			timeOfLastNewValue: _timeOfLastValue,
			//requestCount: _requestCount
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
router.get('/:netName?/price/:queryID/:count?', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		var reqCount = req.params.count
		// reqCount is optional so set to 1 when undefined.
		if (reqCount == undefined) {
			reqCount = 1
		}
		var queryID = req.params.queryID
		var scale = queryID === "0x000000000000000000000000000000000000000000000000000000000000000a" ? 1e18 : 1e6;
		console.log('getting last', reqCount, 'prices for request ID', queryID);
		var r = await tellorLens.methods.getLastValues(queryID, reqCount).call()
		var results = [];
		for (let index = 0; index < r.length; index++) {
		    var val = web3.utils.hexToNumberString(r[index].value) / scale;
			results.push({
				timestamp: r[index].timestamp,
				value: val.toString(),
			})
		};
		res.send(results);
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

//Get latest data for all data IDs
router.get('/:netName?/prices/:queryIds?/:count?', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		var reqCount = req.params.count
		// reqCount is optional so set to 1 when undefined.
		if (reqCount == undefined) {
			reqCount = 1
		}
        var queryIds0 = req.params.queryIds;
        var queryIds = queryIds0.split("-");
		console.log('getting last', reqCount, 'prices for following data IDs:', queryIds);

		var r = await tellorLens.methods.getLastValuesAll(reqCount, queryIds).call()
		//console.log(r);
		var results = [];
		for (let index = 0; index < r.length; index++) {
			if (+r[index].value != 0) {
			    var scale = r[index].meta.id === "0x000000000000000000000000000000000000000000000000000000000000000a" ? 1e18 : 1e6;
			    var val = web3.utils.hexToNumberString(r[index].value) / scale;
				results.push({
					timestamp: r[index].timestamp,
					value: val,
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
		var _returned = await tellorGovernance.methods.getDisputeInfo(req.params.disputeID).call();
		res.send({
			queryId: _returned[0],
			timestamp: _returned[1],
			value: _returned[2],
			disputedReporter: _returned[3]
		})
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})



router.get('/:netName?/getDisputeFee', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		let disputeFee = Web3.utils.fromWei(await tellorMaster.methods.getUintVar(web3.utils.keccak256('_DISPUTE_FEE')).call());
		res.send({ disputeFee })
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
		console.log(resp);
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