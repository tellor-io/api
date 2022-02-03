# Tellor REST API
This repository allows you to create a local API for Tellor information. You can also use it with Tellor data without needing to run the code locally. 

### To test:

Requirements: Node.js version 9.2.0

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

To update the contracts ABI
```bash
make generate
```

4. Now visit these urls from your browser:
 >Each end point also accepts the network name as an optional parameter:<br/>
 When not provided it defaults to `mainnet`.<br/>
 `.../rinkeby/info` - connects to rinkeby <br/>
`.../info` connects to `mainnet`

* General information:		http://localhost:5000/:netName/info
* Dispute Fees:		http://localhost:5000/:netName/getDisputeFee
* Price information for specified queryId: http://localhost:5000/price/:queryID/:count
    * For example: http://localhost:5000/price/0x0000000000000000000000000000000000000000000000000000000000000001/10
    * Count is optional and defines how many historical values to return. When omitted it returns the most recent value.

* For multiple queryIds: http://localhost:5000/prices/:queryIds/:count
  * enter all queryIds as a list delimited by a hyphen (`-`) into the queryIds field
* Dispute information for a specific disputeId:  http://localhost:5000/dispute/:disputeID

## To use:

To use this API in projects without needing to run locally, all endpoints are able to be accessed at all times with updated data at https://api.tellorscan.com/

For more information on queryIds, check out our [dataSpecs repository](https://github.com/tellor-io/dataSpecs). To see which queryIds are available to be used already, check out our [query catalog](https://github.com/tellor-io/dataSpecs/blob/main/catalog.md).

Here are some examples to test by copying and pasting in your web browser:
* most recent 10 AMPL/USD price updates: `https://api.tellorscan.com/price/0x000000000000000000000000000000000000000000000000000000000000000a/10`
* most recent 10 ETH/USD and AMPL/USD price updates: `https://api.tellorscan.com/prices/0x0000000000000000000000000000000000000000000000000000000000000001-0x000000000000000000000000000000000000000000000000000000000000000a/10`

