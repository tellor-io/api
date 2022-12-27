const express = require('express')
const router = express.Router();
// const { ethers } = require("hardhat");
var Web3 = require('web3');
var fs = require('fs');
require("dotenv").config()

var token, oracle, governance, autopay

function useNetwork(netName, res) {
	// "Web3.providers.givenProvider" will be set if in an Ethereum supported browser.
	try {
		console.log(process.cwd())
		const flexABI = JSON.parse(fs.readFileSync("contracts/tellorFlex.json"));
		const masterABI = JSON.parse(fs.readFileSync("contracts/tellorMaster.json"));
		const governanceABI = JSON.parse(fs.readFileSync("contracts/tellorGovernance.json"));
		const autopayABI = JSON.parse(fs.readFileSync("contracts/tellorAutopay.json"));
		const oracleABI = JSON.parse(fs.readFileSync("contracts/tellorOracle.json"))

        //ADD: ropsten, goerli, harmony
		switch (netName) {
			case "mainnet":
				web3 = new Web3("https://mainnet.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				token = new web3.eth.Contract(masterABI, "0x88df592f8eb5d7bd38bfef7deb0fbc02cf3778a0")
				governance = new web3.eth.Contract(governanceABI, "0x02803dcFD7Cb32E97320CFe7449BFb45b6C931b8")
				autopay = new web3.eth.Contract(autopayABI, "0x1F033Cb8A2Df08a147BC512723fd0da3FEc5cCA7")
				oracle = new web3.eth.Contract(oracleABI, "0xB3B662644F8d3138df63D2F43068ea621e2981f9")
				break
			case "goerli":
				web3 = new Web3("https://mainnet.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				token = new web3.eth.Contract(masterABI, "0x88df592f8eb5d7bd38bfef7deb0fbc02cf3778a0")
				governance = new web3.eth.Contract(governanceABI, "0x02803dcFD7Cb32E97320CFe7449BFb45b6C931b8")
				autopay = new web3.eth.Contract(autopayABI, "0x1F033Cb8A2Df08a147BC512723fd0da3FEc5cCA7")
				oracle = new web3.eth.Contract(oracleABI, "0xB3B662644F8d3138df63D2F43068ea621e2981f9")
				break
            case "polygon":
				web3 = new Web3("https://polygon-mainnet.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				token = new web3.eth.Contract(masterABI, "0xE3322702BEdaaEd36CdDAb233360B939775ae5f1")
				oracle = new web3.eth.Contract(oracleABI, '0x8f55D884CAD66B79e1a131f6bCB0e66f4fD84d5B');
				governance = new web3.eth.Contract(governanceABI, '0x7B74cc7d66f4b286A78d5F02a55E36E89c3fa9F0');
				autopay = new web3.eth.Contract(autopayABI, '0xD789488E5ee48Ef8b0719843672Bc04c213b648c')
				break;

			case "polygon-mumbai":
				web3 = new Web3("https://polygon-mumbai.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				token = new web3.eth.Contract(masterABI, '0xce4e32fe9d894f8185271aa990d2db425df3e6be');
				oracle = new web3.eth.Contract(oracleABI, '0x8f55D884CAD66B79e1a131f6bCB0e66f4fD84d5B')
				governance = new web3.eth.Contract(governanceABI, '0x7B74cc7d66f4b286A78d5F02a55E36E89c3fa9F0');
				autopay = new web3.eth.Contract(autopayABI, '0x1775704809521D4D7ee65B6aFb93816af73476ec');
				break;

            case "arbitrum-mainnet":
				web3 = new Web3("https://arbitrum.infura.io/v3/" + process.env.infura_key || Web3.givenProvider);
				token = new web3.eth.Contract(masterABI, '0xd58D345Fd9c82262E087d2D0607624B410D88242');
				oracle = new web3.eth.Contract(oracleABI, '0x73B6715D9289bdfE5e758bB7ace782Cc7C933cfC')
				governance = new web3.eth.Contract(governanceABI, '0x8b201738c34f0459A4B09976bd905D5cc70FA333');
				autopay = new web3.eth.Contract(autopayABI, '0xd844b26dfafb0776e70af12c19189b740329a266');
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
		let _disputeCount, _totalStaked, _numberOfStakes, _stakeAmount
		useNetwork(req.params.netName, res)
		console.log('getting all variable information...')
		//read data from Tellor's contract

		var _stakerCount = await oracle.methods.getTotalStakers().call();
		_disputeCount = await governance.methods.getVoteCount().call();
		_totalStaked = await token.methods.balanceOf(oracle._address).call()
		_stakeAmount = await oracle.methods.stakeAmount().call()
		_numberOfStakes = _totalStaked / await oracle.methods.stakeAmount().call()
		var _timeOfLastValue = await oracle.methods.getTimeOfLastNewValue().call();

		res.send({
			stakeAmount: _stakeAmount / Number(1E18),
			numberOfStakes: _numberOfStakes,
			totalStaked: _totalStaked / Number(1E18),
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
			totalStaked: _totalStaked,
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
		let r, val, timestamp
		try {
			r = await oracle.methods.getDataBefore(queryID, Date.now() - 50).call()
		} catch {
			r = 0
		}
		var results = [];
		try {
				timestamp = Number(r._timestampRetrieved)
				val = web3.utils.hexToNumberString(r._value) / scale;

			} catch {
				console.log("here")
				timestamp = 0
				val = NaN
			}
				results.push({
					timestamp: timestamp,
					value: val,
		})
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
		var r = await autopay.methods.getPastTipCount(queryID).call()
        var results = [];
        results.push({
        tipCount: r.toString()})
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
		var _returned = await governance.methods.getDisputeInfo(req.params.disputeID).call();
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
		let disputeFee = await governance.methods.getDisputeFee().call();
		res.send({ disputeFee })
	} catch (e) {
		let err = e.message
		res.send({ err });
	}
})


router.get('/:netName?/StakerInfo/:address', async function (req, res) {
	try {
		useNetwork(req.params.netName, res)
		var resp = await oracle.methods.getStakerInfo(req.params.address).call();
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

router.get("/totalSupply", async function (req, res) {

	try {
		useNetwork("mainnet", res)
		var _totalSupply = await token.methods.getUintVar(web3.utils.keccak256("_TOTAL_SUPPLY")).call();
		_totalSupply = Number(_totalSupply) / Number(1E18)

		res.send(
			"" + _totalSupply
		)
	} catch (e) {
		let err = e.message
		res.send({ err });
	} 
})

router.get('/circulatingSupply', async function (req, res) {

	try {
		let circulatingSupply, multiSigBalance, safeBalance, devShare
		useNetwork("mainnet", res)
		var _totalSupply = await token.methods.getUintVar(web3.utils.keccak256("_TOTAL_SUPPLY")).call();
		_totalSupply = Number(_totalSupply) / Number(1E18)
		multiSigBalance = await token.methods.balanceOf("0x39e419ba25196794b595b2a595ea8e527ddc9856").call()
		safeBalance = await token.methods.balanceOf("0x1B8E06E7133B89ea5A799Bf2bF0221aE71959190").call()
		devShare = await token.methods.balanceOf("0xAa304E98f47D4a6a421F3B1cC12581511dD69C55").call()
		multiSigBalance = Number(multiSigBalance) / Number(1E18)
		safeBalance = Number(safeBalance) / Number(1E18)
		devShare = Number(devShare) / Number(1E18)
		circulatingSupply = _totalSupply - multiSigBalance - safeBalance - devShare
		res.send(
			"" + circulatingSupply
		)
	} catch (e) {
		let err = e.message
		res.send({ err });
	} 
})


module.exports = router;