import mongoose from "mongoose";
const { Schema } = mongoose

const TrailsSchema = new Schema = ({
    trailName: String,
    description: String,
    difficulty: Number,
    composition: [{type: String}],
    weatherReactivity: String,
    traffic: String,
    elevation: Number,
    aspect: String,
    trailType: String,
    treeCoverage: String
})

export default Trails = mongoose.model('Trails', TrailsSchema)