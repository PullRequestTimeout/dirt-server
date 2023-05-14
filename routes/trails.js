import express from "express"
const router = express.Router()
import Trails from "../models/Trails.js"
import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

// env variable
const MONGO_TRAILS = process.env.MONGO_TRAILS

router.get("/rossland", async (req, res) => {
    await mongoose.connect(MONGO_TRAILS)
    try {
        const rosslandTrails = await Trails.RosslandDB.find()
        res.json(rosslandTrails)
        await mongoose.disconnect()
    } catch (error) {
        res.json({ message: error })
    }
    await mongoose.disconnect()
})

router.get("/trail", async (req, res) => {
    await mongoose.connect(MONGO_TRAILS)
    try {
        const trailTrails = await Trails.TrailDB.find()
        res.json(trailTrails)
    } catch (error) {
        res.json({ message: error })
    }
    await mongoose.disconnect()
})

router.get("/castlegar", async (req, res) => {
    await mongoose.connect(MONGO_TRAILS)
    try {
        const castlegarTrails = await Trails.CastlegarDB.find()
        res.json(castlegarTrails)
    } catch (error) {
        res.json({ message: error })
    }
    await mongoose.disconnect()
})

export default router
