# Contractor Scheduler

A comprehensive dashboard for managing contractors, jobs, schedules, and analytics built with Next.js and shadcn/ui.

## Features

- **Contractor Management**: Add, edit, and organize contractors with custom tags
- **Schedule Calendar**: Visual calendar with contractor bookings and job details
- **Analytics Dashboard**: Insights and statistics about contractors and jobs
- **Data Export**: Export data to CSV and Excel formats
- **Tag System**: Custom tag creation and management with color coding
- **Data Persistence**: Local storage for data persistence across sessions

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Calendar**: React Day Picker
- **Icons**: Lucide React
- **Data Export**: XLSX and PapaParse

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bali/contractor-scheduler.git
cd contractor-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application is configured for deployment on GitHub Pages.

### Automatic Deployment

The application automatically deploys to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions.

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. The static files will be generated in the `out` directory.

3. Deploy the `out` directory to your hosting platform.

## Configuration

### GitHub Pages Setup

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The workflow will automatically deploy on push to main branch

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public` directory with your domain
2. Configure your domain's DNS settings to point to GitHub Pages

## Project Structure

```
contractor-scheduler/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── data/               # Demo data
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── .github/workflows/      # GitHub Actions workflows
└── out/                    # Static export output (generated)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.