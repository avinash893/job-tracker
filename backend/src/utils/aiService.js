const analyzeJob = async (jobUrl, userSkills) => {
  try {
    const response = await fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobUrl, userSkills }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("AI service error:", error.message);
    return null; 
  }
};

export default analyzeJob;
