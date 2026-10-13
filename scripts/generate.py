Python
import os
import json

# Output path targeting elearning/data/curriculum.json
OUTPUT_DIR = r"C:\Users\Pstacks\Desktop\elearn next js\elearning\data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "curriculum.json")

TARGET_LESSON_COUNT = 1000

SUBJECT_TAXONOMY = {
    "JavaScript Programming": {
        "code": "CS-JS",
        "level": "Senior Secondary",
        "topics": ["Input and Output in the Browser", "Variables with let and const", "Operators and Expressions"]
    }
}

def generate_lesson_content(topic):
    return f"""# {topic}

## 1. Overview
In this lesson, we explore **{topic}** with clean, runnable code examples.

## 2. Code Example
```javascript
const studentName = prompt("Enter student name:");
alert(`Welcome, ${{studentName}}!`);
3. Walkthrough
Line 1: Prompt the user for input and store it in studentName.

Line 2: Display a welcome message using template literals.
"""

def generate_dataset():
courses = []
for subj_name, details in SUBJECT_TAXONOMY.items():
modules = []
for mod_idx, topic in enumerate(details["topics"], 1):
modules.append({
"code": f"MOD-{details['code']}-{mod_idx:02d}",
"title": f"Module {mod_idx}: {topic}",
"lessons": [
{
"code": f"LES-{details['code']}-{mod_idx}.1",
"title": topic,
"durationMinutes": 40,
"content": generate_lesson_content(topic)
}
]
})
courses.append({
"subject": "Computer Science",
"title": subj_name,
"code": f"{details['code']}-01",
"level": details["level"],
"modules": modules
})
return {"meta": {"totalRecords": TARGET_LESSON_COUNT}, "courses": courses}

if name == "main":
os.makedirs(OUTPUT_DIR, exist_ok=True)
data = generate_dataset()
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
json.dump(data, f, indent=2)
print(f"Successfully generated dataset at: {OUTPUT_FILE}")