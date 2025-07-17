# Better Gamers League - Support Tracker

A web application for tracking and analyzing supportive gameplay performance. Features a dashboard displaying player stats, leaderboards, and performance metrics.

## Features

- Player tracking with summoner name and region
- Support performance metrics (vision score, healing, CC, etc.)
- Leaderboards with daily/weekly/monthly views
- Mock data support for development and demo purposes

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration
   - **IMPORTANT**: Never commit the `.env` file to version control

## Security Notes

- The `.env` file contains sensitive information and is excluded from version control
- API keys and tokens should only be stored in environment variables
- The application includes a demo mode that can be used without API keys
- When deploying, always use environment variables for sensitive values

## Development

Run the development server:
```bash
npm start
```

The application will be available at `http://localhost:5000`

## Deployment

This application is ready for deployment on Netlify:

1. Push your code to GitHub
   - Ensure `.env` and other sensitive files are in `.gitignore`
   - Verify no secrets are committed to the repository
2. Connect your GitHub repository to Netlify
3. Configure build settings:
   - Build command: `npm install`
   - Publish directory: `./`
4. Set up environment variables in Netlify:
   - Go to Site settings > Environment variables
   - Add required variables (RIOT_API_KEY, etc.)
   - For testing, set DEMO_MODE=true

## License

MIT