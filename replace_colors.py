import os
import re

replacements = {
    "#00f0ff": "#d4af37", # Cyan -> Gold
    "#7000ff": "#a8810b", # Purple -> Darker Gold
    "0,240,255": "212,175,55", # Cyan RGB
    "112,0,255": "168,129,11",  # Purple RGB
}

def replace_in_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts") or file.endswith(".css"):
                filepath = os.path.join(root, file)
                with open(filepath, "r") as f:
                    content = f.read()
                
                new_content = content
                for old, new in replacements.items():
                    new_content = re.sub(old, new, new_content, flags=re.IGNORECASE)
                
                if new_content != content:
                    with open(filepath, "w") as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

replace_in_files("src")
