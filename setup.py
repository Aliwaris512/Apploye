import os
import shutil
import sys
from pathlib import Path

def setup_environment():
    print("🚀 Setting up Activity Tracker Environment")
    print("=" * 50)
    
    # Create .env file if it doesn't exist
    env_file = ".env"
    if not os.path.exists(env_file):
        print("🔧 Creating .env file from .env.example")
        shutil.copy(".env.example", ".env")
        print("✅ Created .env file. Please update it with your configuration.")
    else:
        print("ℹ️  .env file already exists. Skipping creation.")
    
    # Create required directories
    print("\n📂 Creating required directories...")
    directories = [
        "screenshots",
        "screenshots/thumbnails",
        "logs"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Edit the .env file with your configuration")
    print("2. Install dependencies: pip install -r requirements.txt")
    print("3. Run database migrations: alembic upgrade head")
    print("4. Start the server: uvicorn main.main:app --host 0.0.0.0 --port 9000 --reload")
    print("\nHappy coding! 🚀")

if __name__ == "__main__":
    setup_environment()
