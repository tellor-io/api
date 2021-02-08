# Tellor REST API
This repository allows you to create a local API for Tellor information. 

## To test:

Requirements: Node.js version 9.2.0

1. Clone the repository
2. Create a .env file based on the example (update the nodeURLRinkeby)
3. Run:

```node
	npm install
	node index
```

To update the contracts ABI
```bash
    go run scripts/generate.go
```

4. Now visit these urls from your browser:
 >Each end point also accepts the network name as an optional parameter:<br/>
 When not provided it defaults to `mainnet`.<br/>
 `.../rinkeby/info` - connects to rinkeby <br/>
`.../info` connects to `mainnet`

* To get general information:		http://localhost:5000/info
* To get information about the request queue: http://localhost:5000/requestq
* To get information about a requestId (api, granularity, etc..): http://localhost:5000/requestinfo/requestID
    * For example: http://localhost:5000/requestinfo/1
* To get price inforamtion for specified requestId: http://localhost:5000/price/requestID/count
    * For example: http://localhost:5000/price/1/10<br/>
    Count is optional and defines how many historical values to return. When omitted it returns the most recent value.
* To get dispute inforamtion for a specific disputeId:  http://localhost:5000/dispute/:disputeID

## Custom API 
Use the following hashes to read data from Tellor's contract.

### Common Hashes:
| Function        | value              | keccak-256                                                         |
|-----------------|--------------------|--------------------------------------------------------------------|
| addressVars     | tellorContract     | 0xd48fd09afdab521f4f69bd2af8177f60fb0709ce0f1b3d5b8a2e233a20453848 |
| addressVars     | _owner             | 0x9dbc393ddc18fd27b1d9b1b129059925688d2f2d5818a5ec3ebb750b7c286ea6 |
| addressVars     | _deity             | 0xc72fb71df90ec89e61e8dea6fee5142880a8a329caaae9ff4931955d88f59990 |
| apiUintVars     | granularity        | 0xba3571a50e0c436953d31396edfb65be5925bcc7fef5a3441ed5d43dbce2548f |
| apiUintVars     | requestQPosition   | 0x1e344bd070f05f1c5b3f0b1266f4f20d837a0a8190a3a2da8b0375eac2ba86ea |
| apiUintVars     | totalTip           | 0x2a9e355a92978430eca9c1aa3a9ba590094bac282594bccf82de16b83046e2c3 |
| disputeUintVars | requestId          | 0x31b40192effc42bcf1e4289fe674c678e673a3052992548fef566d8c33a21b91 |
| disputeUintVars | timestamp          | 0xd056b4f4e783ee91bebc956e3ffe3c71aec2992408313c1db5ee11c1b4fa7c41 |
| disputeUintVars | value              | 0x81afeeaff0ed5cee7d05a21078399c2f56226b0cd5657062500cef4c4e736f85 |
| disputeUintVars | minExecutionDate   | 0x74c9bc34b0b2333f1b565fbee67d940cf7d78b5a980c5f23da43f6729965ed40 |
| disputeUintVars | numberOfVotes      | 0xa0bc13ce85a2091e950a370bced0825e58ab3a3ffeb709ed50d5562cbd82faab |
| disputeUintVars | blockNumber        | 0x6f8f54d1af9b6cb8a219d88672c797f9f3ee97ce5d9369aa897fd0deb5e2dffa |
| disputeUintVars | minerSlot          | 0x8ef61a1efbc527d6428ff88c95fdff5c6e644b979bfe67e03cbf88c8162c5fac |
| disputeUintVars | quorum             | 0x30e85ae205656781c1a951cba9f9f53f884833c049d377a2a7046eb5e6d14b26 |
| disputeUintVars | fee                | 0x833b9f6abf0b529613680afe2a00fa663cc95cbdc47d726d85a044462eabbf02 |
| uintVars        | decimals           | 0x784c4fb1ab068f6039d5780c68dd0fa2f8742cceb3426d19667778ca7f3518a9 |
| uintVars        | disputeFee         | 0x8b75eb45d88e80f0e4ec77d23936268694c0e7ac2e0c9085c5c6bdfcfbc49239 |
| uintVars        | disputeCount       | 0x475da5340e76792184fb177cb85d21980c2530616313aef501564d484eb5ca1e |
| uintVars        | total_supply       | 0xb1557182e4359a1f0c6301278e8f5b35a776ab58d39892581e357578fb287836 |
| uintVars        | stakeAmount        | 0x7be108969d31a3f0b261465c71f2b0ba9301cd914d55d9091c3b36a49d4d41b2 |
| uintVars        | stakerCount        | 0xedddb9344bfe0dadc78c558b8ffca446679cbffc17be64eb83973fce7bea5f34 |
| uintVars        | timeOfLastNewValue | 0x97e6eb29f6a85471f7cc9b57f9e4c3deaf398cfc9798673160d7798baf0b13a4 |
| uintVars        | difficulty         | 0xb12aff7664b16cb99339be399b863feecd64d14817be7e1f042f97e3f358e64e |
| uintVars        | currentTotalTips   | 0xd26d9834adf5a73309c4974bf654850bb699df8505e70d4cfde365c417b19dfc |
| uintVars        | currentRequestId   | 0x7584d7d8701714da9c117f5bf30af73b0b88aca5338a84a21eb28de2fe0d93b8 |
| uintVars        | requestCount       | 0x05de9147d05477c0a5dc675aeea733157f5092f82add148cf39d579cafe3dc98 |
| uintVars        | slotProgress       | 0x6c505cb2db6644f57b42d87bd9407b0f66788b07d0617a2bc1356a0e69e66f9a |
| uintVars        | miningReward       | 0x9f355ccb80c88ef4eea7a6d390e83e1044d5676886223220e9522329f054ef16 |
| uintVars        | timeTarget         | 0xad16221efc80aaf1b7e69bd3ecb61ba5ffa539adf129c3b4ffff769c9b5bbc33 |