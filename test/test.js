const { assert } = require("chai");
const chai = require("chai")
const chaiHttp = require("chai-http")

const {expect} = chai;
const router = require("../routes/api.js") 


chai.should()
chai.use(chaiHttp)

describe("API tests", async function () {

    it("mainnet info displays", async function () {
        let req = await chai.request(router).get("/mainnet/info").send()
        console.log("here")

        expect(req.status).to.equal(200)

    })
})