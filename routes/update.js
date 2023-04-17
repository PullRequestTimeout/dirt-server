const express = require("express");
const router = express.Router()
const fs = require("fs")

// Trails Model
const Trails = require("../models/Trails")

router.get("/", (req, res) => {
    let json;
    let collection;

    if (!req.query.location) {
        console.log("You must include a location parameter to update db.")
    } else {
        json = JSON.parse(fs.readFileSync(`./trails/${req.query.location}-trails.json`, 'utf-8'))
    }

    switch (req.query.location) {
        case "rossland":
            collection = Trails.RosslandDB;
            break;
        case "trail":
            collection = Trails.TrailDB;
            break;
        case "castlegar":
            collection = Trails.CastlegarDB
            break;
        default:
            console.log("Your switch fucked up.")
    }
    
    const sendJSONtoMongo = async () => {
        try {
            await collection.create(json);
            console.log("Data transfer success ✅")
            res.redirect("/")
        } catch (err) {
            console.log("Error:", err)
        }
    }

    sendJSONtoMongo()
})

module.exports = router;