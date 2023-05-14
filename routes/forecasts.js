import express from "express"
const router = express.Router()
import Forecasts from "../models/Forecasts.js"

router.get("/rossland", async (req, res) => {
    try {
        const rosslandForecasts = await Forecasts.RosslandForecastsDB.find()
        res.json(rosslandForecasts)
    } catch (error) {
        res.json({ message: error })
    }
})

router.get("/trail", async (req, res) => {
    try {
        const trailForecasts = await Forecasts.TrailForecastsDB.find()
        res.json(trailForecasts)
    } catch (error) {
        res.json({ message: error })
    }
})

router.get("/castlegar", async (req, res) => {
    try {
        const castlegarForecasts = await Forecasts.CastlegarForecastsDB.find()
        res.json(castlegarForecasts)
    } catch (error) {
        res.json({ message: error })
    }
})

export default router
