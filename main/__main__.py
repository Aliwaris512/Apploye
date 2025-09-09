import sys
from pathlib import Path
import uvicorn

# Add the project root to the Python path
project_root = str(Path(__file__).parent.parent)
sys.path.insert(0, project_root)

if __name__ == "__main__":
    # Run the FastAPI app directly
    uvicorn.run("main.main:app", host="0.0.0.0", port=9000, reload=True)
