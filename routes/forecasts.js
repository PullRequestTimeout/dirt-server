import express from "express";
const router = express.Router();
import weatherDataCall from "../services/weather.js";

router.get("/", async (req, res) => {
    const location = req.query.location
    if (!location) {
        return res.status(400).json({ error: "Location parameter is missing" })
    }
    try {
        const weatherData = await weatherDataCall(location)
        return res.json(weatherData)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Internal server error" })
    }
})

export default router;