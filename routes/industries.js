const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();

router.get('/', async function(req, res, next){
    try {
        const industriesList = await db.query(
                `SELECT industries.industry, companies.code as company
                FROM industries
                LEFT JOIN companies_industries
                ON industries.code = companies_industries.ind_code
                LEFT JOIN companies
                ON companies_industries.comp_code = companies.code`)
        let result = {}
        console.log(industriesList.rows)
        for (let line of industriesList.rows){
            if (!result[line.industry]){
                result[line.industry] = [];
                result[line.industry].push(line.company);
            }
            else {
                result[line.industry].push(line.company);
            }
        }
        return res.json(result)
    }
    catch(err){
        next(err)
    }
})

router.post('/', async function(req, res, next){
    try{
        const {comp_code, ind_code} = req.body
        const result = await db.query(
                `INSERT INTO companies_industries (comp_code, ind_code)
                 VALUES ($1, $2)`, [comp_code, ind_code])
        return res.status(201).json({"comp_code": comp_code, "ind_code" : ind_code})
    }
    catch(err){
        next(err)
    }
})

router.post('/add', async function(req, res, next){
    try{
        const {code, industry} = req.body
        const result = await db.query(`INSERT INTO industries (code, industry)
                                     VALUES ($1 , $2)
                                     RETURNING *`,
                                     [code, industry])
        return res.status(201).json({'created': result.rows})
    }
    catch(err){
        next(err)
    }
})

module.exports = router