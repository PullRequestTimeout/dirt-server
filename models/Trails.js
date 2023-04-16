// import mongoose from "mongoose";
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const TrailsSchema = new Schema ({
    trailName: {
        type: String,
        required: true
    },
    description: String,
    difficulty: {
        type: Number,
        required: true
    },
    composition: [{
        type: String,
        required: true
    }],
    weatherReactivity: {
        type: String,
        required: true
    },
    traffic: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    aspect: {
        type: String,
        required: true
    },
    trailType: {
        type: String,
        required: true
    },
    treeCoverage: {
        type: String,
        required: true
    }
}, {collection: "trail"});

module.exports = mongoose.model('Trails', TrailsSchema);
