import pandas as pd

df = pd.read_csv(r"C:\Users\avina\Desktop\LernWD\ai-service\data\postings.csv")

# see actual content
print("DESCRIPTION SAMPLE:")
print(df['description'].iloc[0])
print("\nSKILLS DESC SAMPLE:")
print(df['skills_desc'].iloc[0])
print("\nTITLE SAMPLE:")
print(df['title'].iloc[0])

# check how many rows have skills_desc
print("\nRows with skills_desc:", df['skills_desc'].notna().sum())