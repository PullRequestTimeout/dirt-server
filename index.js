//     Welcome!!   >(.)__                                                       //
//                  (___/   Roast my code, I need to learn.                     //
//                 ~~~~~~~                                @PullRequestTimeout   //
// -----------------------------------------------------------------------------//

import express from "express"
const app = express()
const PORT = 6969
import cors from "cors"

// To enable localhost development, not sure if I need this in prod still
app.use(cors())

// Routes
import updateRoute from "./routes/update.js"
app.use("/update", updateRoute)
import trailsRoute from "./routes/trails.js"
app.use("/trails", trailsRoute)
import forecastsRoute from "./routes/forecasts.js"
app.use("/forecasts", forecastsRoute)

// API home. Maybe should return the readme file.
app.get("/", (req, res) => {
    res.status(200).send(
        console.log(
            "Welcome to Dirt Server. Please use appropriate location routing to recieve JSON data. Readme is available at https://github.com/PullRequestTimeout/dirt-server."
        )
    )
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/. Niiiiice.`)
})
