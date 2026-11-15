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
- **Authentication and profiles:** Firebase Authentication and Cloud Firestore
- **NASA API:** Node.js and Express proxy deployed as a separate free Render web service
- **External data:** NASA APOD, NASA/JPL NeoWs, and NASA Open Data Meteorite Landings, fetched by the backend

Email/password accounts are managed by Firebase Authentication. Commander profiles are stored in Firestore under each user's private account path. The Express service only proxies NASA requests so the NASA API key stays on the server.

## Requirements

- Node.js 22.12 or newer
- npm
- A NASA API key (the NASA `DEMO_KEY` can be used for a quick local start, with lower rate limits)

Firebase handles account storage and profile data; the NASA Express service does not store user data.

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

The Vite development server proxies `/api` requests to the Express API at `http://127.0.0.1:3001`. Fill the `VITE_FIREBASE_*` values in `.env` from the Firebase web app config to use sign-in and profiles locally.

Test the website here - [text](https://rubenv123.github.io/Space-Quest/)

## Useful commands

```bash
npm run dev          # Start Vite and the API server
npm run dev:client   # Start only the Vite frontend
npm run dev:server   # Start only the NASA API
npm run build        # Create the frontend production bundle
npm run preview      # Preview the frontend production bundle
npm start            # Start the NASA API server
```

## Free public deployment

GitHub Pages serves the Vite frontend. Firebase Authentication and Firestore provide the backend for accounts and profiles; the web SDK connects directly from the browser. Render runs only the NASA API proxy, with no local account database. The included GitHub Actions workflow builds and deploys the frontend when changes are pushed to `main`; `render.yaml` configures the free NASA API service.

### One-time setup

1. Create a Firebase project and register a Web app. Enable **Authentication → Email/Password** and create a **Cloud Firestore** database.
2. In Firebase Authentication settings, add `rubenv123.github.io` to **Authorized domains**.
3. Publish the rules in `firestore.rules` to Firestore. They restrict each user's profile documents to that signed-in user.
4. In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID` from the Firebase web app config. These Firebase web config values identify the project; Firestore rules enforce data access.
5. In **Settings → Pages**, set the source to **GitHub Actions**. Push a commit to `main`; the workflow publishes the site at `https://rubenv123.github.io/Space-Quest/`.
6. In Render, create a Blueprint from this repository using `render.yaml`. Enter `NASA_API_KEY` as a secret. Once the service is live, add its `onrender.com` URL as the `VITE_API_BASE_URL` Actions variable and rerun the Pages workflow.

Free Render services sleep after 15 minutes of inactivity and may take about a minute to wake. Firebase's free plan has usage limits and may pause projects after extended inactivity; see [Render's free limits](https://render.com/docs/free) and [Firebase pricing](https://firebase.google.com/pricing).

## API routes

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Check API status |
| `GET /api/nasa/apod` | Fetch NASA Astronomy Picture of the Day |
| `GET /api/nasa/neo` | Fetch today's near-Earth object data |
| `GET /api/nasa/meteorites` | Fetch the largest recorded meteorite landings |

## Project layout

```text
main.tsx             React entry point
space_academy.tsx    Space Quest interface and game screens
styles.css           Global styles and Tailwind import
server/index.js      Express NASA API proxy
firebase.ts          Firebase Authentication and Firestore client setup
firestore.rules      Per-user Firestore profile access rules
```

## Notes

- Never commit `.env`, NASA API keys, Firebase service-account credentials, or account data. Firebase web app config values are public identifiers; access must be protected by Firestore Security Rules.
- NASA is the source for space-science data; Firebase Authentication and Firestore store user accounts and profiles.
- `oldspace_academy.tsx` is a local restore backup and is excluded from the repository. The active component is `space_academy.tsx`.
- Render hosts the NASA API only. GitHub Pages serves the built frontend.
- No license is included. Choose a license before publishing if you want to grant reuse rights.
