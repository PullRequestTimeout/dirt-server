const express = require("express");
const app = express();
const PORT = 6969

const fs = require("fs")
const cors = require("cors")
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config()

// Trails Model
const Trails = require("./models/Trails")

// console.log(Trails)

// DB collection endpoints 
// import { dbTrails, dbForecasts } from "./services/db.js"

// environment variables
const OPEN_AI_KEY = process.env.OPEN_AI_KEY
const MONGO_TRAILS = process.env.MONGO_TRAILS

// API home. Maybe should return the readme file.
app.get("/", (req, res) => {
    res.sendStatus(200).send(console.log("Welcome to Dirt Server. Please use appropriate location routing to recieve JSON data."))
    // .sendFile(fs.readFileSync("README.md"))
})
 

app.get("/update", (req, res) => {
    // req.query.location

    let json;
    let collection;
    // console.log(collection)

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

    // console.log(collection)
    
    
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

mongoose.connect(MONGO_TRAILS).then(() => console.log("Trails database connected 👍"))


// const json = JSON.parse(fs.readFileSync(`./trails/rossland-trails.json`, 'utf-8'))

// const sendJSONtoMongo = async () => {
//     try {
//         await Trails.RosslandDB.create(json);
//         console.log("Data transfer success ✅")
//     } catch (err) {
//         console.log("Error:", err)
//     }
// }

// sendJSONtoMongo()

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/. Niiiiice.`)
})