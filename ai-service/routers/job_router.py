from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.scraper import scrape_job
from services.matcher import extract_keywords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re

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

def calculate_match_scores(text: str, user_skills: list[str]) -> tuple[float, dict[str, float]]:
    """Calculate job match scores using TF-IDF and keyword presence."""
    if not user_skills:
        return 0.0, {}
        
    cleaned_skills = [s.strip().lower() for s in user_skills]
    
    # 1. TF-IDF Cosine Similarity
    corpus = [text.lower()] + cleaned_skills
    # Using a token pattern that preserves symbols common in tech skills (e.g. C++, C#, .NET)
    vectorizer = TfidfVectorizer(token_pattern=r'(?u)\b[\w\.\+#\-]+\b', stop_words='english')
    
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        job_vec = tfidf_matrix[0:1]
        skill_vecs = tfidf_matrix[1:]
        cosine_scores = cosine_similarity(job_vec, skill_vecs)[0]
    except Exception:
        # Fallback to zero overlap if TF-IDF fails
        cosine_scores = np.zeros(len(cleaned_skills))
        
    skill_scores = {}
    scores_list = []
    text_words = set(re.findall(r'\b[\w\.\+#\-]+\b', text.lower()))
    
    for i, skill in enumerate(cleaned_skills):
        base_score = float(cosine_scores[i]) * 100
        
        # Word-boundary detection
        is_present = False
        if " " in skill:
            is_present = skill in text.lower()
        else:
            is_present = skill in text_words
            
        if is_present:
            # Grant a strong baseline score if the skill is explicitly mentioned
            score = max(80.0, base_score + 60.0)
            score = min(100.0, score)
        else:
            # Scale down if skill is completely missing
            score = base_score * 0.7
            score = max(15.0, score)  # Minimum default overlap
            score = min(45.0, score)
            
        skill_scores[user_skills[i]] = round(score, 2)
        scores_list.append(score)
        
    # Calculate overall match score (average of top 5 match rates)
    top_scores = sorted(scores_list, reverse=True)[:5]
    overall_score = round(float(np.mean(top_scores)) if top_scores else 0.0, 2)
    
    return overall_score, skill_scores

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_job(request: AnalyzeRequest):
    scrape_result = scrape_job(request.jobUrl)

    text = scrape_result["text"]
    if not text:
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

    overall_score, skill_scores = calculate_match_scores(text, request.userSkills)

    return AnalyzeResponse(
        keywords=keywords,
        matchScore=overall_score,
        skillScores=skill_scores,
        company=scrape_result["company"],
        role=scrape_result["role"]
    )