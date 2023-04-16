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

// DB collection endpoints 
// import { dbTrails, dbForecasts } from "./services/db.js"

// environment variables
const OPEN_AI_KEY = process.env.OPEN_AI_KEY
const MONGO_TRAILS = process.env.MONGO_TRAILS

// API home. Maybe should return the readme file.
app.get("/", (req, res) => {
    res.sendStatus(200)
    .send(console.log("Welcome to Dirt Server. Please use appropriate location routing to recieve JSON data."))
    .sendFile(fs.readFileSync("README.md"))
})
 
mongoose.connect(MONGO_TRAILS).then(() => console.log("Trails database connected 👍"))

const data = JSON.parse(fs.readFileSync('./trails/trail-trails.json', 'utf-8'))

const sendJSONtoMongo = async () => {
    try {
        await Trails.create(data);
        console.log("Data transfer success ✅")
    } catch (err) {
        console.log("Error:", err)
    }
}

sendJSONtoMongo()

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/. Niiiiice.`)
})