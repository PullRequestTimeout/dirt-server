import cron from "node-cron";
import fetch from "node-fetch";
import Trails from "../models/Trails.js";
import weatherDataCall from "./weather.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_TRAILS = process.env.MONGO_TRAILS
const MONGO_FORECASTS = process.env.MONGO_FORECASTS
const OPEN_AI_KEY = process.env.OPEN_AI_KEY

// Just for testing, remove after
import mongoose from "mongoose";

// Cron job every day at 3am contains...
// (cron job can be wrapped around function last)
    // Fetch recent weather data and massage it into a useful object for OpenAI api to consume. ✅

    // Fetch the three trail collections and store each of them in a variable, which will be JSON array, make an array of the three arrays
    // Iterate through each object in each array and do...
        // Another fetch request, which calls the OpenAI model with data points; 
            // trail object 
            // recent weather data for the relevent location
            // instruction for the model

            // And then makes a new DB entry for each of the returned forecasts with 'trailName', 'starRating', and 'description'


// Pieces of the puzzle:

// This will run the task at 3am every day
// cron.schedule('0 3 * * *', () => {
//     // your task code here
// });


async function retrieveWeather() {
    const weather = { trail: [] , rossland: [] , castlegar: [] }

    for (const key in weather) {
        await weatherDataCall(key)
        .then(data => formatWeatherData(data))
        .then(data => weather[key] = data)
    }
    console.log(weather);
    return weather;
}


function formatWeatherData(data) {
    const result = [];
    const daysCount = data.daily.time.length;
  
    for (let i = 0; i < daysCount; i++) {
      result.push({
        date: data.daily.time[i],
        max_temperature: data.daily.temperature_2m_max[i],
        min_temperature: data.daily.temperature_2m_min[i],
        total_rainfail: data.daily.rain_sum[i],
        total_snowfall: data.daily.snowfall_sum[i]
      });
    }
  
    return result;
}

// Fetch the three trail collections and store each of them in a variable, which will be JSON array, make an array of the three arrays
// This wont work unless connected to the mongodb, make sure IP is whitelisted in mongo 'Network Access' tab

mongoose.connect(MONGO_TRAILS).then(() => console.log("Trails database connected 👍"))

async function getTrailArrays() {
    const rosslandTrails = await Trails.RosslandDB.find();
    const trailTrails = await Trails.TrailDB.find();
    const castlegarTrails = await Trails.CastlegarDB.find();
    
    const trailArrays = [rosslandTrails, trailTrails, castlegarTrails];

    // This loop is the end goal, needs to iterate through each item and send it to gpt with the params
    trailArrays.forEach(array => {
        array.forEach(item =>{
            console.log("item:", item)
        })
    })
}