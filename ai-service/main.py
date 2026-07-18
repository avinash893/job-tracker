from fastapi import FastAPI
from dotenv import load_dotenv
from routers.job_router import router as job_router
from routers.extractor_router import router as extractor_router

load_dotenv()

app = FastAPI(
    title="Job Tracker AI Service",
    description="Scrapes job postings and matches skills",
    version="1.0.0"
)

# mount routers
app.include_router(job_router, prefix="/api")
app.include_router(extractor_router, prefix="/api")

# health check
@app.get("/")
def health_check():
    return {"status": "AI service is running"}