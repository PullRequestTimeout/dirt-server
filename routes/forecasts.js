import express from "express"
const router = express.Router()
import mongoose from "mongoose"
import Forecasts from "../models/Forecasts.js"
import dotenv from "dotenv"
dotenv.config()

// env variable
const MONGO_FORECASTS = process.env.MONGO_FORECASTS

router.get("/rossland", async (req, res) => {
    await mongoose.connect(MONGO_FORECASTS)
    try {
        const rosslandForecasts = await Forecasts.RosslandForecastsDB.find()
        res.json(rosslandForecasts)
    } catch (error) {
        res.json({ message: error })
    }
    await mongoose.disconnect()
})

router.get("/trail", async (req, res) => {
    await mongoose.connect(MONGO_FORECASTS)
    try {
        const trailForecasts = await Forecasts.TrailForecastsDB.find()
        res.json(trailForecasts)
    } catch (error) {
        res.json({ message: error })
    }
    await mongoose.disconnect()
})

router.get("/castlegar", async (req, res) => {
    await mongoose.connect(MONGO_FORECASTS)
    try {
        const castlegarForecasts = await Forecasts.CastlegarForecastsDB.find()
        res.json(castlegarForecasts)
    } catch (error) {
        res.json({ message: error })
    }
    await mongoose.disconnect()
})

export default router
