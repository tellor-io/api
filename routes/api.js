const express = require('express')
const router = express.Router();
// const { ethers } = require("hardhat");
var Web3 = require('web3');
var fs = require('fs');
var web3, tellorFlex, tellorLens, tellorGovernance, tellorMaster

function useNetwork(netName, res) {
	// "Web3.providers.givenProvider" will be set if in an Ethereum supported browser.
	try {
		console.log(process.cwd())
		const flexABI = JSON.parse(fs.readFileSync("contracts/tellorFlex.json"));
		const masterABI = JSON.parse(fs.readFileSync("contracts/tellorMaster.json"));
		const governanceABI = JSON.parse(fs.readFileSync("contracts/tellorGovernance.json"));
		//const oracleABI = JSON.parse(fs.readFileSync("contracts/tellorOracle.json"));


        //ADD: ropsten, goerli, harmony, kovan
		switch (netName) {
			case "rinkeby":
				web3 = new Web3("https://rinkeby.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0x095869B6aAAe04422C2bdc6f185C1f2Aba41EA6B');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x3eb81A11DD28Fe8ED9f53D1456248aC86d5893C6');
				break;

            case "polygon":
				web3 = new Web3("https://polygon-mainnet.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0xFd45Ae72E81Adaaf01cC61c8bCe016b7060DD537');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x98458269081eD05bA58babE3f004E46625C8D9F2');
				break;

			case "polygon-mumbai":
				web3 = new Web3("https://polygon-mumbai.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0x41b66dd93b03e89D29114a7613A6f9f0d4F40178');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x8A868711e3cE97429faAA6be476F93907BCBc2bc');
				break;

            case "arbitrum-rinkeby":
				web3 = new Web3("https://arbitrum-rinkeby.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0xbB97C038c338c3DcAF06D5be3B4A3e0B24835f9C');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x3eb81A11DD28Fe8ED9f53D1456248aC86d5893C6');
				break;

			case "optimism-kovan":
				web3 = new Web3("https://optimism-kovan.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0xa0013274d34a7c469952379646F26aA1C1237131');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x3eb81A11DD28Fe8ED9f53D1456248aC86d5893C6');
				break;
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
		var _stakeAmount = await tellorLens.methods.getStakeAmount().call();
		var _amountStaked = await tellorLens.methods.getTotalStakeAmount().call();
		var _stakerCount = _amountStaked / _stakeAmount
		var _disputeCount = await tellorGovernance.methods.getVoteCount().call();
		//var _totalSupply = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_TOTAL_SUPPLY")).call();
		var _timeOfLastValue = await tellorFlex.methods.getTimeOfLastNewValue().call();
		res.send({
			stakeAmount: _stakeAmount,
			amountStaked: _amountStaked,
			stakerCount: _stakerCount,
			disputeCount: _disputeCount,
			timeOfLastNewValue: _timeOfLastValue,
		})

		//Allows user to save the API data requested to a file under the data folder
		let _now = Date.now();
		var state = "state";
		state = {
			timeChecked: _now,
			stakeAmount: _stakeAmount,
			amountStaked: _amountStaked,
			stakerCount: _stakerCount,
			disputeCount: _disputeCount,
			timeOfLastNewValue: _timeOfLastValue,
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
		console.log('getting last', reqCount, 'prices for queryID', queryID);
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


//Get data for a specific dispute
router.get('/:netName?/dispute/:disputeID', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		console.log('getting dispute info...', req.params.disputeID);
		var _returned = await tellorLens.methods.getDisputeInfo(req.params.disputeID).call();
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
		let disputeFee = await tellorLens.methods.getDisputeFee().call();
		res.send({ disputeFee })
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})


//Get data for a specific dispute
router.get('/:netName?/StakerInfo/:address', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		var resp = await tellorFlex.methods.getStakerInfo(req.params.address).call();
		console.log(resp);
		res.send({
			stakeDate: resp[0],
			stakedBalance: resp[1],
			lockedBalance; resp[2],
			reporterLastTimestamp: resp[3],
			reportsSubmitted: resp[4]
		})
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})


module.exports = router;