from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()  # reads .env file, like dotenv.config() in Node

app = FastAPI(
    title="Job Tracker AI Service",
    description="Scrapes job postings and matches skills",
    version="1.0.0"
)

# health check route
app.get("/")
def health_check():
    return {"status": "ok"}