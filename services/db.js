import { MongoClient } from "mongodb";

const connectionString = process.env.MONGO_CONNECT || "";

const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
} catch(err) {
  console.error(err);
}

// This should work, but the exact db sockets might need tweaking. Access locations with dbTrails.rossland etc
export let dbTrails = conn.db("trails");
export let dbForecasts = conn.db("forecasts");
