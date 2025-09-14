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

### Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Configuration

Create a `.env` file in the root directory with your ControlIT credentials:
```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:
```env
CONTROLIT_USERNAME=your_username_here
CONTROLIT_PASSWORD=your_password_here
```

This step is required to enable authenticated requests. The `.env` file is ignored by git for security.

### HTTPS Configuration (Optional)

To enable HTTPS for secure communication:

1. Set `USE_HTTPS=true` in your `.env` file
2. Generate SSL certificates (for development, you can create self-signed certificates):
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   ```
3. Update `SSL_KEY_PATH` and `SSL_CERT_PATH` in `.env` if certificates are in different locations

**Note**: For production, use certificates from a trusted Certificate Authority.

## Docker

To run the app using Docker Compose:

```bash
docker-compose up
```

### Notes

- The app will be accessible at `http://localhost:3000`.
- If you use `nodemon`, changes to local files will automatically restart the server (thanks to volume mapping in `docker-compose.yml`).