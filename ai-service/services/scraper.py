import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re
import os
import json

def extract_metadata_from_url(url: str) -> dict:
    """Fallback parser to extract company and role from URL patterns across major platforms."""
    company = "Unknown Company"
    role = "Job Position"
    try:
        parsed_url = urlparse(url)
        path = parsed_url.path.strip("/")
        parts = [p for p in path.split("/") if p]
        
        if not parts:
            return {"company": company, "role": role}

        netloc = parsed_url.netloc.lower()
        slug = parts[-1]
        slug_clean = slug.replace("-", " ").replace("_", " ").strip()
        
        # 1. Greenhouse (e.g., boards.greenhouse.io/{company}/jobs/{id} or /{company})
        if "greenhouse.io" in netloc and len(parts) >= 1:
            company = parts[0].replace("-", " ").title()
            
        # 2. Lever (e.g., jobs.lever.co/{company}/{jobId} or /{company})
        elif "lever.co" in netloc and len(parts) >= 1:
            company = parts[0].replace("-", " ").title()
            
        # 3. Naukri (e.g., job-listings-react-developer-google-noida-1234)
        elif "naukri.com" in netloc:
            if slug_clean.startswith("job listings"):
                slug_clean = slug_clean[12:].strip()
            slug_parts = [s for s in slug_clean.split(" ") if s]
            if len(slug_parts) >= 3:
                if slug_parts[-1].isdigit():
                    slug_parts = slug_parts[:-1]
                if len(slug_parts) >= 3:
                    company = slug_parts[-2].title()
                    role = " ".join(slug_parts[:-2]).title()
                    
        # 4. LinkedIn (e.g., senior-developer-at-google-1234 or /jobs/view/...)
        elif "linkedin.com" in netloc:
            if " at " in slug_clean:
                slug_parts = slug_clean.split(" at ")
                role = slug_parts[0].strip().title()
                company_part = re.sub(r'\s*\d+$', '', slug_parts[1].strip()).strip()
                company = company_part.title()
            elif len(parts) >= 3 and parts[1] == "view":
                # Check preceding path parts if available
                slug_clean_words = re.sub(r'\d+', '', slug_clean).strip()
                if slug_clean_words:
                    role = slug_clean_words.title()
                    
        # 5. Indeed (e.g., /cmp/{company}/jobs/... or /viewjob?jk=...)
        elif "indeed.com" in netloc:
            if "cmp" in parts:
                idx = parts.index("cmp")
                if idx + 1 < len(parts):
                    company = parts[idx + 1].replace("-", " ").title()
                    
        # 6. Generic pattern matching
        else:
            if " at " in slug_clean:
                slug_parts = slug_clean.split(" at ")
                role = slug_parts[0].strip().title()
                company = slug_parts[1].strip().title()
            elif " hiring " in slug_clean:
                slug_parts = slug_clean.split(" hiring ")
                company = slug_parts[0].strip().title()
                role = slug_parts[1].strip().title()
    except Exception:
        pass
        
    return {"company": company, "role": role}


def parse_title_string(title_text: str) -> tuple[str, str]:
    """Extract role and company from page title string."""
    role = ""
    company = ""
    
    # Remove job board suffixes
    cleaned = re.sub(
        r'\b(linkedin|indeed|naukri|glassdoor|simplyhired|monster|ziprecruiter|lever|greenhouse|workday)\b.*$',
        '',
        title_text,
        flags=re.IGNORECASE
    )
    cleaned = cleaned.strip(" -|/\\:,•")
    
    if " at " in cleaned:
        parts = cleaned.split(" at ")
        role = parts[0].strip().title()
        company = parts[1].strip().split("-")[0].split("|")[0].split("/")[0].strip().title()
    elif " hiring " in cleaned:
        parts = cleaned.split(" hiring ")
        company = parts[0].strip().title()
        role = parts[1].strip().split("-")[0].split("|")[0].split("/")[0].strip().title()
    elif " - " in cleaned:
        parts = cleaned.split(" - ")
        role = parts[0].strip().title()
        company = parts[1].strip().title()
    elif " | " in cleaned:
        parts = cleaned.split(" | ")
        role = parts[0].strip().title()
        company = parts[1].strip().title()
    elif cleaned:
        role = cleaned.title()
        
    return company, role


def fetch_via_jina(url: str) -> tuple[str, str, str]:
    """Fetch website via Jina AI Reader to bypass Cloudflare and render JavaScript."""
    try:
        jina_url = f"https://r.jina.ai/{url}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/plain, text/markdown"
        }
        res = requests.get(jina_url, headers=headers, timeout=12)
        if res.status_code == 200 and len(res.text) > 100:
            text = res.text
            
            # Extract Title from Jina header (Title: ...)
            company = ""
            role = ""
            title_match = re.search(r'^Title:\s*(.+)$', text, re.MULTILINE)
            if title_match:
                extracted_title = title_match.group(1).strip()
                company, role = parse_title_string(extracted_title)
                
            # Clean markdown formatting
            cleaned_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
            cleaned_text = re.sub(r'[#*_`~>]+', ' ', cleaned_text)
            cleaned_text = " ".join(cleaned_text.split())
            
            return cleaned_text, company, role
    except Exception:
        pass
    return "", "", ""


def try_gemini_extract(text: str, current_company: str, current_role: str) -> tuple[str, str]:
    """Optionally use Gemini API key to refine company and role if available."""
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("PS_GEMINIAPIKEY")
    if not api_key or (current_company != "Unknown Company" and current_role != "Job Position"):
        return current_company, current_role
        
    try:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={api_key}"
        snippet = text[:2000]
        prompt = (
            f"Analyze this job posting excerpt and return JSON with keys 'company' and 'role'. "
            f"Only return valid JSON: {snippet}"
        )
        res = requests.post(endpoint, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=6)
        if res.status_code == 200:
            content = res.json()["candidates"][0]["content"]["parts"][0]["text"]
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
                c = data.get("company", "").strip()
                r = data.get("role", "").strip()
                return c or current_company, r or current_role
    except Exception:
        pass
    return current_company, current_role


def scrape_job(url: str) -> dict:
    """Robust multi-layer job scraper with JSON-LD, meta tags, Jina reader, and URL heuristics."""
    # 1. Baseline metadata from URL pattern
    url_metadata = extract_metadata_from_url(url)
    company = url_metadata["company"]
    role = url_metadata["role"]
    cleaned_text = ""

    # 2. Try direct HTML fetch
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.google.com/"
        }
        response = requests.get(url, headers=headers, timeout=8)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            
            # JSON-LD Schema (JobPosting)
            schema_tags = soup.find_all("script", type="application/ld+json")
            for tag in schema_tags:
                try:
                    data = json.loads(tag.string)
                    items = data if isinstance(data, list) else data.get("@graph", [data]) if isinstance(data, dict) else []
                    for item in items:
                        if isinstance(item, dict) and item.get("@type") == "JobPosting":
                            if "hiringOrganization" in item:
                                org = item["hiringOrganization"]
                                company_name = org.get("name") if isinstance(org, dict) else str(org)
                                if company_name:
                                    company = company_name.strip().title()
                            if "title" in item:
                                role = item["title"].strip().title()
                            break
                except Exception:
                    pass
                    
            # OpenGraph and Meta tags fallback
            if company == "Unknown Company" or role == "Job Position":
                og_title = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "twitter:title"})
                og_site = soup.find("meta", property="og:site_name")
                if og_title and og_title.get("content"):
                    c, r = parse_title_string(og_title["content"].strip())
                    if c: company = c
                    if r: role = r
                if og_site and og_site.get("content") and company == "Unknown Company":
                    company = og_site["content"].strip().title()
                    
            # Page Title fallback
            if company == "Unknown Company" or role == "Job Position":
                title_tag = soup.find("title")
                if title_tag and title_tag.string:
                    c, r = parse_title_string(title_tag.string.strip())
                    if c and company == "Unknown Company": company = c
                    if r and role == "Job Position": role = r
                    
            # Clean visible page text
            for tag in soup(["script", "style", "header", "footer", "nav", "svg", "noscript"]):
                tag.decompose()
            text = soup.get_text(separator=" ")
            cleaned_text = " ".join(text.split())
    except Exception:
        pass

    # 3. Fallback to Jina AI Reader if direct scrape was blocked or returned insufficient text
    if not cleaned_text or len(cleaned_text) < 150:
        jina_text, jina_company, jina_role = fetch_via_jina(url)
        if jina_text:
            cleaned_text = jina_text
            if jina_company and company == "Unknown Company":
                company = jina_company
            if jina_role and role == "Job Position":
                role = jina_role

    # 4. Try Gemini refinement if available
    company, role = try_gemini_extract(cleaned_text, company, role)

    return {
        "text": cleaned_text,
        "company": company or "Unknown Company",
        "role": role or "Job Position"
    }
