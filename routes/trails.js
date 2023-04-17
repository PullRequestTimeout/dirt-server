const express = require("express");
const router = express.Router()
const Trails = require("../models/Trails")

router.get("/rossland", async (req, res) => {
    try {
        const rosslandTrails = await Trails.RosslandDB.find()
        res.json(rosslandTrails)
    } catch (err) {
        res.json({message: err})
    }
})

router.get("/trail", async (req, res) => {
    try {
        const trailTrails = await Trails.TrailDB.find()
        res.json(trailTrails)
    } catch (err) {
        res.json({message: err})
    }
})

router.get("/castlegar", async (req, res) => {
    try {
        const castlegarTrails = await Trails.CastlegarDB.find()
        res.json(castlegarTrails)
    } catch (err) {
        res.json({message: err})
    }
})

module.exports = router;