import express from "express"
const router = express.Router()
import Trails from "../models/Trails.js"
import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

// Trails database
const MONGO_TRAILS = process.env.MONGO_TRAILS

router.get("/:location", async (req, res) => {
    await mongoose.connect(MONGO_TRAILS)
    try {
        const forecasts = await locationDB(req.params.location).find()
        res.json(forecasts)
    } catch (error) {
        res.json({ message: error })
    }
    await mongoose.disconnect()
})

function locationDB(location) {
    switch (location.toLowerCase()) {
        case "rossland":
            return Trails.RosslandDB
        case "trail":
            return Trails.TrailDB
        case "castlegar":
            return Trails.CastlegarDB
    }
}

export default router
