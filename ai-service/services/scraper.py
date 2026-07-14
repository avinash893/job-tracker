import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re

def extract_metadata_from_url(url: str) -> dict:
    """Fallback parser to extract company and role from URL slugs if scraping fails."""
    company = "Unknown Company"
    role = "Job Position"
    try:
        parsed_url = urlparse(url)
        path = parsed_url.path.strip("/")
        parts = [p for p in path.split("/") if p]
        
        if not parts:
            return {"company": company, "role": role}
            
        slug = parts[-1]
        slug_clean = slug.replace("-", " ").replace("_", " ").strip()
        
        # 1. Parse Naukri.com slugs: e.g., job-listings-react-developer-google-noida-1234
        if "naukri.com" in parsed_url.netloc:
            if slug_clean.startswith("job listings"):
                slug_clean = slug_clean[12:].strip()
            slug_parts = [s for s in slug_clean.split(" ") if s]
            
            if len(slug_parts) >= 3:
                # filter out trailing numbers/id
                if slug_parts[-1].isdigit():
                    slug_parts = slug_parts[:-1]
                # location is second-to-last, company is third-to-last
                if len(slug_parts) >= 3:
                    company = slug_parts[-2].title()
                    role = " ".join(slug_parts[:-2]).title()
                    
        # 2. Parse LinkedIn.com slugs: e.g., senior-developer-at-google-1234
        elif "linkedin.com" in parsed_url.netloc:
            if " at " in slug_clean:
                slug_parts = slug_clean.split(" at ")
                role = slug_parts[0].strip().title()
                company_part = slug_parts[1].strip()
                # strip trailing numeric id
                company_part = re.sub(r'\s*\d+$', '', company_part).strip()
                company = company_part.title()
                
        # 3. Generic fallback for other slugs containing "at" or "hiring"
        else:
            if " at " in slug_clean:
                slug_parts = slug_clean.split(" at ")
                role = slug_parts[0].strip().title()
                company = slug_parts[1].strip().title()
    except Exception:
        pass
        
    return {"company": company, "role": role}

def scrape_job(url: str) -> dict:
    """Fetch a URL and return a dict containing cleaned visible text, company, and role."""
    
    # Pre-parse URL slug for baseline metadata fallbacks
    url_metadata = extract_metadata_from_url(url)
    company = url_metadata["company"]
    role = url_metadata["role"]
    cleaned_text = ""

    try:
        # Standard headers to prevent blocking by some portals
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        # Only parse HTML if download succeeded
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            
            # 1. Try parsing JSON-LD schema (JobPosting standard)
            schema_tags = soup.find_all("script", type="application/ld+json")
            schema_parsed = False
            for tag in schema_tags:
                try:
                    import json
                    data = json.loads(tag.string)
                    if isinstance(data, dict) and data.get("@type") == "JobPosting":
                        if "hiringOrganization" in data:
                            org = data["hiringOrganization"]
                            if isinstance(org, dict) and "name" in org:
                                company = org["name"].strip().title()
                        if "title" in data:
                            role = data["title"].strip().title()
                        schema_parsed = True
                        break
                except Exception:
                    pass

            # 2. Parse Title tag if JSON-LD wasn't present or failed
            if not schema_parsed:
                title_tag = soup.find("title")
                if title_tag and title_tag.string:
                    title_text = title_tag.string.strip()
                    
                    # Remove job board suffixes (e.g., | LinkedIn, - Indeed)
                    title_clean = re.sub(
                        r'\b(linkedin|indeed|naukri|glassdoor|simplyhired|monster|ziprecruiter)\b.*$',
                        '',
                        title_text,
                        flags=re.IGNORECASE
                    )
                    title_clean = title_clean.strip(" -|/\\")
                    
                    if " at " in title_clean:
                        parts = title_clean.split(" at ")
                        role = parts[0].strip().title()
                        company = parts[1].strip().split("-")[0].split("|")[0].split("/")[0].strip().title()
                    elif " hiring " in title_clean:
                        parts = title_clean.split(" hiring ")
                        company = parts[0].strip().title()
                        role = parts[1].strip().split("-")[0].split("|")[0].split("/")[0].strip().title()
                    elif " - " in title_clean:
                        parts = title_clean.split(" - ")
                        role = parts[0].strip().title()
                        company = parts[1].strip().title()
            
            # 3. Clean page text for skill extraction
            for tag in soup(["script", "style", "header", "footer", "nav"]):
                tag.decompose()
            text = soup.get_text(separator=" ")
            cleaned_text = " ".join(text.split())
            
    except Exception:
        pass

    return {
        "text": cleaned_text,
        "company": company,
        "role": role
    }
