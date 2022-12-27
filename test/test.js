const { assert } = require("chai");
const chai = require("chai")
const chaiHttp = require("chai-http")

const expect = chai.expect;
const server = require("../index.js") 


chai.should()
chai.use(chaiHttp)

describe("API tests", async function () {

    let networks = ["mainnet", "goerli", "polygon", "polygon-mumbai", "arbitrum", "chiado"]

    it("info page", async function () {

        for (i = 0; i < networks.length; i++) {
            
            let req = await chai.request(server).get("/" + networks[i] + "/info").send()

            expect(req.text).contains("stakeAmount")
            expect(req.text).contains("numberOfStakes")
            expect(req.text).contains("totalStaked")
            expect(req.text).contains("stakerCount")
            expect(req.text).contains("disputeCount")
            expect(req.text).contains("timeOfLastNewValue")

        }
    })

    it("prices", async function () {

        let query_id = "0x83a7f3d48786ac2667503a61e8c415438ed2922eb86a2906e4ee66d9a2ce4992"

        for (i = 0; i < networks.length; i++) {

            let req = await chai.request(server).get("/" + networks[i] + "/price/" + query_id).send()

            expect(req.text).contains("timestamp")
            expect(req.text).contains("value")
        }

    })

    it("disputes", async function () {

        let disputeId = 1
        let fakeDisputeId = 10000

        for (i = 0; i < networks.length; i++) {

            let req = await chai.request(server).get("/" + networks[i] + "/dispute/" + disputeId).send()

            expect(req.text).contains("queryId")
            expect(req.text).contains("timestamp")
            expect(req.text).contains("value")
            expect(req.text).contains("disputedReporter")

        }

        for (i = 0; i < networks.length; i++) {

            let req = await chai.request(server).get("/" + networks[i] + "/dispute/" + fakeDisputeId).send()

            expect(req.text).contains("queryId")
            expect(req.text).contains("timestamp")
            expect(req.text).contains("value")
            expect(req.text).contains("disputedReporter")

        }
    })

    it("dispute fee", async function () {


        for (i = 0; i < networks.length; i++) {

            let req = await chai.request(server).get("/" + networks[i] + "/getDisputeFee").send()

            expect(req.text).contains("disputeFee")

        }
    })

    it("staker info", async function () {

        for (i = 0; i < networks.length; i++) {

            let staker_address = "0xa7654E313FbB25b2cF367730CB5c2759fAf831a1"

            let req = await chai.request(server).get("/" + networks[i] + "/StakerInfo/" + staker_address).send()

            expect(req.text).contains("stakeDate")
            expect(req.text).contains("stakedBalance")
            expect(req.text).contains("lockedBalance")
            expect(req.text).contains("reporterLastTimestamp")
            expect(req.text).contains("reportsSubmitted")


        }

    })

    it("tips", async function () {

        for (i = 0; i < networks.length; i++) {

            let query_id = "0x83a7f3d48786ac2667503a61e8c415438ed2922eb86a2906e4ee66d9a2ce4992"

            let req = await chai.request(server).get("/" + networks[i] + "/tips/" + query_id).send()

            expect(req.text).contains("tipCount")
        }

    })
})