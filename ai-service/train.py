import pandas as pd
import torch
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader
import re


print("Loading data...")
df = pd.read_csv(r"C:\Users\avina\Desktop\LernWD\ai-service\data\postings.csv")

# use only rows with description
df = df[df['description'].notna()].reset_index(drop=True)
print(f"Total jobs: {len(df)}")

# ---- skill keywords ----
SKILLS = [
    "python", "javascript", "typescript", "react", "node", "nodejs",
    "express", "mongodb", "sql", "postgresql", "fastapi", "django",
    "flask", "docker", "kubernetes", "aws", "azure", "git", "linux",
    "rest", "graphql", "redis", "html", "css", "sass", "tailwind",
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "java", "c++", "c#", "go",
    "unity", "unreal", "flutter", "react native", "kotlin", "swift",
    "figma", "agile", "scrum", "system design", "algorithms",
]

def extract_skills_from_text(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for skill in SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found


print("Building training pairs...")
examples = []

import random
random.seed(42)

for i, row in df.iterrows():
    if i % 10000 == 0:
        print(f"Processing {i}/{len(df)}...")

    desc = str(row['description'])[:512]  # limit length
    found_skills = extract_skills_from_text(desc)

    if not found_skills:
        continue

    # positive pairs → skill found in description → score 1.0
    for skill in found_skills:
        examples.append(InputExample(
            texts=[desc, skill],
            label=1.0
        ))

    # negative pairs → random skill not in description → score 0.0
    negative_skills = [s for s in SKILLS if s not in found_skills]
    for skill in random.sample(negative_skills, min(3, len(negative_skills))):
        examples.append(InputExample(
            texts=[desc, skill],
            label=0.0
        ))

print(f"Total training examples: {len(examples)}")

# ---- load model ----
print("Loading base model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

# ---- train ----
print("Training...")
train_dataloader = DataLoader(examples, shuffle=True, batch_size=32)
train_loss = losses.CosineSimilarityLoss(model)

model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=2,
    warmup_steps=100,
    show_progress_bar=True,
)

# ---- save model ----
print("Saving model...")
model.save("models/skill_matcher")
print("Done! Model saved to models/skill_matcher")
# push to HuggingFace Hub
print("Pushing model to HuggingFace...")
model.push_to_hub("job-skill-matcher")
print("Done! Model pushed to HuggingFace Hub")