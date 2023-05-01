// Dependencies
import cron from "node-cron";
import Trails from "../models/Trails.js";
import Forecasts from "../models/Forecasts.js";
import weatherDataCall from "./weather.js";
import dotenv from "dotenv";
dotenv.config();
import { Configuration, OpenAIApi } from "openai";

// Environment variables
const MONGO_TRAILS = process.env.MONGO_TRAILS
const MONGO_FORECASTS = process.env.MONGO_FORECASTS
const OPEN_AI_KEY = process.env.OPEN_AI_KEY

// Just for testing, can probably remove after
import mongoose from "mongoose";

// OpenAI 
const configuration = new Configuration({
    apiKey: OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

// Cron job every day at 3am contains...
// (cron job can be wrapped around function last)
    // Fetch recent weather data and massage it into a useful object for OpenAI api to consume. ✅

    // Fetch the three trail collections and store each of them in a variable, which will be JSON array, make an array of the three arrays✅
    // Iterate through each object in each array and do...
        // Another fetch request, which calls the OpenAI model with data points; 
            // trail object 
            // recent weather data for the relevent location
            // instruction for the model

            // And then makes a new DB entry with the 'Forecasts' model for each of the returned forecasts with 'trailName', 'starRating', and 'description'


// This will run the task at 3am every day
// cron.schedule('0 3 * * *', () => {
//     // your task code here
// });

async function callAI(trailForcastPrompt) {
    try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `${trailForcastPrompt}}`, 
          max_tokens: 100,
          temperature: 0,
        });
        console.log(JSON.parse(completion.data.choices[0].text));
    } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
    }
};

async function retrieveWeather() {
    const weather = { trail: [], rossland: [], castlegar: [] }

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
        max_temperature: Math.trunc(data.daily.temperature_2m_max[i]),
        min_temperature: Math.trunc(data.daily.temperature_2m_min[i]),
        total_rainfail: Math.trunc(data.daily.rain_sum[i]),
        total_snowfall: Math.trunc(data.daily.snowfall_sum[i])
      });
    }
  
    return result;
}

// Fetch the three trail collections and store each of them in a variable, which will be JSON array, make an array of the three arrays
// This wont work unless connected to the mongodb, make sure IP is whitelisted in mongo 'Network Access' tab

// mongoose.connect(MONGO_TRAILS).then(() => console.log("Trails database connected 👍"))

async function getTrailArrays() {
    const rosslandTrails = await Trails.RosslandDB.find();
    const trailTrails = await Trails.TrailDB.find();
    const castlegarTrails = await Trails.CastlegarDB.find();
    
    const trailArrays = [rosslandTrails, trailTrails, castlegarTrails];

    // This loop is the end goal, needs to iterate through each item and send it to gpt with the params
    trailArrays.forEach(array => {
        array.forEach((item, i) =>{
            console.log(`${item.trailName}:`, i)
        })
    })
}

// const aiPrompt = `The following list of JSON objects contains today's, and the previous 5 days worth of weather data for a mountainbiking destination:
// ${}

// The following object is a representation of a mountainbike trail at the destination, with relevant information and factors that contribute to expected conditions of the trail, as well as a description of the trail. The number in the difficulty field corresponds to the difficulty rating of the trail, 1 being green, 4 being double black:
// ${}

// Given this information, give a star rating as a single digit from 1 to 5 about today's expected conditions of the trail, 1 being unrideable and 5 being very good, and a descriptive forecast of the expected conditions of the trail today. 
// Keep in mind that trails at 0-1000m elevation are typically snow covered from mid-October until late-April. Trails at 1500-2000m usually don't open till June at least, and close in early October. If there is snow on the trail they shouldn't receive a star rating greater than 2.
// Limit your answer to only output the answer formatted in JSON in the following format, and limit the descriptiveForecast to less than 100 words, prioritising accuracy:
// {
//     "trailName": "",
//     "starRating": "",
//     "descriptiveForcast": ""
// }`

// await getTrailArrays()
// mongoose.disconnect()

callAI("Only reply in JSON format: How are you today?")
