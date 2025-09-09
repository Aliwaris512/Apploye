# Create a virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt

# Install additional development dependencies
pip install pytest pytest-asyncio httpx

# Initialize the database
python -m backend.init_db

Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "To start the development server, run: python backend/run.py" -ForegroundColor Cyan
