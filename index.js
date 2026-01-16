const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GMP_API_KEY = process.env.GMP_API_KEY; // Google Maps Platform API Key
const COLLEGE_ID = process.env.COLLEGE_ID; // Get it from Google Places API or https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
const HOME_ID = process.env.HOME_ID; // Get it from Google Places API or https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder

const CSV_FILE = path.join(__dirname,data, "routes_output.csv");
const QUOTA_FILE = path.join(__dirname,data, "quota.json");
const DAILY_LIMIT = 4 * 24 + 100; // 4 requests per hour, once everyy 15 minutes, add 100 to be safe

if (!fs.existsSync(CSV_FILE)) {
  const header =
    "timestamp,direction," +
    "route_name,duration,static_duration,distance," +
    "route_1_name,route_1_duration,route_1_static_duration,route_1_distance," +
    "route_2_name,route_2_duration,route_2_static_duration,route_2_distance\n";

  fs.writeFileSync(CSV_FILE, header);
  console.log(`📝 Created new CSV file with headers at ${CSV_FILE}`);
}

const URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

const headers = {
  "X-Goog-FieldMask":
    "routes.duration,routes.distanceMeters,routes.staticDuration,routes.description",
  "Content-Type": "application/json",
  "X-Goog-Api-Key": GMP_API_KEY,
};

function checkQuota() {
  const today = new Date().toISOString().split("T")[0];
  let data = {
    date: today,
    count: 0,
  };
  if (fs.existsSync(QUOTA_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(QUOTA_FILE));
    } catch (e) {}
  }
  if (data.date !== today) {
    data.date = today;
    data.count = 0;
  } else data.count += 2;
  if (data.count >= DAILY_LIMIT) {
    console.log(`Daily quota of ${DAILY_LIMIT} requests reached. Exiting.`);
    return false;
  }
  fs.writeFileSync(QUOTA_FILE, JSON.stringify(data));
  return true;
}

async function main() {
  if (!checkQuota()) {
    console.log("🛑 Quota limit reached.");
    return;
  }
  let payload = {
    method: "post",
    maxBodyLength: Infinity,
    url: URL,
    headers: headers,
    data: {
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE_OPTIMAL",
      computeAlternativeRoutes: true,
      languageCode: "en-IN",
      origin: {
        placeId: undefined,
      },
      destination: {
        placeId: undefined,
      },
    },
  };

  // To College
  payload.data.origin.placeId = HOME_ID;
  payload.data.destination.placeId = COLLEGE_ID;
  try {
    const response = await axios.request(payload);
    let logLine = "";
    const timestamp = new Date().toISOString();
    for (let i = 0; i < 3; i++) {
      const route = response.data.routes[i];
      if (route) {
        const durationSec = parseInt(route.duration.replace("s", ""));
        const distanceMeters = route.distanceMeters;
        const staticDurationSec = parseInt(
          route.staticDuration.replace("s", ""),
        );
        const routeName = (route.description || "Unknown").replace(/,/g, "");
        if (i === 0) {
          logLine += `${timestamp},TO_COLLEGE,${routeName},${durationSec},${staticDurationSec},${distanceMeters}`;
        } else {
          logLine += `,${routeName},${durationSec},${staticDurationSec},${distanceMeters}`;
        }
      } else {
        if (i === 0) {
          logLine += `${timestamp},TO_COLLEGE,N/A,N/A,N/A,N/A`;
        } else {
          logLine += `,N/A,N/A,N/A,N/A`;
        }
      }
    }
    logLine += "\n";
    fs.appendFileSync(CSV_FILE, logLine);
    console.log(`✅ Logged route data to ${CSV_FILE} on ${timestamp}`);
  } catch (error) {
    console.error(
      "❌ API Error:",
      error.response ? error.response.data : error.message,
    );
  }
  // To Home
  payload.data.origin.placeId = COLLEGE_ID;
  payload.data.destination.placeId = HOME_ID;
  try {
    const response = await axios.request(payload);
    let logLine = "";
    const timestamp = new Date().toISOString();

    for (let i = 0; i < 3; i++) {
      const route = response.data.routes[i];
      if (route) {
        const durationSec = parseInt(route.duration.replace("s", ""));

        const distanceMeters = route.distanceMeters;
        const staticDurationSec = parseInt(
          route.staticDuration.replace("s", ""),
        );
        const routeName = (route.description || "Unknown").replace(/,/g, "");
        if (i === 0) {
          logLine += `${timestamp},TO_HOME,${routeName},${durationSec},${staticDurationSec},${distanceMeters}`;
        } else {
          logLine += `,${routeName},${durationSec},${staticDurationSec},${distanceMeters}`;
        }
      } else {
        if (i === 0) {
          logLine += `${timestamp},TO_HOME,N/A,N/A,N/A,N/A`;
        } else {
          logLine += `,N/A,N/A,N/A,N/A`;
        }
      }
    }
    logLine += "\n";
    fs.appendFileSync(CSV_FILE, logLine);
    console.log(`✅ Logged route data to ${CSV_FILE} on ${timestamp}`);
  } catch (error) {
    console.error(
      "❌ API Error:",
      error.response ? error.response.data : error.message,
    );
  }
}
main();
