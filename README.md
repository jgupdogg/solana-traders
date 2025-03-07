# Solana Traders Dashboard

A standalone dashboard for tracking Solana whale trading activity.

## Features

- **Real-time Monitoring**: Track whale trading activity on the Solana blockchain
- **Dark/Light Mode**: Supports both dark and light themes with system preference detection
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive UI**: Hover effects and clean, modern design

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solana-traders-dashboard.git
cd solana-traders-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to http://localhost:3000

### Finalizing Setup

To clean up the project and prepare it for production:

```bash
chmod +x finalize.sh
./finalize.sh
```

This will:
- Remove unnecessary files and dependencies
- Create clean, final versions of all configuration files
- Set up proper data structures and mock services

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploying to AWS

The project includes a deployment script for AWS:

```bash
chmod +x build-deploy.sh
./build-deploy.sh
```

This will:
1. Build the application
2. Get S3 bucket name and CloudFront distribution ID from your CloudFormation stack
3. Upload files to S3
4. Invalidate CloudFront cache

## Project Structure

- `src/`
  - `contexts/`: React contexts including `ThemeContext` for theme management
  - `pages/`: Page components including the main `SolanaTraders` dashboard
  - `services/`: Services for data fetching, including `SnowflakeClient`
  - `index.css`: Main CSS file with Tailwind directives
  - `main.tsx`: Application entry point
  - `colors.js`: Color palette definition
- `public/`: Static assets
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration
- `vite.config.js`: Vite configuration

## Connecting to Real API

By default, the dashboard uses mock data. To connect to a real API:

1. Open `src/services/SnowflakeClient.ts`
2. Set `this.useMockData = false;`
3. Ensure your API base URL is correctly set in the `.env` file

## Environment Variables

Create a `.env.local` file for development:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

For production, create `.env.production`:
```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## Color Scheme

The dashboard uses a custom color scheme:

- Primary (Drab Brown): `#3E442B`
- Secondary (Ebony): `#6A7062`
- Accent (Cool Gray): `#8D909B`
- Light UI (Columbia Blue): `#D6EEFF`
- Light UI 2 (Cool Gray Light): `#AAADC4`

These colors are defined in `src/colors.js` and available as Tailwind classes.

## License

[MIT License](LICENSE)