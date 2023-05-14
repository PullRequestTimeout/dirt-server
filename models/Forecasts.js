import mongoose from "mongoose"
const Schema = mongoose.Schema

const ForecastsSchema = new Schema(
    {
        trailName: {
            type: String,
            required: true,
        },
        starRating: {
            type: Number,
            required: true,
        },
        descriptiveForecast: {
            type: String,
            required: true,
        },
    },
    { collection: "forecast" }
)

const TrailForecastsDB = mongoose.model("TrailForecastsDB", ForecastsSchema, "trail")
const RosslandForecastsDB = mongoose.model("RosslandForecastsDB", ForecastsSchema, "rossland")
const CastlegarForecastsDB = mongoose.model("CastlegarForecastsDB", ForecastsSchema, "castlegar")

export default { TrailForecastsDB, RosslandForecastsDB, CastlegarForecastsDB }
