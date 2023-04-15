# Dirt Server

## Trail Data

Trail data is primarily pulled from local maps and information, first-hand knowledge, and [Trailforks](https://www.trailforks.com/). Each of the JSON files can be called with the fetch api to the src/trails  directory (this may be moved to an external api in the future purely for learning purposes), eg "fetch("./src/trails/rossland-trails.json")". Keys are in kebab case rather than camel case to denote that it is coming from JSON.

### JSON Key and Value Sets

"trail-name" returns a string value of the grammatically correct name of the trail.

"description" at this point is an empty string. This will either be hardcoded into the JSON over time, or programmatically generated into the app with the OpenAI API. Placeholder key for now.

"difficulty" returns a number from 1 to 4, each symbolising one of the four accepted mountainbiking difficulty ratings in North America:
- 1 translates to "Green", and is easiest or for beginners.
- 2 translates to "Blue", and is intermediate.
- 3 translates to "Black", and is advanced.
- 4 translates to "Double Black", and is very advanced.

"composition" returns an array and can return any of the following values:
- "Dirt"
- "Rocks"
- "Roots"
- "Wooden features"
- "Rock rolls"
- "Drops"
- "Jumps"

"weather-reactivity" is defined by the question "how challenging is the trail to ride after either a recent rain event, or no rain events for quite a while?" and "traffic" is defined by popularity and usage. Both return one of three values:
- "Low"
- "Moderate"
- "High"

"elevation" refers to the highest elevation of the trail, and returns an integer value rounded to the nearest 25, denoting meters above sealevel.

"aspect" refers to the side of the mountain that the trail primarly lies upon, and returns one of the four points on the compass:
- "North"
- "East"
- "South"
- "West"

"trail-type" refers to the style of mountain bike riding that the trail primarily focuses on and returns one of the following values:
- "XC" is cross-country.
- "Flow" is more speed focused, often including smoother trail and jumps.
- "Tech" is slower paced, often steeper, and involves technical features.
- "AM" is all-mountain, and contains elements of all riding types.
- "Climb" is primarily uphill use only.

An example trail object is as follows:

    {
        "Trail name": "Drake's",
        "Description": "",
        "Difficulty": "Blue",
        "Composition": [
            "Dirt",
            "Rocks",
            "Roots"
        ],
        "Weather Reactivity": "Low",
        "Traffic": "Moderate",
        "Elevation": "950",
        "Aspect": "North",
        "Trail type": "Climb"
    }