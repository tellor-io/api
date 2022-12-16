# Tellor REST API
This repository allows you to create a local API for Tellor information. You can also use it with Tellor data without needing to run the code locally. 

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


4. Now visit these urls from your browser:
 >Strings preceded by a ":" are variables, such as:<br/>
 `.../:netName/...` - a placeholder for the network name <br/>
`.../:address/...` - a placeholder for the address

* General information:		http://localhost:5000/:netName/info
* Price information for specified queryId: http://localhost:5000/price/:queryID/
    * For example: http://localhost:5000/price/0x0000000000000000000000000000000000000000000000000000000000000001
    
* For tips: http://localhost:5000/:netName?/tips/:queryID
* For dispute fee: http://localhost:5000/netName?/getDisputeFee
* For staker info: https://localhost:5000/:netName?/StakerInfo/:address
* For total supply: https://localhost:5000/totalSupply
* For circulating supply: https://localhost:5000/circulatingSupply
* Dispute information for a specific disputeId:  http://localhost:5000/:netName/dispute/:disputeID

## To use:

To use this API in projects without needing to run locally, all endpoints are able to be accessed at all times with updated data at https://api.tellorscan.com/

For more information on queryIds, check out our [dataSpecs repository](https://github.com/tellor-io/dataSpecs). To see which queryIds are available to be used already, check out our [query catalog](https://github.com/tellor-io/dataSpecs/blob/main/catalog.md).

Here are some examples to test by copying and pasting in your web browser:
* most recent AMPL/USD price update: `https://api.tellorscan.com/price/0x0d12ad49193163bbbeff4e6db8294ced23ff8605359fd666799d4e25a3aa0e3a`

