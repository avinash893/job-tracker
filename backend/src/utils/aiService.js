import axios from "axios";
import dotenv from "dotenv";

const analyzeJob = async (jobUrl, userSkills) => {
  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/analyze`,
      {
        jobUrl,
        userSkills,
      },
    );
    return response.data;
  } catch (error) {
    console.error("AI service error:", error.message);
    console.error("Full error:", error.response?.data || error.code);
    return null;
  }
};

export default analyzeJob;
