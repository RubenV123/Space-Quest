# Space Quest

Space Quest is an interactive, gamified space-science learning application. Learners take the role of a mission commander: they design spacecraft, balance engineering constraints, assemble a crew, and launch missions while learning about real spaceflight.

The project makes science practical through a mission loop. A ship that lacks thrust, fuel, power, or crew capacity cannot meet its mission requirements. Learners can explore destinations, complete short lessons, and review NASA data alongside their mission progress. The science content includes both kid-friendly and explorer-level explanations, for a broad audience of space learners.

Space Quest aims to make STEM concepts approachable through experimentation, immediate feedback, and playful mission planning. Its intended impact is stronger scientific literacy and early interest in space and STEM careers.

## Features

- Spacecraft construction with mass, thrust, fuel, power, and crew-capacity checks
- Mission selection, crew assignment, launch simulation, and mission reports
- Solar system exploration and science lessons with kid-friendly and explorer-level explanations
- Planet fact cards and expanded real-world mission dossiers
- Account registration and sign-in with per-account commander progress
- NASA Astronomy Picture of the Day (APOD), NASA/JPL Near Earth Object Web Service (NeoWs), and Meteorite Landings data

## NASA data sources

The active app requests NASA data through the Express backend. The backend keeps the NASA API key server-side and briefly caches successful responses.

- **Astronomy Picture of the Day (APOD):** displays NASA's current featured space image, title, date, and explanation. [NASA Open APIs](https://api.nasa.gov/)
- **Near Earth Object Web Service (NeoWs):** shows asteroids with close approaches to Earth, including approach distance and hazard classification. [NASA NeoWs](https://api.nasa.gov/)
- **Meteorite Landings:** displays recorded meteorites ordered by mass, with year, classification, and mass converted from grams to kilograms. [NASA Open Data Portal dataset](https://data.nasa.gov/dataset/meteorite-landings)

## Learning flow

1. Review progress in Mission Control.
2. Choose a destination and design a spacecraft to meet its requirements.
3. Learn a relevant science concept and answer a pre-flight question when one is available.
4. Select a crew, plan the flight, and respond to an in-flight event.
5. Explore the destination, collect science data, and earn mission XP and badges.

Space Academy also includes real-world mission profiles. Space Lab provides interactive physics demonstrations, and the solar-system view gives reference facts for the planets.

## Technology

- **Frontend:** React with TSX, Tailwind CSS, and Lucide React icons
- **Backend:** Node.js and Express
- **Storage:** SQLite for user accounts, sessions, and commander profiles
- **External data:** NASA APOD, NASA/JPL NeoWs, and NASA Open Data Meteorite Landings, fetched by the backend

The current repository uses email/password authentication with SQLite-backed profiles. User records stay in the database on the machine running the backend; NASA is the source of science data, not the account database.

## Requirements

- Node.js 22.12 or newer
- npm
- A NASA API key (the NASA `DEMO_KEY` can be used for a quick local start, with lower rate limits)

The backend uses Node's built-in `node:sqlite` module, so no separate database server is needed.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   **PowerShell**

   ```powershell
   Copy-Item .env.example .env
   ```

   **macOS / Linux**

   ```bash
   cp .env.example .env
   ```

3. Set `NASA_API_KEY` in `.env` to your NASA API key. Keep `.env` private; it is excluded from Git.

4. Start the frontend and API server together:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173).

The Vite development server proxies `/api` requests to the Express API at `http://127.0.0.1:3001`. The API creates `data/spacequest.sqlite` automatically on first start. User accounts and commander profiles stay in that local database.

## Useful commands

```bash
npm run dev          # Start Vite and the API server
npm run dev:client   # Start only the Vite frontend
npm run dev:server   # Start only the Express API
npm run build        # Create the frontend production bundle
npm run preview      # Preview the frontend production bundle
```

## API routes

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Check API status |
| `POST /api/auth/register` | Create an account |
| `POST /api/auth/login` | Sign in |
| `POST /api/auth/logout` | Sign out |
| `GET /api/auth/me` | Read the current session |
| `/api/profiles` | List and create commander profiles |
| `/api/profiles/:id` | Update or delete a commander profile |
| `GET /api/nasa/apod` | Fetch NASA Astronomy Picture of the Day |
| `GET /api/nasa/neo` | Fetch today's near-Earth object data |
| `GET /api/nasa/meteorites` | Fetch the largest recorded meteorite landings |

## Project layout

```text
main.tsx             React entry point
space_academy.tsx    Space Quest interface and game screens
styles.css           Global styles and Tailwind import
server/index.js      Express API, authentication, SQLite, and NASA services
data/                Local SQLite database (generated; not committed)
```

## Notes

- Never commit `.env`, API keys, account data, or the local SQLite database.
- NASA is the source for space-science data; user accounts and profiles are stored in the local SQLite database.
- `oldspace_academy.tsx` is a local restore backup and is excluded from the repository. The active component is `space_academy.tsx`.
- The Express API currently binds to localhost. Hosting the API publicly requires deployment configuration and a secure database plan.
- No license is included. Choose a license before publishing if you want to grant reuse rights.
