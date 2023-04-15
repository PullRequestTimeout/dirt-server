const express = require("express")
const app = express()
const PORT = 6969
require("dotenv").config()

// environment variables
const OPEN_AI_KEY = process.env.OPEN_AI_KEY
const MONGO_CONNECT = process.env.MONGO_CONNECT

// local trail data, still needs to be completed and pushed to DB
// const rosslandTrails = require("./trails/rossland-trails.json")
// const trailTrails = require("./trails/trail-trails.json")
// const castlegarTrails = require("./trails/castlegar-trails.json")

app.get("/", (req, res) => {
    res.sendStatus(200).send(console.log("Welcome to Dirt Server. Please use appropriate location routing to recieve JSON data."))
})



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/, nice.`)
})