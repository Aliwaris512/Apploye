# Activity Tracker - Frontend

A modern, responsive web application for tracking team activities, time tracking, project management, and payroll processing.

## Features

- ✅ User authentication (login, signup, password reset)
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ Dashboard with activity overview
- ✅ Time tracking and timesheet management
- ✅ Project and task management
- ✅ Team management
- ✅ Reporting and analytics
- ✅ Payroll processing
- ✅ User profile and settings

## Tech Stack

- ⚛️ React 18
- 🎨 Material-UI v5
- 🔄 Redux Toolkit with Redux Persist
- 🚀 Vite
- 📊 Recharts for data visualization
- 📅 Date-fns for date handling
- 🎭 Formik & Yup for form handling
- 📱 Fully responsive design

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Backend API server (see backend repository)

## Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/activity-tracker.git
   cd activity-tracker/frontend-vite
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Update the values as needed

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

## Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build
- `lint` - Run ESLint
- `format` - Format code with Prettier

## Project Structure

```
src/
├── api/               # API service functions
├── components/        # Reusable UI components
│   ├── common/        # Common components (buttons, modals, etc.)
│   ├── layout/        # Layout components (header, sidebar, etc.)
│   └── routing/       # Route-related components
├── features/          # Feature modules
│   ├── auth/          # Authentication
│   ├── projects/      # Project management
│   ├── tasks/         # Task management
│   ├── timesheet/     # Time tracking
│   ├── payroll/       # Payroll processing
│   └── activity/      # Activity tracking
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   └── ...            # Other pages
├── store/             # Redux store configuration
└── utils/             # Utility functions
```

## Environment Variables

See `.env.example` for all available environment variables.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
