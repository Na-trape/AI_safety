from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging

logging.getLogger("transformers").setLevel(logging.ERROR)

app = FastAPI(
    title="Bias Detection API",
    description="API for detecting bias in language model responses",
    version="1.0.0"
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Import and include routers
from routers.bias import router as bias_router
app.include_router(bias_router)

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 