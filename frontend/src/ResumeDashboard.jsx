import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const EnhancedDashboard = ({ 
  matchScore, 
  resumeSkills, 
  jobSkills, 
  missingSkills
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate matching skills and extra skills
  const matchingSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
  const extraSkills = resumeSkills.filter(skill => !jobSkills.includes(skill));

  // Data for pie chart
  const pieData = [
    { name: 'Matching', value: matchingSkills.length, color: '#10B981' }, // green
    { name: 'Missing', value: missingSkills.length, color: '#EF4444' },   // red
    { name: 'Extra', value: extraSkills.length, color: '#3B82F6' }       // blue
  ];

  // Colors for pie chart
  const COLORS = ['#10B981', '#EF4444', '#3B82F6'];

  // Color based on score
  const getScoreColor = (score) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-500";
    return "text-red-600";
  };

  // Tooltip component for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Group skills by category for skill analysis
  const skillCategories = {
    'Programming': ['python', 'java', 'javascript', 'c++', 'c#', 'typescript', 'go', 'rust', 'php', 'kotlin', 'swift'],
    'Web Dev': ['html', 'css', 'react', 'angular', 'vue', 'svelte', 'nextjs', 'express', 'django', 'flask', 'jquery', 'bootstrap', 'tailwind'],
    'Data & AI': ['pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'machine learning', 'deep learning', 'data science', 'big data', 'data mining', 'nlp'],
    'Databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'cassandra', 'dynamodb', 'firebase', 'neo4j'],
    'DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ci/cd', 'git', 'gitlab', 'github'],
    'Mobile': ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'mobile development'],
  };

  // Create the skill category data for bar chart
  const categoryData = Object.entries(skillCategories).map(([category, categorySkills]) => {
    const resumeMatches = resumeSkills.filter(skill => 
      categorySkills.some(catSkill => skill.includes(catSkill)));
    
    const jobMatches = jobSkills.filter(skill => 
      categorySkills.some(catSkill => skill.includes(catSkill)));
    
    // Updated calculation that caps the matchPercentage at 100%
    const matchPercentage = jobMatches.length > 0 
      ? Math.min(100, Math.round((resumeMatches.length / jobMatches.length) * 100))
      : 0;
    
    return {
      category,
      resumeCount: resumeMatches.length,
      jobCount: jobMatches.length,
      matchPercentage,
      resumeSkills: resumeMatches,
      jobSkills: jobMatches
    };
  }).filter(category => category.jobCount > 0 || category.resumeCount > 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Resume Analysis Dashboard</h2>

      {/* Match Score Display */}
      <div className="mb-6 text-center">
        <div className="flex justify-center items-center">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-5xl font-bold ${getScoreColor(matchScore)}`}>
                {matchScore}%
              </div>
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="8"
              />
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke={matchScore >= 70 ? "#10B981" : matchScore >= 40 ? "#FBBF24" : "#EF4444"} 
                strokeWidth="8"
                strokeDasharray={`${matchScore * 2.83} 283`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs - Removed "sections" tab */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'skills' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Skill Analysis
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'recommendations' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Recommendations
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {/* Overview Tab - Removed radar chart */}
        {activeTab === 'overview' && (
          <div className="flex justify-center">
            {/* Skills Pie Chart */}
            <div className="bg-gray-50 p-4 rounded-lg max-w-md">
              <h3 className="text-lg font-medium text-gray-700 mb-2 text-center">Skills Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center flex-wrap gap-4 mt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Matching ({matchingSkills.length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Missing ({missingSkills.length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Extra ({extraSkills.length})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Analysis Tab - Fixed rendering issues */}
        {activeTab === 'skills' && (
          <div>
            {/* Skill Categories Bar Chart */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">Skills by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="resumeCount" name="Your Skills" fill="#8884d8" />
                    <Bar dataKey="jobCount" name="Job Requirements" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryData.map((category) => (
                <div key={category.category} className="bg-gray-50 p-4 rounded-lg overflow-hidden">
                  <h4 className="text-md font-medium text-purple-700 mb-2">{category.category}</h4>
                  <div className="flex mb-1">
                    <div className="w-32 text-sm text-gray-600">Match:</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            category.matchPercentage >= 70 ? 'bg-green-500' : 
                            category.matchPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${category.matchPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-right">{category.matchPercentage}%</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <div className="text-sm font-medium text-purple-600 mb-1">Your Skills</div>
                      <ul className="text-xs text-gray-600 list-disc pl-4 max-h-24 overflow-y-auto">
                        {category.resumeSkills.length > 0 ? (
                          category.resumeSkills.map((skill, i) => (
                            <li key={i} className={category.jobSkills.includes(skill) ? "text-green-600" : ""}>
                              {skill} {category.jobSkills.includes(skill) && "✓"}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 italic">None found</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-purple-600 mb-1">Job Requirements</div>
                      <ul className="text-xs text-gray-600 list-disc pl-4 max-h-24 overflow-y-auto">
                        {category.jobSkills.length > 0 ? (
                          category.jobSkills.map((skill, i) => (
                            <li key={i} className={category.resumeSkills.includes(skill) ? "text-green-600" : ""}>
                              {skill} {category.resumeSkills.includes(skill) && "✓"}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 italic">None found</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Missing Critical Skills */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-700 mb-4">Key Missing Skills</h3>
              {missingSkills.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Consider adding these key skills to your resume to improve your match score:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {missingSkills.slice(0, 9).map((skill, index) => (
                      <div key={index} className="bg-white border border-red-200 rounded p-2 text-sm flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                  {missingSkills.length > 9 && (
                    <div className="mt-2 text-sm text-gray-500">
                      +{missingSkills.length - 9} more missing skills
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-green-600">Great job! You have all the required skills for this position.</p>
              )}
            </div>

            {/* General Recommendations */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-700 mb-4">Resume Improvement Tips</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <div className="text-purple-600 mr-2">•</div>
                  <div>
                    <strong>Highlight Matching Skills:</strong> Make sure your key skills that match the job description are prominently featured.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="text-purple-600 mr-2">•</div>
                  <div>
                    <strong>Use Keywords:</strong> Include industry-specific terminology that appears in the job description.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="text-purple-600 mr-2">•</div>
                  <div>
                    <strong>Quantify Achievements:</strong> Add metrics and numbers to demonstrate your impact.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="text-purple-600 mr-2">•</div>
                  <div>
                    <strong>Tailor Your Resume:</strong> Customize your resume for each application to better align with specific job requirements.
                  </div>
                </li>
                {matchScore < 70 && (
                  <li className="flex items-start">
                    <div className="text-purple-600 mr-2">•</div>
                    <div>
                      <strong>Consider Upskilling:</strong> Look into courses or certifications for the missing skills highlighted above.
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;