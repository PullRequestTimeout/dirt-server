import fetch from 'node-fetch';

export default function weatherDataCall (location) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${locationCoords(location).lat}&longitude=${locationCoords(location).long}&daily=temperature_2m_max,temperature_2m_min,rain_sum,snowfall_sum&past_days=5&forecast_days=1&timezone=America%2FLos_Angeles`)
        .then((response) => response.json())
        .then((weatherData) => {
            console.log(weatherData)
        })

    // This needs to be expanded as more locations are added
    function locationCoords (location) {
        switch (location) {
            case "rossland":
                return {
                    lat: "49.08",
                    long: "-117.80"
                }
            case "trail":
                return {
                    lat: "49.10",
                    long: "-117.70"
                }
            case "castlegar":
                return {
                    lat: "49.32",
                    long: "-117.66"
                }
        }
    }
};
