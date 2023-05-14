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

// This is to sort the objects from the weather call and the trails object
function sortObject(object) {
    return Object.keys(object)
        .sort()
        .reduce((result, key) => {
            result[key] = object[key]
            return result
        }, {})
}

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
                max_temperature: Math.trunc(data.daily.temperature_2m_max[i]) + "°C",
                min_temperature: Math.trunc(data.daily.temperature_2m_min[i]) + "°C",
                total_rainfall: Math.trunc(data.daily.rain_sum[i]) + "mm",
                total_snowfall: Math.trunc(data.daily.snowfall_sum[i]) + "cm",
            })
        }

        return result
    }
}

// This returns an object containing locations, each location is an array containing objects of trails
// Object is sorted lexographically for consistency
// Call using const trails = await getTrailArrays(), trails.rossland for example
async function getTrailArrays() {
    try {
        await mongoose.connect(MONGO_TRAILS).then(() => console.log("Trails database connected."))

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
        await mongoose.disconnect().then(console.log("Trails database disconnected."))
    }
}

// This function inputs the trails object, loops through each trail in each location,
// and builds a string out of the data to better prompt the AI model

// This is the solution to one of two options; either custom build the prompt every time in a natural language snippet like this,
// or use a model with a training data set supplied. This is the simpler, more time efficient option, but depends how the output is
// both options will be tested, and maybe some combination of both is the best approach.
async function trailObjectsToString() {
    const trails = await getTrailArrays()
    const trailObj = {
        castlegar: [],
        rossland: [],
        trail: [],
    }

    for (const location in trails) {
        let arr = trails[location]

        arr.forEach((trail) => {
            const trailString = `This trail is called ${trail.trailName}. It is rated as ${trailDifficulty(
                trail.difficulty
            )} difficulty, and the terrain is composed of ${trailComposition(
                trail.composition
            )}. The trail has a ${trail.weatherReactivity.toLowerCase()} reactivity to weather events, which means it will be ${weatherReactivity(
                trail.weatherReactivity
            )}. The trail sees a ${trail.traffic.toLowerCase()} amount of traffic over the course of the season, so it will likely be ${trafficFrequency(
                trail.traffic
            )}. The trails highest point sits at ${trail.elevation}m, which means that the trail ${elevationVariance(parseInt(trail.elevation))}. ${
                trail.trailName
            } lies primarily on the ${trail.aspect.toLowerCase()} aspect of the mountain, which means the trail ${aspect(
                trail.aspect
            )}. The trail has ${trail.treeCoverage.toLowerCase()} tree coverage and shading which can mean that the trail ${treeCoverage(
                trail.treeCoverage
            )}.`

            trailObj[location].push({
                trailName: trail.trailName,
                trailString: trailString,
                description: trail.description,
            })
        })

        function trailDifficulty(x) {
            switch (x) {
                case 1:
                case "1":
                    return "green"
                case 2:
                case "2":
                    return "blue"
                case 3:
                case "4":
                    return "black"
                case 4:
                case "4":
                    return "double black"
            }
        }

        // Converts composition array of strings to natural language
        function trailComposition(comp) {
            let compString = ""
            comp.forEach((item, index) => {
                if (index === comp.length - 2) {
                    compString += `${item.toLowerCase()}, and `
                } else if (index === comp.length - 1) {
                    compString += item.toLowerCase()
                } else {
                    compString += `${item.toLowerCase()}, `
                }
            })
            return compString
        }

        // Inputs a string "Low" | "Moderate" | "High", and outputs reasoning for rating
        function weatherReactivity(react) {
            switch (react) {
                case "Low":
                    return "not be challenging to ride after varying weather conditions"
                case "Moderate":
                    return "difficult to ride only if the recent weather events have been more intense"
                case "High":
                    return "challenging to ride if the conditions are anything less than ideal"
            }
        }

        // Inputs a string "Low" | "Moderate" | "High", and outputs reasoning for rating
        function trafficFrequency(freq) {
            switch (freq) {
                case "Low":
                    return "in better shape than other trails in the area after recent adverse weather events"
                case "Moderate":
                    return "in variable conditions, depending on the recent traffic intensity"
                case "High":
                    return "dusty after periods of high heat and low rainfall, and rutted or rough after periods of rain and low temperatures"
            }
        }

        // Self explanatory, but value ranges and prompt strings might need fine tuning
        function elevationVariance(elev) {
            if (elev <= 500) {
                return "is likely open for a lot of the year, is likely completely clear of snow from March till December, but is more affected by heat in the hotter months of the year"
            } else if (elev > 500 && elev <= 1000) {
                return "is likely open from March until November, will receive more rain than snow in the winter, but will likely be dusty earlier in the year"
            } else if (elev > 1000 && elev <= 1500) {
                return "might not open until May or June and can close in November if there is any measurable amount of snowfall, it will likely be in better shape than lower elevation trails during hotter months of the year"
            } else if (elev > 1500) {
                return "isn't open until at least July and closes as early as October, but likely won't get very dusty at all at high elevation, and there is a chance of snow any time of the year"
            }
        }
        // Inputs one of four aspect strings "North" | "East" | "South" | "West", and outputs how that can impact the trail conditions
        function aspect(asp) {
            switch (asp) {
                case "North":
                    return "often receives more shade, remains muddy for longer after rain events, but won't be as dusty after periods of high heat"
                case "East":
                    return "receives more sun in the morning, so will dry out quicker if the weather in the morning is clear, or vice versa"
                case "South":
                    return "often gets more sun and opens earlier in the season, dries out faster after rain, but becomes dusty after periods of high heat"
                case "West":
                    return "receives more sun in the afternoon, so will dry out slower if the weather in the morning is clear, or vice versa"
            }
        }

        function treeCoverage(cov) {
            switch (cov) {
                case "Low":
                    return "opens earlier in the season and receives more benefit from rain during hot, dry periods of the year, but also drys out quicker afterwards"
                case "Moderate":
                    return "can have sections of varied coverage, with a mixed impact on the trail"
                case "High":
                    return "opens later in the season, and remains wetter for longer after rain events, and can also remain cooler during hotter periods"
            }
        }
    }
    const sortedTrailObj = sortObject(trailObj)
    return sortedTrailObj
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
            max_tokens: 200,
            temperature: 0.5,
        })
        // console.log(completion.data.choices[0].text)
        return completion.data.choices[0].text.trim()
    } catch (error) {
        if (error.response) {
            console.log(error.response.status)
            console.log(error.response.data)
        } else {
            console.log(error.message)
        }
    }
}

// This is the final piece and still doesn't work just yet

// createForecastDocuments looks for document by trailName in the DB, and either create a new or updates the current forecast object
// trailName is a string, aiAnswer needs to be an object with the values "descriptiveForecast" and "starRating",
// and location is the key passed down from the object the trail is coming from
async function createForecastDocuments(trailName, aiAnswer, location) {
    const maxTries = 3
    let currentTry = 0

    if (await locationDB(location).exists({ trailName: trailName })) {
        console.log("Document exists.")

        while (currentTry < maxTries) {
            try {
                const trailDoc = await locationDB(location).findOne({ trailName: trailName })
                trailDoc.starRating = aiAnswer.starRating
                trailDoc.descriptiveForecast = aiAnswer.descriptiveForecast
                await trailDoc.save()
                break
            } catch (error) {
                console.log(`${trailName} forecast wasn't written because of ${error}`)
                currentTry++
            }
        }
    } else {
        console.log("Document doesnt exist.")

        while (currentTry < maxTries) {
            try {
                // create a new document with the info
                await locationDB(location).create({
                    trailName: trailName,
                    starRating: aiAnswer.starRating,
                    descriptiveForecast: aiAnswer.descriptiveForecast,
                })
                console.log("New document created.") //This should really only run on the first ever forecast creation for each
                break
            } catch (error) {
                console.log(`${trailName} wasn't written correctly to DB due to ${error}`)
                currentTry++
            }
        }
    }

    function locationDB(location) {
        switch (location.toLowerCase()) {
            case "rossland":
                return Forecasts.RosslandForecastsDB
            case "trail":
                return Forecasts.TrailForecastsDB
            case "castlegar":
                return Forecasts.CastlegarForecastsDB
        }
    }
}

async function createForecasts() {
    const weather = await retrieveWeather()
    const trails = await trailObjectsToString()

    await mongoose.connect(MONGO_FORECASTS).then(() => console.log("Forecasts database connected."))

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

                            Here are the characteristics of the trail:
                            ${trail.trailString}

                            And a brief description:
                            ${trail.description}

                            Given this information, give a star rating as a single digit from 1 to 5 about today's expected conditions of the trail, 1 being unrideable and 5 being very good, and a descriptive forecast of the expected conditions of the trail today.

                            Your answer MUST only output the answer in the following valid JSON format, all values must be a string with double quotation marks, and limit the descriptiveForecast to around 50 words, prioritising describing interactivity with the recent weather:
                            {
                                "trailName": "${trail.trailName}",
                                "starRating": "",
                                "descriptiveForecast": ""
                            }
                            `
            // Regex removes the code indentation from the string
            let cleanedPrompt = aiPrompt.replace(/(?<=\n)\s+/g, "")
            let aiAnswer = await callAI(cleanedPrompt)
            let jsonAnswer = JSON.parse(aiAnswer)

            await createForecastDocuments(trail.trailName, jsonAnswer, location)
        })
    }

    await mongoose.disconnect().then(() => console.log("Forecasts database disconnected."))
}

// Testing-------------------------------------------------------------------

// This will run the task at 3am every day, should only be started when app is live to save money

// cron.schedule('0 3 * * *', () => {
//     createForecasts()
// });

createForecasts()
