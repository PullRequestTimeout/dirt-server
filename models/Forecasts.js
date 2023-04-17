const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const ForecastsSchema = new Schema ({
    starRating: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {collection: "forecast"});

const TrailDB = mongoose.model("TrailDB", ForecastsSchema, "trail");
const RosslandDB = mongoose.model("RosslandDB", ForecastsSchema, "rossland");
const CastlegarDB = mongoose.model("CastlegarDB", ForecastsSchema, "castlegar");

module.exports = { TrailDB, RosslandDB, CastlegarDB }
