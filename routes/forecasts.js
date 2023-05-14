import express from "express"
const router = express.Router()
import mongoose from "mongoose"
import Forecasts from "../models/Forecasts.js"
import dotenv from "dotenv"
dotenv.config()

// Forecasts database
const MONGO_FORECASTS = process.env.MONGO_FORECASTS

router.get("/:location", async (req, res) => {
    await mongoose.connect(MONGO_FORECASTS)
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
            return Forecasts.RosslandForecastsDB
        case "trail":
            return Forecasts.TrailForecastsDB
        case "castlegar":
            return Forecasts.CastlegarForecastsDB
    }
}

export default router
