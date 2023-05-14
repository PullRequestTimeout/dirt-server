import express from "express"
const router = express.Router()
import Trails from "../models/Trails.js"

router.get("/rossland", async (req, res) => {
    try {
        const rosslandTrails = await Trails.RosslandDB.find()
        res.json(rosslandTrails)
    } catch (error) {
        res.json({ message: error })
    }
})

router.get("/trail", async (req, res) => {
    try {
        const trailTrails = await Trails.TrailDB.find()
        res.json(trailTrails)
    } catch (error) {
        res.json({ message: error })
    }
})

router.get("/castlegar", async (req, res) => {
    try {
        const castlegarTrails = await Trails.CastlegarDB.find()
        res.json(castlegarTrails)
    } catch (error) {
        res.json({ message: error })
    }
})

export default router
