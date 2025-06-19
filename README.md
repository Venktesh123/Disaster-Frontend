# Disaster Response Frontend

A modern, responsive React frontend for the Disaster Response Coordination Platform built with React, Tailwind CSS, and Framer Motion.

## Features

- _Modern UI/UX_: Clean, professional design with dark/light theme support
- _Real-time Updates_: Socket.IO integration for live disaster updates
- _Responsive Design_: Works seamlessly on desktop, tablet, and mobile devices
- _Role-based Access_: Different features available based on user roles (User, Contributor, Admin)
- _Interactive Dashboard_: Real-time charts and statistics
- _Disaster Management_: Create, view, and manage disaster reports
- _Resource Tracking_: Locate and manage emergency resources
- _Social Media Monitoring_: Real-time social media alerts
- _Image Verification_: AI-powered image authenticity verification
- _Animated Interactions_: Smooth animations with Framer Motion

## Tech Stack

- _React 18_ - Frontend framework
- _Tailwind CSS_ - Utility-first CSS framework
- _Framer Motion_ - Animation library
- _React Router_ - Client-side routing
- _React Query_ - Data fetching and caching
- _Socket.IO Client_ - Real-time communication
- _React Hook Form_ - Form handling
- _Lucide React_ - Icon library
- _Recharts_ - Charts and data visualization
- _React Hot Toast_ - Toast notifications

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- The backend API server running (see backend README)

## Installation

1. _Clone the repository_
   bash
   git clone <repository-url>
   cd disaster-response-frontend

2. _Install dependencies_
   bash
   npm install

3. _Set up environment variables_
   bash
   cp .env.example .env

   Edit .env and configure:
   env
   REACT_APP_API_URL=http://localhost:3001

4. _Start the development server_
   bash
   npm start

   The application will open at http://localhost:3000

## Available Scripts

- npm start - Runs the app in development mode
- npm run build - Builds the app for production
- npm test - Launches the test runner
- npm run eject - Ejects from Create React App (one-way operation)

## Project Structure

src/
├── components/ # Reusable UI components
│ └── Layout/ # Layout components (Header, Sidebar)
├── contexts/ # React Context providers
│ ├── AuthContext.js # Authentication state
│ ├── ThemeContext.js # Theme management
│ └── SocketContext.js # Socket.IO connection
├── pages/ # Page components
│ ├── Dashboard.js # Main dashboard
│ ├── Disasters.js # Disaster management
│ ├── DisasterDetail.js # Individual disaster view
│ ├── Reports.js # Report management
│ ├── Resources.js # Resource management
│ ├── SocialMedia.js # Social media monitoring
│ ├── Verification.js # Image verification
│ ├── Settings.js # User settings
│ └── Login.js # Authentication
├── services/ # API services
│ └── api.js # API configuration and endpoints
├── App.js # Main App component
├── App.css # Global styles
└── index.js # Application entry point

## Authentication

The app uses a mock authentication system with predefined users:

- _citizen1_ (User) - Basic disaster reporting
- _contributor1_ (Contributor) - Resource management + reporting
- _reliefAdmin_ (Admin) - Full access to all features
- _netrunnerX_ (Super Admin) - System administration

Password for all accounts: password

## Key Features

### Dashboard

- Real-time statistics and charts
- Recent disaster activity
- Quick action buttons
- Live updates feed

### Disaster Management

- Create and manage disaster reports
- View detailed disaster information
- Real-time status updates
- Geographic location integration

### Resource Management

- Add and locate emergency resources
- Filter by type and location
- Distance-based search
- Map integration (UI ready)

### Social Media Monitoring

- Real-time social media feed
- Priority-based alert system
- Platform filtering
- Engagement metrics

### Verification System

- AI-powered image verification
- Batch processing capabilities
- Verification history
- Manual verification tools

## Customization

### Theming

The app supports light/dark themes with system preference detection. Theme settings are found in:

- src/contexts/ThemeContext.js
- tailwind.config.js
- src/App.css

### Styling

The project uses Tailwind CSS with custom design tokens:

- Primary colors: Blue palette
- Custom animations and transitions
- Responsive breakpoints
- Dark mode variants

### API Integration

API endpoints are configured in src/services/api.js. Update the base URL and endpoints as needed for your backend.

## Deployment

1. _Build for production_
   bash
   npm run build

2. _Deploy the build folder_ to your hosting service (Vercel, Netlify, etc.)

3. _Configure environment variables_ in your hosting service

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Check the documentation
- Open an issue on GitHub
- Contact the development team
