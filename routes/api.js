const express = require('express')
const router = express.Router();
// const { ethers } = require("hardhat");
var Web3 = require('web3');
var fs = require('fs');
require("dotenv").config()

var web3, tellorFlex, tellorLens, tellorGovernance, tellorMaster, tellorAutopay

function useNetwork(netName, res) {
	// "Web3.providers.givenProvider" will be set if in an Ethereum supported browser.
	try {
		console.log(process.cwd())
		const flexABI = JSON.parse(fs.readFileSync("contracts/tellorFlex.json"));
		const masterABI = JSON.parse(fs.readFileSync("contracts/tellorMaster.json"));
		const governanceABI = JSON.parse(fs.readFileSync("contracts/tellorGovernance.json"));
		const lensOldABI = JSON.parse(fs.readFileSync("contracts/tellorLensOld.json"));
		const autopayABI = JSON.parse(fs.readFileSync("contracts/tellorAutopay.json"));

        //ADD: ropsten, goerli, harmony
		switch (netName) {
			case "mainnet":
				web3 = new Web3("https://mainnet.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorMaster = new web3.eth.Contract(masterABI, "0x88df592f8eb5d7bd38bfef7deb0fbc02cf3778a0")
				tellorLens = new web3.eth.Contract(lensOldABI, '0xd259A9F7d5b263C400284e9544C9c0088c481cfd')
				tellorGovernance = new web3.eth.Contract(governanceABI, "0x51d4088d4EeE00Ae4c55f46E0673e9997121DB00")

			case "rinkeby":
				web3 = new Web3("https://rinkeby.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0x095869B6aAAe04422C2bdc6f185C1f2Aba41EA6B');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x3eb81A11DD28Fe8ED9f53D1456248aC86d5893C6');

				break;

            case "polygon":
				web3 = new Web3("https://polygon-mainnet.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0xFd45Ae72E81Adaaf01cC61c8bCe016b7060DD537');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x98458269081eD05bA58babE3f004E46625C8D9F2');
				tellorLens = new web3.eth.Contract(lensABI, '0x9bdb513a3099f7871123bd736c4ce01b948e4b0d')
				tellorAutopay = new web3.eth.Contract(autopayABI, '0xD789488E5ee48Ef8b0719843672Bc04c213b648c')
				break;

			case "polygon-mumbai":
				web3 = new Web3("https://polygon-mumbai.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0x41b66dd93b03e89D29114a7613A6f9f0d4F40178');
				tellorLens = new web3.eth.Contract(lensABI, '0x9bDb513A3099f7871123bd736C4Ce01B948e4B0d')
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x8A868711e3cE97429faAA6be476F93907BCBc2bc');
				tellorAutopay = new web3.eth.Contract(autopayABI, '0xD789488E5ee48Ef8b0719843672Bc04c213b648c');
				break;

            case "arbitrum-testnet":
				web3 = new Web3("https://arbitrum-testnet.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0xbB97C038c338c3DcAF06D5be3B4A3e0B24835f9C');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x3eb81A11DD28Fe8ED9f53D1456248aC86d5893C6');
				tellorLens = new web3.eth.Contract(lensABI, '0x9bdb513a3099f7871123bd736c4ce01b948e4b0d')
				tellorAutopay = new web3.eth.Contract(autopayABI, '0x7B49420008BcA14782F2700547764AdAdD54F813')
				break;

			case "kovan":
				web3 = new Web3("https://kovan.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				tellorFlex = new web3.eth.Contract(flexABI, '0xa0013274d34a7c469952379646F26aA1C1237131');
				tellorGovernance = new web3.eth.Contract(governanceABI, '0x3eb81A11DD28Fe8ED9f53D1456248aC86d5893C6');
				tellorLens = new web3.eth.Contract(lensABI, '0x9bDb513A3099f7871123bd736C4Ce01B948e4B0d')
				tellorAutopay = new web3.eth.Contract(autopayABI, '0x7B49420008BcA14782F2700547764AdAdD54F813')
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
		if (req.params.netName == "mainnet") {
			var _stakeAmount = await tellorLens.methods.stakeAmount().call();
			var _amountStaked = await tellorLens.methods.stakeCount().call();
			var _stakerCount = _amountStaked / _stakeAmount
			var _disputeCount = await tellorGovernance.methods.getVoteCount().call();
			var _timeOfLastValue = await tellorFlex.methods.getTimeOfLastNewValue().call();
		}
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
		//var scale = queryID === "0x000000000000000000000000000000000000000000000000000000000000000a" ? 1e18 : 1e6;
		var scale = 1e6;
		console.log('getting last', reqCount, 'prices for queryID', queryID);
		var r = await tellorLens.methods.getLastValues(queryID, reqCount).call()
		console.log("here")
		var results = [];
		for (let index = 0; index < r.length; index++) {
		    var val = web3.utils.hexToNumberString(r[index].value) / scale;
			results.push({
				timestamp: Number(r[index].timestamp),
				value: Number(val.toString()),
			})
		};
		res.send(results);
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

//Get tipcount for a specific queryid
router.get('/:netName?/tips/:queryID', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		var queryID = req.params.queryID
		console.log('getting tip count for queryID', queryID);
		var r = await tellorAutopay.methods.getPastTipCount(queryID).call()
        var results = [];
        results.push({
        tipcount: r.toString()})
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
			lockedBalance: resp[2],
			reporterLastTimestamp: resp[3],
			reportsSubmitted: resp[4]
		})
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})

router.get('/circulatingSupply', async function (req, res) {

	try {
		let circulatingSupply, multiSigBalance, devShare
		useNetwork("mainnet", res)
		var _totalSupply = await tellorMaster.methods.getUintVar(web3.utils.keccak256("_TOTAL_SUPPLY")).call();
		_totalSupply = Number(_totalSupply) / Number(1E18)
		multiSigBalance = await tellorMaster.methods.balanceOf("0x39e419ba25196794b595b2a595ea8e527ddc9856").call()
		devShare = await tellorMaster.methods.balanceOf("0xAa304E98f47D4a6a421F3B1cC12581511dD69C55").call()
		multiSigBalance = Number(multiSigBalance) / Number(1E18)
		devShare = Number(devShare) / Number(1E18)
		circulatingSupply = _totalSupply - multiSigBalance - devShare
		res.send(
			"" + _totalSupply
		)
	} catch (e) {
		let err = e.message
		res.send({ err });
	} 
})


module.exports = router;