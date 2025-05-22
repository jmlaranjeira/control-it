# ControlIT Hours Tracker Panel

A lightweight, custom-built frontend to simplify and automate daily work hour registration in ControlIT. Designed to improve usability, reduce manual input, and allow efficient bulk operations.

## Features

### Core Functionality

- Date Range Selection: Choose a start and end date for batch hour registration.
- Simulation Mode: Dry-run mode to preview changes without submitting them.
- Calendar View: Visual display of weekdays from January 1st to today.
- Calendar Color Legend:
  - Green: Registered workday
  - Red: Unregistered workday
  - Yellow: Simulated registration (dry-run)
  - Orange (muted): Holiday or leave day

### Data Sources

- Registered Days: Extracted using a POST request to ControlIT’s internal report endpoint (`/reports/get-detailed-report`) and parsed with Cheerio.
- Holidays & Leave: Pulled from `get-vacations-and-onduty-ranges-from-employee` API.

### Intelligent Behavior

- Automatically excludes weekends (Saturday and Sunday).
- Skips holidays and leave days from submission.
- Highlights holidays differently in the calendar.

### UI Enhancements

- Displays a loading message while fetching calendar data.
- Inputs persist after form submission.
- Clean visual style with centered layout and smooth feedback.

## Tech Stack

- Node.js + Express
- EJS for templating
- Cheerio for HTML parsing
- node-fetch for external requests
- Luxon for date handling
- Nodemon for development

## Setup

```bash
npm install
npm run dev
```

### Configuration

Before running the app with Docker, update the `config.js` file with your ControlIT username and password:
```js
// config.js
export const config = {
  user: 'your_username',
  password: 'your_password'
};
```

This step is required to enable authenticated requests when using the app inside Docker.

## Docker

To run the app using Docker Compose:

```bash
docker-compose up
```

### Notes

- The app will be accessible at `http://localhost:3000`.
- If you use `nodemon`, changes to local files will automatically restart the server (thanks to volume mapping in `docker-compose.yml`).