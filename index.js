const express = require("express")
const app = express()
const PORT = 6969
require("dotenv").config()

// .env variable
const OPEN_AI_KEY = process.env.OPEN_AI_KEY

// trail data
const rosslandTrails = require("./trails/rossland-trails.json")
const trailTrails = require("./trails/trail-trails.json")
// const castlegarTrails = require("./trails/castlegar-trails.json")



app.get("/", (req, res) => {
    res.sendStatus(200).send(console.log("Welcome to Dirt Server. Please use appropriate location routing to recieve JSON data."))
})

app.get("/rossland", (req, res) => {
    res
    .sendStatus(200)
    .sendFile(rosslandTrails)
})

app.get("/trail", (req, res) => {
    console.log("trail")
})

app.get("/castlegar", (req, res) => {
    console.log("castlegar")
})





app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/, nice.`)
})