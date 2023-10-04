var Web3 = require('web3')
var fs = require('fs')
require("dotenv").config()

var res = new Web3("https://mainnet.infura.io/v3/" + process.env.infura_key )

async function getcircsupply () {

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
		Math.round(circulatingSupply) = _totalSupply - multiSigBalance - safeBalance - devShare
		console.log("print circ supply",circulatingSupply)

	} catch (e) {
		let err = e.message
		
	} 
}



getcircsupply ()
.then(() => process.exit(0))
.catch(error => {
	console.error(error);
	process.exit(1);
});