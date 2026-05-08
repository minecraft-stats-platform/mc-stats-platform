import json
import os
import glob
import re
import datetime
import sys

# --- CONFIGURATION ---
# Default paths (used if no arguments are provided)
DEFAULT_STATS_DIR = r"C:\Users\Ansh\Downloads\world\players\stats"
DEFAULT_OUTPUT_JS = r"C:\Users\Ansh\.gemini\antigravity\scratch\mc-stats\data.js"

# 1. Use command line arguments if provided
# Usage: python inject_stats.py [world_path] [output_js_name]
target_stats_dir = DEFAULT_STATS_DIR
target_output_js = DEFAULT_OUTPUT_JS

if len(sys.argv) > 1:
    # If user provides a world path, look for stats inside it
    world_path = sys.argv[1]
    target_stats_dir = os.path.join(world_path, "players", "stats")

if len(sys.argv) > 2:
    # If user provides a specific .js filename (like data_new.js)
    target_output_js = sys.argv[2]
    # If it's just a filename, put it in the current project directory
    if not os.path.isabs(target_output_js):
        target_output_js = os.path.join(os.getcwd(), target_output_js)

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

print(f"Reading stats from: {target_stats_dir}")

players = []
if not os.path.exists(target_stats_dir):
    print(f"ERROR: The directory {target_stats_dir} does not exist!")
    sys.exit(1)

for file in glob.glob(os.path.join(target_stats_dir, "*.json")):
    uuid = os.path.basename(file).replace('.json', '')
    name = NAME_MAP.get(uuid, "Player_" + uuid[:6])
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        players.append({"name": name, "uuid": uuid, "stats": data.get("stats", {})})
    except Exception as e:
        print(f"Error reading {file}: {e}")

# Create the JS code string
raw_players_json = json.dumps(players, indent=2)
now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
replacement = f'const RAW_PLAYERS = {raw_players_json};\nconst LAST_UPDATED = "{now_str}";'

# If the output file doesn't exist, we create it from the template (data.js)
if not os.path.exists(target_output_js):
    print(f"Creating new data file: {target_output_js}")
    # Copy from the original data.js to get the processing logic
    with open(DEFAULT_OUTPUT_JS, 'r', encoding='utf-8') as f:
        template_content = f.read()
else:
    with open(target_output_js, 'r', encoding='utf-8') as f:
        template_content = f.read()

# Flexible regex to inject data
pattern = re.compile(r'const RAW_PLAYERS = \[.*?\];\s*const LAST_UPDATED = ".*?";', re.DOTALL)
if not pattern.search(template_content):
    pattern = re.compile(r'const RAW_PLAYERS = \[.*?\];\s*const LAST_UPDATED = new Date\(\)\.toLocaleString\(\);', re.DOTALL)

if pattern.search(template_content):
    new_content = pattern.sub(replacement, template_content)
    with open(target_output_js, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"SUCCESS! Injected {len(players)} players into {os.path.basename(target_output_js)}!")
else:
    # If no pattern found, just write it at the top (fallback)
    with open(target_output_js, 'w', encoding='utf-8') as f:
        f.write(replacement + "\n\n" + template_content)
    print(f"SUCCESS! Added data to top of {os.path.basename(target_output_js)}!")
