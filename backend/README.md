# Activity Tracker Backend

This is the backend service for the Activity Tracker application, built with FastAPI.

## Features

- User authentication with JWT
- Project management
- Task tracking
- Real-time notifications
- WebSocket support

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration.

4. Run the development server:
   ```bash
   uvicorn app:app --reload
   ```

5. Access the API documentation at http://localhost:8000/docs

## API Endpoints

- `POST /token` - Get access token
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/tasks` - List all tasks
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-as-read/{id}` - Mark notification as read
- `WS /ws/{client_id}` - WebSocket endpoint for real-time updates

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
```

## Deployment

For production deployment, consider using:
- Gunicorn with Uvicorn workers
- PostgreSQL database
- Redis for WebSocket message broker
- Nginx as reverse proxy

## License

MIT
