from backend.main import app

# Vercel needs the app instance to be available at the module level
# When Vercel handles the request to /api/agent/stream, it will route it through this FastAPI instance.
