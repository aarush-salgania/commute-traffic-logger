# 🚗 Commute Traffic Intelligence Logger

A robust data collection pipeline designed to statistically determine the optimal commute departure times. This project leverages the Google Maps Routes API to log real-time traffic-aware routing data, enabling data-driven decisions to minimize time spent in transit.

> **⚠️ Current Status:** This repository currently houses the **data collection pipeline only**. The system is active and logging data 24/7 to build a statistically significant dataset. Analysis scripts, visualization dashboards, and the companion app will be implemented in **Phase 2** once sufficient historical data has been gathered.

## 🧐 The Problem

Commute duration is highly volatile due to variable traffic patterns. Relying on "feeling" or ad-hoc checks often leads to getting stuck in preventable congestion. To solve this, I needed a way to move from anecdotal evidence to **historical data analysis**.

## 💡 The Solution

Instead of guessing, I built an automated ETL (Extract, Transform, Load) script that runs on a schedule. It queries the Google Maps "Compute Routes" API for real-time traffic data, normalizes the response to handle alternative routes, and persists the data into a structured CSV dataset for future analysis.

## ✨ Key Features

* **Traffic-Aware Routing:** Fetches the optimal route plus up to two alternative paths using Google's advanced traffic modeling.
* **Data Normalization:** Automatically handles variable API responses (e.g., when Google returns 1 vs 3 routes) to ensure a strictly structured, "Data Science Ready" CSV schema.
* **Cost & Quota Management:** Implements a strict internal circuit breaker to track API usage and prevent accidental billing overages.
* **Dual-Direction Tracking:** Logs logic for both `Home -> College` and `College -> Home` commutes.
* **Resilient Architecture:** Designed to run statelessly via Cron on low-power edge devices (like a Raspberry Pi).

## 🛠️ Tech Stack

### For the data collection pipeline:
* **Runtime:** Node.js
* **Cloud Services:** Google Maps Platform (Routes API v2)
* **Automation:** Linux Crontab
* **Data Storage:** Structured CSV (Flat File Database)

## 📊 Data Schema

The logger produces a strictly typed CSV with 14 columns, ensuring compatibility with Pandas/Matplotlib for downstream visualization.

| Column | Description |
| --- | --- |
| `timestamp` | ISO 8601 formatted date-time string |
| `direction` | `TO_COLLEGE` or `TO_HOME` |
| `route_name` | Name of the primary optimal route (e.g., "NH 5") |
| `duration` | Real-time traffic duration (in seconds) |
| `static_duration` | Theoretical duration without traffic (in seconds) |
| `distance` | Total distance (in meters) |
| `route_n_...` | Data for alternative routes (if available) |

## 🚀 Getting Started

### Prerequisites

* Node.js installed
* A Google Cloud Project with the **Routes API** enabled
* An API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/aarush-salgania/commute-traffic-logger.git
cd commute-traffic-logger

```


2. **Install dependencies**
```bash
npm install

```


3. **Configure Environment**
Create a `.env` file in the root directory:
```env
GMP_API_KEY=your_google_maps_api_key
COLLEGE_ID=place_id_of_destination
HOME_ID=place_id_of_origin

```


4. **Run Manually**
```bash
node index.js

```



### Automation (Cron)

To run this every 15 minutes on a Linux/Raspberry Pi server:

```bash
*/15 * * * * /usr/bin/node /path/to/project/main.js >> /path/to/project/cron.log 2>&1

```

## 🔮 Future Roadmap

* **Visualization Dashboard:** A web app to visualize the "Best Time to Leave" heatmaps.
* **Mobile App:** A React Native companion app for on-the-go checks.
* **Anomaly Detection:** Automated alerts when traffic deviates significantly from the historical average.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


**Author:** Aarush Salgania <br>
*Built to beat the traffic, one data point at a time.*