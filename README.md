# Employee Monitoring System

A comprehensive employee monitoring and time tracking solution built with FastAPI, SQLModel, and React.

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Time Tracking**: Track time spent on projects and tasks
- **Project Management**: Create and manage projects and tasks
- **Activity Monitoring**: Monitor user activities and productivity
- **Reporting & Analytics**: Generate detailed reports and analytics
- **Real-time Updates**: Get live updates on time entries and activities

## Tech Stack

- **Backend**:
  - Python 3.11+
  - FastAPI
  - SQLModel (SQLAlchemy + Pydantic)
  - PostgreSQL / SQLite
  - Redis (for caching and real-time updates)
  - JWT Authentication

- **Frontend**:
  - React
  - Redux Toolkit
  - Material-UI
  - Chart.js (for analytics)
  - WebSockets (for real-time updates)

## Prerequisites

- Python 3.11+
- Node.js 16+
- PostgreSQL (optional, SQLite is used by default)
- Redis (for caching and real-time features)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/employee-monitoring-system.git
   cd employee-monitoring-system
   ```

2. **Set up Python environment**
   ```bash
   # Create a virtual environment
   python -m venv venv
   
   # Activate the virtual environment
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example .env file
   cp .env.example .env
   
   # Edit the .env file with your configuration
   # nano .env
   ```

4. **Initialize the database**
   ```bash
   # Create database tables
   python init_enhanced_db.py
   ```

5. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit the .env file with your backend API URL
   npm run dev
   ```

6. **Run the backend server**
   ```bash
   # In the project root directory
   uvicorn main:app --reload
   ```

The application will be available at `http://localhost:3000` (frontend) and the API at `http://localhost:8000`.

## API Documentation

Once the application is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## Development

### Running Tests

```bash
# Run backend tests
pytest

# Run frontend tests
cd frontend
npm test
```

### Code Style

This project uses:
- Black for Python code formatting
- isort for import sorting
- ESLint and Prettier for JavaScript/TypeScript

```bash
# Format Python code
black .
isort .

# Format frontend code
cd frontend
npm run format
```

## Deployment

For production deployment, it's recommended to use:
- Gunicorn or Uvicorn with multiple workers
- Nginx as a reverse proxy
- PostgreSQL for the database
- Redis for caching and real-time features
- Docker and Docker Compose for containerization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
