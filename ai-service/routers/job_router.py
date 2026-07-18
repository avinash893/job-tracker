from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.scraper import scrape_job
from services.matcher import extract_keywords
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

import os
import torch
torch.set_num_threads(1)
torch.set_num_interop_threads(1)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(BASE_DIR, "models", "skill_matcher")

if os.path.exists(model_path):
    model = SentenceTransformer(model_path)
else:
    # Fallback to downloading model weights from Hugging Face Hub
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

router = APIRouter()

class AnalyzeRequest(BaseModel):
    jobUrl: str
    userSkills: list[str]

class AnalyzeResponse(BaseModel):
    keywords: list[str]
    matchScore: float
    skillScores: dict[str, float]
    company: str
    role: str

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_job(request: AnalyzeRequest):
    scrape_result = scrape_job(request.jobUrl)

    text = scrape_result["text"]
    if not text:
        # Bypass Cloudflare blocks by returning a valid fallback response
        # carrying the URL-parsed metadata instead of throwing a 400 error.
        return AnalyzeResponse(
            keywords=[],
            matchScore=0.0,
            skillScores={},
            company=scrape_result["company"],
            role=scrape_result["role"]
        )

    keywords = extract_keywords(text)

    if not request.userSkills:
        raise HTTPException(status_code=400, detail="No user skills provided")

    job_embedding = model.encode([text[:512]])
    skill_embeddings = model.encode(request.userSkills)

    scores = cosine_similarity(job_embedding, skill_embeddings)[0]

    skill_scores = {
        skill: round(float(score) * 100, 2)
        for skill, score in zip(request.userSkills, scores)
    }

    top_scores = sorted(scores, reverse=True)[:5]
    overall_score = round(float(np.mean(top_scores)) * 100, 2)

    return AnalyzeResponse(
        keywords=keywords,
        matchScore=overall_score,
        skillScores=skill_scores,
        company=scrape_result["company"],
        role=scrape_result["role"]
    )