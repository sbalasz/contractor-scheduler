# Contractor Scheduler Dashboard

A comprehensive dashboard for managing contractors, jobs, and schedules with advanced features including calendar integration, analytics, and data export capabilities.

## Features

### 🏢 Contractor Management
- **CRUD Operations**: Add, edit, delete, and view contractor information
- **Tag System**: Group contractors by specialties and categories (Electrician, Plumber, HVAC, etc.)
- **Search & Filter**: Find contractors by name, company, specialty, or tags
- **Contact Information**: Store email, phone, hourly rates, and notes
- **Company Details**: Track contractor companies and specialties

### 📅 Schedule Calendar
- **Calendar View**: Visual calendar interface for viewing scheduled appointments
- **Week View**: Grid layout showing all appointments for the current week
- **Date Selection**: Click on any date to view and manage schedules
- **Schedule Management**: Add, edit, and delete schedule entries
- **Time Tracking**: Set start and end times for each appointment
- **Status Management**: Track job status (scheduled, in-progress, completed, cancelled)
- **Notes**: Add detailed notes for each schedule entry

### 📊 Analytics Dashboard
- **Key Metrics**: Total contractors, jobs, scheduled hours, and completion rates
- **Visual Charts**: Pie charts, bar charts, and line graphs for data visualization
- **Job Status Overview**: Track completed, pending, and in-progress jobs
- **Contractor Distribution**: View contractors by specialty
- **Priority Analysis**: Jobs categorized by priority levels
- **Monthly Trends**: Track scheduled hours over time
- **Contractor Performance**: Individual contractor statistics and job counts

### 📤 Data Export
- **Multiple Formats**: Export to CSV and Excel (.xlsx) formats
- **Selective Export**: Choose which data types to include (contractors, jobs, schedules)
- **Comprehensive Data**: All fields included with proper formatting
- **Multiple Sheets**: Excel exports include separate sheets for each data type
- **Timestamp Formatting**: ISO format timestamps for easy parsing

### 🏷️ Tag System
- **Predefined Tags**: Electrician, Plumber, HVAC, Carpenter, Painter, Emergency, Maintenance
- **Color Coding**: Each tag has a unique color for easy identification
- **Flexible Grouping**: Contractors can have multiple tags
- **Filter by Tags**: Filter contractors and jobs by specific tags

### 🔄 Recurring Jobs
- **Recurring Patterns**: Support for daily, weekly, monthly, and yearly schedules
- **Flexible Intervals**: Set custom intervals (every X days/weeks/months/years)
- **End Conditions**: Set end dates or maximum occurrences
- **Automatic Generation**: System can generate recurring schedule entries

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Calendar**: React Day Picker
- **Date Handling**: date-fns
- **Export**: XLSX and PapaParse libraries
- **Icons**: Lucide React
- **Notifications**: Sonner for toast messages

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
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

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with Toaster
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── ContractorTable.tsx # Contractor management table
│   ├── ScheduleCalendar.tsx # Calendar and schedule management
│   ├── AnalyticsDashboard.tsx # Analytics and charts
│   └── ExportManager.tsx    # Data export functionality
├── data/
│   └── demo-data.ts         # Demo data for contractors, jobs, schedules
├── lib/
│   └── utils.ts             # Utility functions
└── types/
    └── index.ts             # TypeScript interfaces
```

## Demo Data

The application comes with comprehensive demo data including:

- **5 Contractors**: Various specialties (Electrical, Plumbing, HVAC, Carpentry, Painting)
- **5 Jobs**: Different priorities and statuses
- **6 Schedule Entries**: Including recurring patterns
- **7 Tags**: Predefined categories for organization

## Key Features in Detail

### Contractor Management
- Full CRUD operations with form validation
- Real-time search and filtering
- Tag-based organization with color coding
- Contact information management
- Hourly rate tracking

### Calendar Integration
- Interactive calendar with date selection
- Week view for overview of schedules
- Detailed daily schedule view
- Drag-and-drop functionality (future enhancement)
- Recurring appointment support

### Analytics & Reporting
- Real-time statistics and metrics
- Interactive charts and graphs
- Performance tracking
- Trend analysis
- Export capabilities

### Data Export
- CSV format for compatibility
- Excel format with multiple sheets
- Selective data export
- Proper formatting and timestamps
- Large dataset handling

## Future Enhancements

- **Database Integration**: Replace demo data with real database
- **User Authentication**: Multi-user support with roles
- **Notifications**: Email/SMS reminders for appointments
- **Mobile App**: React Native mobile application
- **API Integration**: Connect with external calendar systems
- **Advanced Reporting**: Custom report generation
- **Document Management**: File uploads and attachments
- **Time Tracking**: Automatic time tracking for jobs
- **Invoicing**: Generate invoices based on scheduled work

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.