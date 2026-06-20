from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# load our trained model
model = SentenceTransformer("models/skill_matcher")

def match_score(job_description: str, user_skills: list[str]) -> dict:
    # encode job description
    job_embedding = model.encode([job_description])
    
    # encode each skill
    skill_embeddings = model.encode(user_skills)
    
    # calculate similarity between job and each skill
    scores = cosine_similarity(job_embedding, skill_embeddings)[0]
    
    # pair skills with scores
    skill_scores = {skill: round(float(score) * 100, 2) for skill, score in zip(user_skills, scores)}
    
    # overall match score = average of top 5 skills
    top_scores = sorted(scores, reverse=True)[:5]
    overall_score = round(float(np.mean(top_scores)) * 100, 2)
    
    return {
        "overall_score": overall_score,
        "skill_scores": skill_scores
    }

# test it
job = """
We are looking for a React developer with Node.js experience.
Must know MongoDB, REST APIs and have experience with Docker.
Python knowledge is a plus.
"""

user_skills = ["React", "Node.js", "MongoDB", "Python", "Java", "Unity"]

result = match_score(job, user_skills)
print("Overall match score:", result["overall_score"])
print("\nSkill scores:")
for skill, score in sorted(result["skill_scores"].items(), key=lambda x: x[1], reverse=True):
    print(f"  {skill}: {score}%")