# Activity Tracker - Frontend

A professional activity tracking application with user and admin roles, built with React, Redux, and Material-UI.

## Features

- User authentication (login/signup)
- Track application usage time
- View personal activity statistics
- Admin dashboard with user activity overview
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Backend API server (see backend setup)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd activity-tracker/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from create-react-app

## Project Structure

```
src/
  ├── app/                  # Redux store configuration
  ├── components/           # Reusable UI components
  ├── features/             # Redux feature slices
  │   ├── auth/            # Authentication logic
  │   └── activity/        # Activity tracking logic
  ├── pages/               # Page components
  │   ├── admin/           # Admin pages
  │   ├── Dashboard.js     # User dashboard
  │   ├── Login.js         # Login page
  │   └── Signup.js        # Signup page
  ├── App.js               # Main application component
  └── index.js             # Application entry point
```

## Backend Integration

This frontend is designed to work with the Activity Tracker backend API. Make sure the backend server is running and properly configured.

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
