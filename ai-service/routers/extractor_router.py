from fastapi import APIRouter, UploadFile, File, HTTPException
import csv
import re
import os
from pydantic import BaseModel
import pypdf

router = APIRouter()

# Resolve path for skills_list.csv
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "skills_list.csv")

def load_skills_from_csv() -> list[str]:
    """Read technical skills list from CSV."""
    skills = []
    if os.path.exists(CSV_PATH):
        try:
            with open(CSV_PATH, mode='r', encoding='utf-8') as f:
                reader = csv.reader(f)
                header = next(reader, None)  # Skip CSV header
                for row in reader:
                    if row:
                        skills.append(row[0].strip())
        except Exception:
            pass
    return skills

class ExtractResponse(BaseModel):
    skills: list[str]

@router.post("/extract-skills", response_model=ExtractResponse)
async def extract_skills(file: UploadFile = File(...)):
    filename = file.filename.lower()
    text = ""
    
    try:
        # 1. Parse PDF or Text File
        if filename.endswith(".pdf"):
            pdf_reader = pypdf.PdfReader(file.file)
            page_texts = []
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    page_texts.append(page_text)
            text = " ".join(page_texts)
        elif filename.endswith(".txt"):
            contents = await file.read()
            text = contents.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file format. Please upload a PDF or TXT file."
            )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")

    if not text:
        return ExtractResponse(skills=[])
        
    text_lower = text.lower()
    skills_db = load_skills_from_csv()
    
    # Fallback to standard skills list if CSV is unreadable
    if not skills_db:
        skills_db = [
            "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
            "react", "angular", "vue", "nextjs", "node.js", "nodejs", "express",
            "fastapi", "django", "flask", "sql", "mongodb", "postgresql", "docker",
            "kubernetes", "aws", "gcp", "azure", "git", "github", "html", "css"
        ]
        
    found_skills = []
    # 2. Match skills using word boundaries \b
    for skill in skills_db:
        # re.escape is used to handle special characters (e.g. c++, c#) correctly
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)
            
    # De-duplicate matches
    unique_skills = []
    for s in found_skills:
        if s not in unique_skills:
            unique_skills.append(s)
            
    return ExtractResponse(skills=unique_skills)
