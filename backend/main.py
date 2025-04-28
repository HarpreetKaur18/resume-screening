import spacy
import pdfplumber
import pytesseract
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO
import tempfile
import os
import shutil
import re

app = FastAPI()

# Load spaCy model for NLP processing
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model not found, download it
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# Allow frontend to call backend with improved CORS handling
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Common technical skills and tools to help identify skills more accurately
COMMON_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "c++", "c#", "ruby", "php", "swift", "golang", "kotlin",
    "typescript", "scala", "perl", "r", "rust", "haskell", "matlab", "julia", "dart", "sql",
    
    # Frameworks & Libraries
    "react", "angular", "vue", "django", "flask", "spring", "express", "laravel", "rails", "bootstrap",
    "jquery", "pandas", "tensorflow", "pytorch", "scikit-learn", "numpy", "matplotlib", "keras", "nextjs",
    "flutter", "electron", "svelte", "fastapi", "tailwind", "node.js", "nodejs",
    
    # Databases
    "mysql", "postgresql", "mongodb", "oracle", "sql server", "sqlite", "cassandra", "redis", "dynamodb",
    "firebase", "elasticsearch", "neo4j", "mariadb", "couchbase", "hbase",
    
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "jenkins", "terraform", "ansible",
    "chef", "puppet", "circleci", "travis", "github actions", "gitlab ci", "bitbucket pipelines", 
    "prometheus", "grafana", "datadog", "nginx", "apache",
    
    # Other Tech Skills
    "git", "svn", "mercurial", "rest", "graphql", "soap", "agile", "scrum", "kanban", "ci/cd",
    "machine learning", "deep learning", "data science", "big data", "data mining", "blockchain",
    "microservices", "serverless", "websocket", "oauth", "jwt", "saml", "ldap", "active directory",
    
    # Soft Skills (keeping only specific measurable skills)
    "public speaking", "technical writing", "data analysis", "project management", "team leadership",
    "requirements gathering", "ux research", "test automation", "stakeholder management"
}

# Add common acronyms and variations
ACRONYMS = {
    "ai": "artificial intelligence",
    "ml": "machine learning",
    "dl": "deep learning",
    "ds": "data science",
    "oop": "object oriented programming",
    "ui": "user interface",
    "ux": "user experience",
    "api": "application programming interface",
    "sdk": "software development kit",
    "saas": "software as a service",
    "paas": "platform as a service",
    "iaas": "infrastructure as a service",
    "dba": "database administrator",
    "devops": "development operations",
    "sre": "site reliability engineering",
    "tdd": "test driven development",
    "ci": "continuous integration",
    "cd": "continuous deployment",
    "qa": "quality assurance"
}

# Context terms - these aren't skills themselves but indicate nearby words might be skills
CONTEXT_TERMS = {
    "knowledge", "expertise", "proficiency", "experience", "skills",
    "responsibilities", "requirements", "familiar", "proficient", "competent",
    "background in", "capability", "capable of", "qualified in", "specialization"
}

# Expanded list of non-skill common words to filter out
COMMON_WORDS = {
    # General terms
    "use", "work", "year", "time", "new", "one", "two", "three", "experience", 
    "day", "week", "month", "set", "lot", "way", "support", "help", "create", 
    "build", "make", "high", "low", "good", "great", "job", "need", "role",
    
    # Job description general terms (not skills)
    "knowledge", "expertise", "proficiency", "responsibilities", "requirements",
    "experience", "familiar", "proficient", "ability", "skill", "skills",
    "understanding", "concepts", "qualification", "qualifications", "degree",
    "background", "professional", "candidate", "candidates", "position", 
    "strong", "excellent", "outstanding", "exceptional", "proven", "track",
    "record", "history", "demonstrated", "solid", "robust", "competent",
    
    # Additional filter terms
    "using", "working", "developing", "creating", "managing", "leading",
    "team", "member", "responsible", "responsibility", "resume", "cv",
    "application", "apply", "information", "company", "business", "industry",
    "solution", "services", "products", "client", "customer", "user",
    "various", "multiple", "several", "many", "few", "some", "all",
    "able", "capable", "required", "preferred", "desired", "ideal",
    "necessary", "mandatory", "optional", "plus", "bonus", "position",
    "employment", "career", "opportunity", "level", "entry", "senior",
    "junior", "mid", "lead", "years", "education", "bachelor", "master",
    "phd", "month", "week", "day", "hour", "deadline", "schedule", "task",
    "perform", "self", "motivated", "motivation", "enthusiasm", "enthusiastic",
    "passionate", "passion", "drive", "driven", "commitment", "committed",
    "looking", "searching", "seeking", "want", "wanted", "desire"
}

# Function to extract n-grams from text (for multi-word skills)
def extract_ngrams(text, n=3):
    words = re.findall(r'\b\w+\b', text.lower())
    ngrams = []
    for i in range(len(words) - n + 1):
        ngrams.append(' '.join(words[i:i+n]))
    for i in range(len(words) - (n-1) + 1):
        ngrams.append(' '.join(words[i:i+(n-1)]))
    for i in range(len(words)):
        ngrams.append(words[i])
    return ngrams

# Improved function to extract skills from text
def extract_skills_from_text(text):
    if not text or not isinstance(text, str):
        return []
    
    # Clean text
    text = text.lower()
    
    # Extract n-grams (for multi-word skills like "machine learning")
    all_potential_skills = set(extract_ngrams(text))
    
    # Find matches with our known skills list
    known_skills = set()
    for skill in all_potential_skills:
        if skill in COMMON_SKILLS and skill not in COMMON_WORDS:
            known_skills.add(skill)
        # Check for acronyms
        if skill in ACRONYMS and skill not in COMMON_WORDS:
            known_skills.add(skill)  # Add the acronym
            full_form = ACRONYMS[skill]
            if full_form not in COMMON_WORDS:
                known_skills.add(full_form)  # Add the full form
    
    # Use spaCy for additional skill extraction (especially proper nouns)
    doc = nlp(text)
    
    # Extract noun phrases and proper nouns that might be skills
    for token in doc:
        # Skip context terms and common words
        if token.text.lower() in CONTEXT_TERMS or token.text.lower() in COMMON_WORDS:
            continue
            
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and len(token.text) > 2:
            # Check if it has any "tech" words nearby (contextual relevance)
            has_tech_context = False
            
            for related_token in token.subtree:
                rel_token_text = related_token.text.lower()
                if (rel_token_text in ["software", "technology", "technical", 
                                     "programming", "development", "engineer",
                                     "developer", "code", "system", "database",
                                     "analysis", "design", "network"] or
                    rel_token_text in CONTEXT_TERMS):
                    has_tech_context = True
                    break
            
            if (has_tech_context or token.text.lower() in COMMON_SKILLS) and token.text.lower() not in COMMON_WORDS:
                known_skills.add(token.text.lower())
    
    # Look for specific patterns like "X years of Y experience"
    experience_matches = re.findall(r'\d+\+?\s+(?:years?|yrs?)(?:\s+of)?\s+(\w+(?:\s+\w+){0,2})\s+experience', text)
    for match in experience_matches:
        if len(match) > 2 and match.lower() not in COMMON_WORDS:
            known_skills.add(match.lower())
    
    # Remove any skills that are just substrings of other skills
    filtered_skills = set()
    for skill1 in known_skills:
        # Check if this skill is a substring of another, longer skill
        if not any(skill1 != skill2 and skill1 in skill2 and len(skill2.split()) > len(skill1.split()) 
                  for skill2 in known_skills):
            filtered_skills.add(skill1)
    
    # Final check against common words
    final_skills = [skill for skill in filtered_skills if skill not in COMMON_WORDS]
    
    # Return as sorted list
    return sorted(final_skills)

@app.get("/")
async def root():
    return {"message": "Resume Analyzer API is running"}

@app.post("/upload")
async def upload_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        print(f"Received job description: {job_description[:100]}...")
        print(f"Received resume file: {resume.filename}")
        
        # Save the uploaded file to a temporary file to ensure it can be opened multiple times
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            # Copy uploaded file to temporary file
            shutil.copyfileobj(resume.file, temp_file)
            temp_file_path = temp_file.name
        
        # Make sure file pointer is at the beginning
        resume.file.seek(0)
        
        # Read and extract resume text
        resume_text = ""
        try:
            with pdfplumber.open(temp_file_path) as pdf:
                for page in pdf.pages:
                    extracted_text = page.extract_text()
                    if extracted_text:
                        resume_text += extracted_text + "\n"
        except Exception as e:
            print(f"PDF extraction failed: {str(e)}")
        
        # If no text was extracted, use OCR
        if not resume_text.strip():
            print("Regular PDF extraction failed, using OCR...")
            try:
                resume_text = extract_text_from_pdf_with_ocr(temp_file_path)
            except Exception as ocr_error:
                print(f"OCR extraction failed: {str(ocr_error)}")
        
        # Delete temporary file
        os.unlink(temp_file_path)
        
        # If still no text, return error
        if not resume_text.strip():
            return JSONResponse(
                status_code=400, 
                content={"error": "Could not extract text from the provided PDF"}
            )
        
        print(f"Extracted resume text length: {len(resume_text)}")
        print(f"Sample text: {resume_text[:100]}...")
        
        # Extract skills from both the job description and resume
        jd_skills = extract_skills_from_text(job_description)
        resume_skills = extract_skills_from_text(resume_text)
        
        # Calculate similarity score (matching skills)
        common_skills = set(jd_skills).intersection(set(resume_skills))
        total_skills = set(jd_skills)
        
        # More sophisticated scoring system
        match_percentage = 0
        if total_skills:
            # Base score on matching percentage
            match_percentage = round(len(common_skills) / len(total_skills) * 100, 1)
            
            # Bonus points if resume has many additional skills (versatility)
            versatility_bonus = min(5, (len(resume_skills) - len(common_skills)) / 5)
            match_percentage += versatility_bonus
            
            # Cap at 100%
            match_percentage = min(100, match_percentage)
        
        # Get missing skills
        missing_skills = list(set(jd_skills) - set(resume_skills))
        
        # Sort missing skills by importance (frequency in job description)
        missing_skills.sort(key=lambda skill: job_description.lower().count(skill))
        missing_skills.reverse()  # Most important first
        
        return JSONResponse(content={
            "message": "Resume analyzed successfully",
            "match_score": match_percentage,
            "resume_skills": resume_skills,
            "job_skills": jd_skills,
            "missing_skills": missing_skills
        })

    except Exception as e:
        import traceback
        print(f"Error processing request: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": str(e)})

# OCR function to extract text from scanned PDFs (images)
def extract_text_from_pdf_with_ocr(pdf_path):
    try:
        from pdf2image import convert_from_path
        
        # Convert PDF to images
        images = convert_from_path(pdf_path)
        
        text = ""
        for image in images:
            # Extract text from each page
            page_text = pytesseract.image_to_string(image)
            text += page_text + "\n"
            
        return text
    except Exception as e:
        print(f"Error during OCR: {str(e)}")
        return ""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)