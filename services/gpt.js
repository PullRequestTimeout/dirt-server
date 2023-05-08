// Dependencies
import cron from "node-cron"
import Trails from "../models/Trails.js"
import Forecasts from "../models/Forecasts.js"
import weatherDataCall from "./weather.js"
import dotenv from "dotenv"
dotenv.config()
import { Configuration, OpenAIApi } from "openai"

// Environment variables
const MONGO_TRAILS = process.env.MONGO_TRAILS
const MONGO_FORECASTS = process.env.MONGO_FORECASTS
const OPEN_AI_KEY = process.env.OPEN_AI_KEY

// Just for testing, can probably remove after
import mongoose from "mongoose"

// OpenAI
const configuration = new Configuration({
    apiKey: OPEN_AI_KEY,
})
const openai = new OpenAIApi(configuration)

// This will run the task at 3am every day
// cron.schedule('0 3 * * *', () => {
//     // your task code here
// });

// This is to sort the objects from the weather call and the trails object
function sortObject(object) {
    return Object.keys(object)
        .sort()
        .reduce((result, key) => {
            result[key] = object[key]
            return result
        }, {})
}

// Step 1
// This currently returns an object 'weather', with each location being a key, and weather.location returning an array
// weather object is sorted lexographically
async function retrieveWeather() {
    const weather = { trail: [], rossland: [], castlegar: [] }

    for (const key in weather) {
        await weatherDataCall(key)
            .then((data) => formatWeatherData(data))
            .then((data) => (weather[key] = data))
    }
    const sortedWeather = sortObject(weather)
    return sortedWeather

    function formatWeatherData(data) {
        const result = []
        const daysCount = data.daily.time.length

        for (let i = 0; i < daysCount; i++) {
            result.push({
                date: data.daily.time[i],
                max_temperature:
                    Math.trunc(data.daily.temperature_2m_max[i]) + "°C",
                min_temperature:
                    Math.trunc(data.daily.temperature_2m_min[i]) + "°C",
                total_rainfall: Math.trunc(data.daily.rain_sum[i]) + "mm",
                total_snowfall: Math.trunc(data.daily.snowfall_sum[i]) + "cm",
            })
        }

        return result
    }
}

// Step 2
// This returns an object containing locations, each location is an array containing objects of trails
// Object is sorted lexographically for consistency
// Call using const trails = await getTrailArrays(), trails.rossland for example
async function getTrailArrays() {
    try {
        await mongoose
            .connect(MONGO_TRAILS)
            .then(() => console.log("Trails database connected 👍"))

        const rosslandTrails = await Trails.RosslandDB.find()
        const trailTrails = await Trails.TrailDB.find()
        const castlegarTrails = await Trails.CastlegarDB.find()

        const trailArrays = {
            trail: trailTrails,
            rossland: rosslandTrails,
            castlegar: castlegarTrails,
        }
        const sortedTrailArrays = sortObject(trailArrays)
        // console.log(sortedTrailArrays)
        return sortedTrailArrays
    } catch (error) {
        if (error.response) {
            console.log(error.response.status)
            console.log(error.response.data)
        } else if (error.message) {
            console.log(error.message)
        } else {
            console.log(error)
        }
    } finally {
        await mongoose
            .disconnect()
            .then(console.log("Trails database disconnected 👍"))
    }
}

// Input template literal string with AI prompt, returns the GPT response
async function callAI(trailForcastPrompt) {
    try {
        const completion = await openai.createCompletion({
            // Comment in 3.5 when available and compare output
            model: "text-davinci-003",
            // model: "gpt-3.5-turbo",
            prompt: `${trailForcastPrompt}}`,
            //   Adjust tokens to make sure full response is received
            max_tokens: 150,
            temperature: 0.5,
        })
        console.log(completion.data.choices[0].text)
        return completion.data.choices[0].text
    } catch (error) {
        if (error.response) {
            console.log(error.response.status)
            console.log(error.response.data)
        } else {
            console.log(error.message)
        }
    }
}

async function createForecastDocuments(trailName, aiAnswer) {
    const maxTries = 3
    let currentTry = 0

    if (Forecasts.RosslandForecastsDB.find({ trailName: trailName })) {
        while (currentTry < maxTries) {
            try {
                // Update the document
                await Forecasts.RosslandForecastsDB.updateOne({
                    /* Find corresponding forcast object and input aiAnswer */
                    aiAnswer,
                })
                break
            } catch (error) {
                console.log(
                    `${trailName} forecast wasn't written successfully to the database 😟`
                )
                currentTry++
            }
        }
    } else {
        while (currentTry < maxTries) {
            try {
                // create a new document with the info
                // console.log("New document created 👍") //This should really only run on the first ever forecast creation for each
            } catch (error) {
                console.log(/* The error, plus the index or id of the document that caused the error */)
                currentTry++
            }
        }
    }
}

async function createAllForecasts() {
    const weather = await retrieveWeather()
    const trails = await getTrailArrays()

    // mongoose.connect(MONGO_FORECASTS).then(() => console.log("Forecasts database connected 👍"))

    for (const location in trails) {
        let arr = trails[location]
        arr.forEach(async (trail) => {
            let aiPrompt = `The following list of JSON objects contains today's, and the previous 5 days worth of weather data for a mountainbiking destination:
                            Today: ${JSON.stringify(weather[location][5])}
                            Yesterday: ${JSON.stringify(weather[location][4])}
                            2 days ago: ${JSON.stringify(weather[location][3])}
                            3 days ago: ${JSON.stringify(weather[location][2])}
                            4 days ago: ${JSON.stringify(weather[location][1])}
                            5 days ago: ${JSON.stringify(weather[location][0])}

                            The following object is a representation of a mountainbike trail at the destination, with relevant information and factors that contribute to expected conditions of the trail, as well as a description of the trail. The number in the difficulty field corresponds to the difficulty rating of the trail, 1 being green, 4 being double black:

                            ${trail}

                            Given this information, give a star rating as a single digit from 1 to 5 about today's expected conditions of the trail, 1 being unrideable and 5 being very good, and a descriptive forecast of the expected conditions of the trail today. 
                            Keep in mind that trails at 0-1000m elevation are typically snow covered from mid-October until late-April. Trails at 1500-2000m usually don't open till June at least, and close in early October. If there is snow on the trail it shouldn't receive a star rating greater than 1, and if there has been rain in the last 2 days the rating shouldn't be higher than 3.
                            Your answer MUST only output the answer in the following JSON format, all values must be a string with double quotation marks, and limit the descriptiveForecast to around 50 words, prioritising describing interactivity with the recent rain:
                            {
                                "trailName": "${trail.trailName}",
                                "starRating": "",
                                "descriptiveForcast": ""
                            }`
            // Regex removes the code indentation from the string
            let cleanedPrompt = aiPrompt.replace(/(?<=\n)\s+/g, "")
            // console.log("Prompt:", cleanedPrompt)

            let aiAnswer = await callAI(cleanedPrompt)
            let jsonAnswer = await JSON.parse(aiAnswer)
            console.log(jsonAnswer)
            // createForecastDocuments(aiPrompt, trail.trailName)
        })
        break
    }
}

// Testing-------------------------------------------------------------------

createAllForecasts()
// const weather = await retrieveWeather()
// console.log(weather.trail[5])

// Regex to match the JSON AI answer
// ^\s*\{[\s\S]*"\S+":\s*("[^"\\]*(\\.[^"\\]*)*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\[\s*\s*(?:,\s*\s*)*\])\s*\}\s*$
