# Better Gamers League - Support Tracker


Traditionally, a video game critic or video game journalist’s job is to provide an avenue for gamers to feel like their voices will be heard. As the community moved to social media, the divide between consumers, critics, and creators of content began to change. With the ability to instantly share personal opinions online, the gaming community has evolved into a disharmony of clashing ideas. While video game journalists and public relations try to mitigate this and use it to fuel the industry, over the past few years the community has become self-destructive by igniting controversy over real-life social issues.

A web application for tracking and analyzing gameplay behavior and community sentiment. Features a dashboard displaying player game stats, player sentiment, and performance metrics, with a leaderboard for positive and negative community members.

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
