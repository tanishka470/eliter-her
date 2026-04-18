# Safe Nest - Women Safety Navigation Platform

Safe Nest is a multi-page web application that helps women quickly check area safety, view key safety indicators on a map, and discover women-friendly places.

This project is built using plain HTML, CSS, and JavaScript, with Leaflet for map rendering.

## Project Goals

- Provide a simple safety-first user flow
- Let users save and reuse location input
- Show understandable safety metrics for selected locations
- Help users find trusted women-friendly places
- Keep code maintainable using separated HTML, CSS, and JS files

## Core Features

- Authentication page with Login and Signup flow
- Dashboard with location form and quick action cards
- Safety Map page with:
  - Zone overlays
  - Safety indicator breakdown
  - Score and rating system
  - Optional unsafe-report markers from local reports
- Report Unsafe Area page with:
  - Auto-filled location (editable manually)
  - Issue-type selection
  - Description input
  - Optional image upload
  - Local report storage in browser
- Women-Friendly Places page with:
  - Category filters
  - Search
  - Reviews and ratings
- Local data persistence using browser localStorage

## Page Flow

1. User starts at Login/Signup page
2. After login, user goes to Dashboard
3. User enters location and checks safety
4. User can open:
   - Safety Map
  - Report Unsafe Area
   - Women-Friendly Places
   - Emergency and report actions

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- Leaflet.js (OpenStreetMap tiles)
- Browser localStorage

## Folder Structure

.
|-- index.html
|-- dashboard.html
|-- map.html
|-- report.html
|-- places.html
|-- README.md
|-- css/
|   |-- index.css
|   |-- dashboard.css
|   |-- map.css
|   |-- report.css
|   |-- places.css
|-- js/
|   |-- index.js
|   |-- dashboard.js
|   |-- map.js
|   |-- report.js
|   |-- places.js

## How To Run

1. Open the project folder in VS Code.
2. Start with index.html.
3. Open it using a Live Server extension or any browser.
4. Navigate through the pages using the app flow.

No build tools or package installation are required.

## Data Stored In Browser

The app stores selected data in localStorage, including:

- User accounts created from signup
- Current logged-in user information
- Selected location details
- Place reviews and ratings
- Unsafe area reports (with optional image data URL)

If needed, clear browser localStorage to reset app data.

## Notes For Development

- Styling is separated by page inside css folder.
- Logic is separated by page inside js folder.
- Each HTML page links only its required CSS and JS.
- Keep future features in the same page-wise separation style.

## Future Improvements

- Integrate real APIs for safety and alerts
- Add backend authentication
- Add role-based admin reports
- Add geolocation and live tracking support
- Improve accessibility and i18n support

## License

This project is for educational and prototype use.
