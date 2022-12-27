# Tellor API / api.tellorscan.com
This API allows you to query Tellor for network data on Ethereum mainnet, goerli, polygon, polygon-mumbai, chiado, and arbitrum. The API is hosted at https://api.tellorscan.io

### To use:

To use this API in projects without needing to run locally, all endpoints are able to be accessed at all times with updated data at https://api.tellorscan.com/

For more information on queryIds, check out our [dataSpecs repository](https://github.com/tellor-io/dataSpecs). To see which queryIds are available to be used already, check out our [query catalog](https://github.com/tellor-io/dataSpecs/blob/main/types).

Here are some ways to query the API from your browser:
 >Note: Strings preceded by a ":" are variables, such as:<br/>
 `.../:netName/...` - a placeholder for the network name (a string: mainnet, goerli, polygon, polygon-mumbai, arbitrum, chiado) <br/>
`.../:address/...` - a placeholder for the address (a hash) <br/>
`.../:disputeID/...` - a placeholder for the disputeID (an integer)
`.../:queryId/...` - a placeholder for the queryId (a hash)

* General information:		https://api.tellorscan.com/:netName/info
* Price information for specified queryId: https://api.tellorscan.com/:netName/price/:queryID/
    * For example: https://api.tellorscan.com/price/0x83a7f3d48786ac2667503a61e8c415438ed2922eb86a2906e4ee66d9a2ce4992
    
* For tips: https://api.tellorscan.com/:netName?/tips/:queryID
* For dispute fee: https://api.tellorscan.com/:netName/getDisputeFee
* For staker info: https://api.tellorscan.com/:netName/StakerInfo/:address
* For total supply: https://api.tellorscan.com/totalSupply
* For circulating supply: https://api.tellorscan.com/circulatingSupply
* Dispute information for a specific disputeId:  https://api.tellorscan.com/:netName/dispute/:disputeID

### To test:

Requirements: Node.js version 14.x

1. Clone the repository
2. Create a .env file based on the example (update the nodeURL)
3. Run:

```node
npm install
node index
```
or with nodemon for reload on file changes.
```
nodemon index.js
```


