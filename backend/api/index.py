import sys
from pathlib import Path

# Add the backend directory to Python path so 'src' module can be found
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.main import app
