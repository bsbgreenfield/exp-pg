process.env.NODE_ENV = "test"

const app = require("../app")
const db = require("../db")
const request = require("supertest")
let testCompany;
let testInvoice;
beforeEach(async function(){
    let resultCompany = await db.query(
                         `INSERT INTO companies (code, name, description)
                          VALUES ('TCB', 'TestCorp', 'Its a test company')
                          RETURNING *`)
    let resultInvoice = await db.query(
                        `INSERT INTO invoices (comp_code, amt) 
                         VALUES ('TCB', 999)
                         RETURNING *`)
    testCompany = resultCompany.rows
    testInvoice = resultInvoice.rows
    
})

afterEach(async () => {
    await db.query("DELETE FROM invoices")
    await db.query("DELETE FROM companies")
})

afterAll(async () => {
    await db.end()
})

describe("GET /companies", function(){
    test("Gets list of all companies", async function(){
        const response = await request(app).get('/companies')
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual(
            {"companies": testCompany})
    })
})

describe("GET /invoices", function(){
    test("Gets list of all invoices", async function(){
        const response = await request(app).get('/invoices')
        expect(response.statusCode).toEqual(200)
        expect(response.body.invoices[0].amt).toEqual(999)
        expect(response.body.invoices[0].comp_code).toEqual('TCB')
    })
})

describe("GET /companies/:code", function(){
    test("Gets list of all companies", async function(){
        const response = await request(app).get('/companies/TCB')
        expect(response.statusCode).toEqual(200)
        expect(response.body.company.code).toEqual('TCB')
        expect(response.body.company.name).toEqual('TestCorp')
        expect(response.body.company.description).toEqual('Its a test company')
        expect(response.body.company.invoices[0].comp_code).toEqual('TCB')
        expect(response.body.company.invoices[0].amt).toEqual(999)
    })
})

describe("POST /companies", function(){
    test("adds a company", async function(){
        const response = (await request(app).post('/companies').send(
            {name: 'Zcorp', description: "New Company"}
        ))
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual(
            {"company": {"code": "zcorp", "name": "Zcorp", "description": "New Company"}})
    })
})

describe("POST /invoices", function(){
    test("adds an invoice", async function(){
        const response = (await request(app).post('/invoices').send(
            {comp_code: "TCB", amt: 100}
        ))
        expect(response.statusCode).toEqual(201);
        expect(response.body.invoice.comp_code).toEqual('TCB')
        expect(response.body.invoice.amt).toEqual(100)
    })
})

describe("PUT /companies/:code", function(){
    test("Changes company details", async function(){
        const response = await request(app).put('/companies/TCB').send(
            {name: "NewName", description: "New Description"}
        )
        expect(response.statusCode).toEqual(200);
        expect(response.body.company.code).toEqual("TCB")
        expect(response.body.company.name).toEqual('NewName')
        expect(response.body.company.description).toEqual("New Description")
    })
})

describe("PUT /invoices/:id", function(){
    test("Changes invoice details", async function(){
        const response = await request(app).put(`/invoices/${testInvoice[0].id}`).send(
            {amt: 100}
        )
        expect(response.statusCode).toEqual(200);
        expect(response.body.invoice.comp_code).toEqual("TCB")
        expect(response.body.invoice.amt).toEqual(100)

    })
})

describe("delete /companies/:code", function(){
    test("deletes comoany", async function(){
        const response = await request(app).delete('/companies/TCB')
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({"status": "deleted"});
    })
})

describe("delete /invoices/:id", function(){
    test("deletes invoice", async function(){
        const response = await request(app).delete(`/invoices/${testInvoice[0].id}`)
        expect(response.statusCode).toEqual(200);
        let invoicesLeft = await db.query("SELECT * FROM INVOICES")
        expect(invoicesLeft.rows.length).toEqual(0)
        expect(response.body).toEqual({"status": "deleted"});
        
    })
})

