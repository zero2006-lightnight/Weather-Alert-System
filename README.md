# Weather Alert System

A React application that displays weather forecasts and derives rule-based alerts and crop guidance from Open-Meteo data.

## Overview

The client fetches current conditions and a seven-day forecast from Open-Meteo, with location search through its geocoding API. Supabase is used for account and saved-data flows; this repository contains a frontend and Supabase SQL, not the Node.js backend described in the earlier README.

## Features

- Current conditions and hourly and daily forecast views
- Location search and weather map
- Threshold-based weather alerts and crop guidance
- Supabase-backed account and saved-data screens

## Tech Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Data:** Open-Meteo, Supabase
- **Maps and charts:** Leaflet, Chart.js

## Getting Started

Install Node.js and npm. In `client/`, install dependencies and start the app:

```bash
npm install
npm run dev
```

Create `client/.env` from `client/.env.example` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Supabase-backed features. Open-Meteo forecasts do not require an API key.

## Author

Pasupuleti Neeraj

[GitHub](https://github.com/zero2006-lightnight) | [LinkedIn](https://www.linkedin.com/in/pasupuleti-neeraj-b0698a3a7)