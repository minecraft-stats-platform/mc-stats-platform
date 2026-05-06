import json
import os
import glob
import re

# Correct path to the world stats
stats_dir = r"C:\Users\Ansh\Downloads\world\players\stats"
data_js_path = r"C:\Users\Ansh\.gemini\antigravity\scratch\mc-stats\data.js"

NAME_MAP = {
    "2ef7d0fb-36a6-3bc5-8bb1-b417ebdcf928": "kunal2010",
    "00000000-0000-0000-0009-01f1257e20e3": ".ADAVYA2193",
    "93c37127-b993-3dbb-8005-865c96a3e98c": "Better_Ansh",
    "1cd7e03e-a260-35ca-88d7-e776003394c7": "Nitish_gamer45",
    "00000000-0000-0000-0009-01f39b4bb6e8": ".Harshisop13",
    "901bc959-6b58-31c0-8398-03f9238d689a": "GODXANKIT",
    "03bd9d1e-f370-3982-93c7-210d946f0ab9": "DEADLY_KUNAL",
    "41cae289-aab6-3d0e-ab10-4533b37cb8a0": "Harsh",
    "00000000-0000-0000-0009-01f99c138e25": ".Ansh Gamer1988",
    "aa657135-12d8-37cb-89d1-630104316033": "Bettet_Ansh",
    "38080364-a265-30bd-b16f-2275ae1926e7": "Unknown_Player_1",
    "713274ba-0c4c-399f-94fe-e92af7605076": "Unknown_Player_2"
}

players = []
for file in glob.glob(os.path.join(stats_dir, "*.json")):
    uuid = os.path.basename(file).replace('.json', '')
    name = NAME_MAP.get(uuid, "Unknown_" + uuid[:4])
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        players.append({"name": name, "uuid": uuid, "stats": data.get("stats", {})})
    except Exception as e:
        print(f"Error reading {file}: {e}")

# Create the JS code string for RAW_PLAYERS
raw_players_json = json.dumps(players, indent=2)
# We use a string for LAST_UPDATED to match the regex later
replacement = f'const RAW_PLAYERS = {raw_players_json};\nconst LAST_UPDATED = "{json.dumps(json.dumps(""))[1:-1]}";' 
# Wait, just use a simple date string
import datetime
now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
replacement = f'const RAW_PLAYERS = {raw_players_json};\nconst LAST_UPDATED = "{now_str}";'

with open(data_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Flexible regex to match various forms of RAW_PLAYERS and LAST_UPDATED
pattern = re.compile(r'const RAW_PLAYERS = \[.*?\];\s*const LAST_UPDATED = ".*?";', re.DOTALL)
if not pattern.search(content):
    pattern = re.compile(r'const RAW_PLAYERS = \[.*?\];\s*const LAST_UPDATED = new Date\(\)\.toLocaleString\(\);', re.DOTALL)

if pattern.search(content):
    new_content = pattern.sub(replacement, content)
    with open(data_js_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully injected {len(players)} players into data.js!")
else:
    print("Could not find insertion point in data.js. Check the file structure.")
