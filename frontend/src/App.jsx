import { useState, useRef, useEffect } from 'react';
import ResumeDashboard from './ResumeDashboard'; // Import the dashboard component

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [matchScore, setMatchScore] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [missingSkills, setMissingSkills] = useState([]);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [jobSkills, setJobSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisTime, setAnalysisTime] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const fileInputRef = useRef(null);

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setStatus("");
      setError(false);
    } else if (file) {
      setStatus("⚠️ Please upload a PDF file only.");
      setError(true);
      setResumeFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleJDChange = (e) => {
    setJobDescription(e.target.value);
    if (status && error) {
      setStatus("");
      setError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked!");
  
    if (!resumeFile || !jobDescription) {
      setStatus("⚠️ Please upload a resume and enter a job description.");
      setMatchScore(null);
      setMissingSkills([]);
      setResumeSkills([]);
      setJobSkills([]);
      setError(true);
      setShowDashboard(false);
      return;
    }
    
    setIsLoading(true);
    setStatus("⏳ Analyzing resume...");
    setError(false);
    setShowDashboard(false);
    
    // Record start time for analysis
    const startTime = new Date();
  
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);
  
    try {
      console.log("Sending POST request to backend...");
      console.log("Resume file size:", resumeFile.size, "bytes");
      console.log("JD length:", jobDescription.length, "characters");
  
      // Define the backend URL - can be changed based on environment
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      
      const response = await fetch(`${backendUrl}/upload`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - it will be set automatically with boundary
      });
  
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Result:", result);
      
      // Calculate analysis time
      const endTime = new Date();
      const timeInSeconds = ((endTime - startTime) / 1000).toFixed(1);
      setAnalysisTime(timeInSeconds);
  
      if (result.match_score !== undefined) {
        setMatchScore(result.match_score);
        setStatus("✅ Resume successfully analyzed!");
        setError(false);
  
        // Set resume and job skills
        setResumeSkills(result.resume_skills || []);
        setJobSkills(result.job_skills || []);
        setMissingSkills(result.missing_skills || []);
        
        // Show dashboard after successful analysis
        setShowDashboard(true);
      } else {
        setStatus(result.error || "Something went wrong. Please try again!");
        setMatchScore(null);
        setMissingSkills([]);
        setResumeSkills([]);
        setJobSkills([]);
        setError(true);
        setShowDashboard(false);
      }
    } catch (error) {
      console.error("Error during request:", error);
      setStatus(`❌ Error: ${error.message || "Failed to connect to backend"}`);
      setMatchScore(null);
      setMissingSkills([]);
      setResumeSkills([]);
      setJobSkills([]);
      setError(true);
      setShowDashboard(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setResumeFile(null);
    setJobDescription("");
    setStatus("");
    setMatchScore(null);
    setMissingSkills([]);
    setResumeSkills([]);
    setJobSkills([]);
    setError(false);
    setAnalysisTime(null);
    setShowDashboard(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-500";
    return "text-red-600";
  };

  const getScoreMessage = (score) => {
    if (score >= 70) return "Great match!";
    if (score >= 40) return "Potential match";
    return "Not a strong match";
  };

  const getMatchEmoji = (score) => {
    if (score >= 70) return "🎯";
    if (score >= 40) return "👍";
    return "⚠️";
  };

  // Calculate percentage of common skills
  const commonSkillsCount = resumeSkills.filter(skill => 
    jobSkills.includes(skill)).length;
  
  const commonSkillsPercent = jobSkills.length ? 
    Math.round((commonSkillsCount / jobSkills.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 flex flex-col items-center justify-between p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col space-y-6"
        >
          <h1 className="text-3xl font-bold text-pink-700 text-center">
            Resume Screening System
          </h1>

          <div>
            <label className="block mb-2 text-pink-700 font-semibold">Upload Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleResumeUpload}
              className="border border-gray-300 p-2 rounded-md w-full"
              ref={fileInputRef}
            />
            {resumeFile && (
              <p className="mt-1 text-sm text-green-600">
                Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-pink-700 font-semibold">Paste Job Description</label>
            <textarea
              value={jobDescription}
              onChange={handleJDChange}
              rows="5"
              placeholder="Enter job description here..."
              className="border border-gray-300 p-2 rounded-md w-full"
            />
            {jobDescription && (
              <p className="mt-1 text-sm text-green-600">
                {jobDescription.length} characters entered
              </p>
            )}
          </div>

          <div className="flex justify-between items-center space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-xl w-full ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className={`bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-xl w-full ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              Reset
            </button>
          </div>
        </form>

        {status && (
          <div className="mt-6 p-4 bg-white rounded-xl shadow-md text-center w-full max-w-md">
            <p className={`${error ? 'text-red-500' : 'text-pink-700'} font-semibold`}>{status}</p>
            
            {matchScore !== null && (
              <div className="mt-2">
                <p className={`text-3xl font-bold ${getScoreColor(matchScore)}`}>
                  {getMatchEmoji(matchScore)} Match Score: {matchScore}%
                </p>
                <p className={`text-sm mt-1 ${getScoreColor(matchScore)}`}>
                  {getScoreMessage(matchScore)}
                </p>
                {analysisTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    Analysis completed in {analysisTime} seconds
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Show Dashboard */}
        {showDashboard && (
          <div className="mt-6 w-full">
            <ResumeDashboard 
              matchScore={matchScore}
              resumeSkills={resumeSkills}
              jobSkills={jobSkills}
              missingSkills={missingSkills}
            />
          </div>
        )}

        {!showDashboard && matchScore !== null && (
          <>
            {/* Progress bar */}
            <div className="mt-4 p-4 bg-white rounded-xl shadow-md w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Skills Match</span>
                <span className="text-sm font-medium text-gray-700">{commonSkillsPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${getScoreColor(commonSkillsPercent)}`} 
                  style={{ width: `${commonSkillsPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Skills Lists */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {/* Display Resume Skills */}
              {resumeSkills.length > 0 && (
                <div className="p-4 bg-white rounded-xl shadow-md">
                  <p className="text-pink-700 font-semibold text-center mb-2">Resume Skills ({resumeSkills.length})</p>
                  <div className="max-h-60 overflow-y-auto">
                    <ul className="text-gray-700 text-sm list-disc pl-5">
                      {resumeSkills.map((skill, index) => {
                        const isMatch = jobSkills.includes(skill);
                        return (
                          <li key={index} className={`mb-1 ${isMatch ? 'text-green-600 font-medium' : ''}`}>
                            {skill} {isMatch && '✓'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* Display Job Description Skills */}
              {jobSkills.length > 0 && (
                <div className="p-4 bg-white rounded-xl shadow-md">
                  <p className="text-pink-700 font-semibold text-center mb-2">Job Skills ({jobSkills.length})</p>
                  <div className="max-h-60 overflow-y-auto">
                    <ul className="text-gray-700 text-sm list-disc pl-5">
                      {jobSkills.map((skill, index) => {
                        const isMatch = resumeSkills.includes(skill);
                        return (
                          <li key={index} className={`mb-1 ${isMatch ? 'text-green-600 font-medium' : ''}`}>
                            {skill} {isMatch && '✓'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* Display Missing Skills */}
              {missingSkills.length > 0 && (
                <div className="p-4 bg-white rounded-xl shadow-md">
                  <p className="text-pink-700 font-semibold text-center mb-2">Missing Skills ({missingSkills.length})</p>
                  <div className="max-h-60 overflow-y-auto">
                    <ul className="text-gray-700 text-sm list-disc pl-5">
                      {missingSkills.map((skill, index) => (
                        <li key={index} className="mb-1 text-red-500">{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Button to toggle between simple view and dashboard */}
        {matchScore !== null && (
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl"
          >
            {showDashboard ? "View Simple Analysis" : "View Interactive Dashboard"}
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-pink-700 font-semibold">
        © {new Date().getFullYear()} Harpreet Kaur. All rights reserved.
      </footer>
    </div>
  );
}

export default App;