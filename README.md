# Resume Analyzer 📝 - AI-Powered Resume Screening

A full-stack project that uses Natural Language Processing (NLP) to extract skills from resumes, match them with a job description, calculate a match score, and generate smart recommendations.

---

## 🚀 Overview

- Extracts skills from PDF resumes using NLP (spaCy).
- Detects different resume sections like Education, Experience, Projects, Skills.
- Matches resume skills with job description skills.
- Calculates a match score with bonus points for versatility.
- Highlights matching, missing, and extra skills.
- Provides personalized resume improvement tips.
- Visualizes data using interactive charts (Pie Chart, Bar Chart).

---

## ✨ Features

- 📄 Resume PDF Text Extraction (pdfplumber + OCR fallback with Tesseract)
- 🤖 NLP-based Skill Extraction (spaCy)
- 📑 Resume Section Detection (regex-based)
- 📈 Match Score and Skill Gap Analysis
- 📊 Beautiful Dashboard (Pie Chart, Bar Chart)
- ⚡ Fast and Responsive Frontend
- 🌍 Ready for deployment (Vercel frontend + Render backend)

---

## 🛠 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Recharts
- **Backend:** FastAPI (Python), pdfplumber, pytesseract, spaCy NLP
- **Database:** None (analyzes on-the-fly, no storage)
- **Deployment:** Vercel (frontend), Render (backend)

---

## ⚙️ How to Run Locally

**Clone the repository**

git clone [https://github.com/your-username/resume-analyzer.git](https://github.com/HarpreetKaur18/resume-screening)

cd resume-analyzer

---

## Backend Setup

cd backend

python -m venv venv

source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload

---

## Frontend Setup

cd frontend

npm install

npm run dev

---

## 📸 Screenshots

---

## 🙋‍♀️ Made By

### Harpreet Kaur 💜

🔗 LinkedIn - www.linkedin.com/in/harpreet-kaur005

📫 Email - harpreetgill325@gmail.com

---

## 📄 License

This project is licensed under the MIT License.
