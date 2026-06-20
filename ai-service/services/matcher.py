import re

SKILL_KEYWORDS = [
    # languages
    "python", "javascript", "typescript", "java", "c", "c++", "c#",
    "go", "rust", "swift", "kotlin", "ruby", "php", "scala", "r",
    "matlab", "bash", "shell", "perl", "dart",

    # frontend
    "react", "angular", "vue", "nextjs", "nuxtjs", "svelte",
    "html", "css", "sass", "tailwind", "bootstrap", "jquery",
    "webpack", "vite", "redux", "zustand", "graphql",

    # backend
    "node", "nodejs", "express", "fastapi", "django", "flask",
    "spring", "springboot", "laravel", "rails", "aspnet",
    "rest", "restful", "microservices", "grpc", "websocket",

    # databases
    "mongodb", "mongoose", "sql", "mysql", "postgresql", "sqlite",
    "redis", "cassandra", "dynamodb", "firebase", "supabase",
    "elasticsearch", "neo4j", "oracle",

    # devops / cloud
    "docker", "kubernetes", "aws", "azure", "gcp", "linux",
    "nginx", "apache", "ci/cd", "jenkins", "github actions",
    "terraform", "ansible", "prometheus", "grafana",

    # mobile
    "flutter", "react native", "android", "ios",

    # AI / ML
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas",
    "numpy", "opencv", "huggingface", "langchain", "openai",

    # game dev
    "unity", "unreal", "godot", "opengl", "vulkan",
    "directx", "webgl", "threejs", "blender", "maya",
    "shader", "hlsl", "glsl", "game design",
    "multiplayer", "photon", "steamworks", "playfab",

    # tools
    "git", "github", "gitlab", "bitbucket", "jira", "figma",
    "postman", "vim", "agile", "scrum",

    # concepts
    "data structures", "algorithms", "system design", "oop",
    "functional programming", "tdd", "solid", "design patterns",
]


def extract_keywords(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for skill in SKILL_KEYWORDS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found