const chai = require("chai")
const chaiHttp = require("chai-http")

const {expect} = chai;
const api = require("../routes/api.js") 


chai.should()
chai.use(chaiHttp)

describe("API tests", async function () {

    it("mainnet info displays", async function () {
        let req = await chai.request(api).get("/mainnet/info")
        console.log(req)
    })
})