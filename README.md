# Dirt Server

Dirt Server is the backend API for the Dirt Surfer app built with ExpressJS and MongoDB Atlas.

Two main tasks are performed by the server:

1. Once daily, the server makes a series of calls to a weather API, one for each trail network location with data in the database. In the first version of the app this includes Rossland, Trail, and Castlegar in British Columbia. Each of the returned weather data objects are stored, then the server iterates through each of the three collections of trail data providing key influencing points, and makes calls to OpenAI's GPT API using the weather data as a system parameter for the model, with the intent of receiving back both a star rating and a short description of the expected conditions of the trail. This is then passed back into the database and used in the API's second function.

2. The API offers an endpoint for each of the locations covered by the database, and these endpoints return two JSON objects; the first containing all the static trail data that is also used by the first function, and the second containing the AI generated forecast data. This can then be consumed by the client, the Dirt Surfer react app, to be displayed in customisable ways for the user.

## Trail Data

Trail data is accessable via routing endpoints. Client can call /trails/[location] to access the static trail data.

### JSON Key and Value Sets for Static Trail Data

**"trailName"** returns a string value of the grammatically correct name of the trail.

**"description"** returns a string describing the trail briefly. This will need to be fine-tuned to provide a worthwhile prompt from the OpenAI API.

**"difficulty"** returns a number from 1 to 4, each symbolising one of the four accepted mountainbiking difficulty ratings in North America:

-   1 translates to "Green", and is easiest or for beginners.
-   2 translates to "Blue", and is intermediate.
-   3 translates to "Black", and is advanced.
-   4 translates to "Double Black", and is very advanced.

**"composition"** returns an array and can return any of the following values:

-   "Dirt"
-   "Rocks"
-   "Roots"
-   "Wooden features"
-   "Rock rolls"
-   "Drops"
-   "Jumps"

**"weatherReactivity"** is defined by the question "how challenging is the trail to ride after either a recent rain event, or no rain events for quite a while?".

**"traffic"** is defined by popularity and usage.

**"treeCoverage"** is defined by how mach shelter the trail receives from trees by the trail, dense trees provide more, open space and wider
trails provide less.
All return one of three values:

-   "Low"
-   "Moderate"
-   "High"

**"elevation"** refers to the highest elevation of the trail, and returns an integer value rounded to the nearest 25, denoting meters above sealevel.

**"aspect"** refers to the side of the mountain that the trail primarly lies upon, and returns one of the four points on the compass:

-   "North"
-   "East"
-   "South"
-   "West"

**"trailType"** refers to the style of mountain bike riding that the trail primarily focuses on and returns one of the following values:

-   "XC" is cross-country.
-   "Flow" is more speed focused, often including smoother trail and jumps.
-   "Tech" is slower paced, often steeper, and involves technical features.
-   "AM" is all-mountain, and contains elements of all riding types.
-   "Climb" is primarily uphill use only.

An example trail object is as follows:

    {
        "trailName": "Columbia Trail",
        "description": "The Columbia Trail provides excellent early-season cross-country riding along the banks of the Columbia River. As part of the Trans-Canada Trail, it is an old and raw trail that can be sandy in places, and includes a few creek crossings with some exposure to the river.",
        "difficulty": "1",
        "composition": [
            "Dirt",
            "Rocks",
            "Roots"
        ],
        "weatherReactivity": "Moderate",
        "traffic": "Low",
        "elevation": "450",
        "aspect": "East",
        "trailType": "XC",
        "treeCoverage": "Moderate"
    }

## Forecast Data

Forecast data is accessable via routing endpoints. Client can call /forecasts/[location] to receive the dynamic trail forecasts.

### JSON Key and Value Sets for Dynamic Trail Data

**"trailName"** is the main identifier of the trail.

**"starRating"** is the numeric value from 1 to 5 given to signify a simplified expected condition of the trail.

**"descriptiveForecast"** is a string containing a short paragraph description of the expected condition of the trail.
