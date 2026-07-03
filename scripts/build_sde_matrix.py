#!/usr/bin/env python3
"""
Z-S SDE Matrix Builder (Official 2026 Fenris YAML Schema Compliant)
Downloads the official ZIP archive, parses categories, groups, and types,
and outputs a minified, lightweight search-optimised JSON map for the customiser.

Dependencies:
    pip install pyyaml requests
"""

import os
import sys
import json
import zipfile
import io
import shutil
import time
import requests
import yaml

SDE_ZIP_URL = "https://developers.eveonline.com/static-data/eve-online-static-data-latest-yaml.zip"
OUTPUT_PATH = "public/data/matrix_latest.json"
TEMP_DIR = "sde_temp"

# Target Categories to extract — everything that can appear in space on the
# overview, mirroring EVE's own overview-settings tree:
#   2 = Celestial, 3 = Station, 6 = Ship, 8 = Charge (probes/bombs only),
#   11 = Entity (NPCs), 18 = Drone, 22 = Deployable, 23 = Starbase,
#   25 = Asteroid, 40 = Sovereignty Structures, 41 = Planetary Industry
#   (Mercenary/Capsuleer Bases only), 46 = Orbitals (POCOs),
#   65 = Structure (Upwell: Citadels, Skyhooks), 87 = Fighter
TARGET_CATEGORIES = {2, 3, 6, 8, 11, 18, 22, 23, 25, 40, 41, 46, 65, 87}

# Mixed categories: mostly inventory (8) or on-planet (41) items, with a
# handful of genuine space objects. Only these groups are extracted:
#   8  — Bomb, Scanner/Survey/Interdiction Probe, Bomb ECM/Energy, Guided
#        Bomb, Interdiction Burst Probes (everything else is ammo, mining
#        crystals, scripts… — cargo/fitting inventory, never on the overview)
#   41 — Mercenary Bases, Capsuleer Bases (the rest are on-planet PI pins)
GROUP_WHITELIST = {
    8: {90, 479, 492, 548, 863, 864, 1548, 4088},
    41: {1081, 1082},
}

# Render-/map-only groups that never appear on the overview, dropped from
# otherwise space-relevant categories (Celestial dust clouds, non-interactable
# scenery, map hierarchy objects, decorative asteroids…).
GROUP_BLOCKLIST = {
    2: {3, 4, 5, 227, 312, 995, 1198, 1882, 1973, 1975, 1980, 1983, 4055, 4070, 4430, 4579, 4713},
    25: {519, 4714},
}


def group_allowed(cid, gid):
    """True if a group in a target category belongs in the overview matrix."""
    allow = GROUP_WHITELIST.get(cid)
    if allow is not None and gid not in allow:
        return False
    return gid not in GROUP_BLOCKLIST.get(cid, set())


def download_and_extract_sde():
    print(f"[*] Fetching official EVE Online SDE: {SDE_ZIP_URL}")
    headers = {"User-Agent": "Z-S-Overview-Customiser-BuildPipeline/1.0"}
    r = requests.get(SDE_ZIP_URL, stream=True, headers=headers)
    if r.status_code != 200:
        print(f"[!] HTTP Failure: {r.status_code}")
        sys.exit(1)

    zip_bytes = io.BytesIO()
    print("[*] Downloading SDE Zip into memory...")
    for chunk in r.iter_content(chunk_size=1024 * 1024 * 4):  # 4MB chunks
        if chunk:
            zip_bytes.write(chunk)

    print("[*] Decompressing target files...")
    with zipfile.ZipFile(zip_bytes) as z:
        # Search the internal archive paths (sde/fsd/...)
        for member in z.namelist():
            # Fenris uses plural names for the official YAML distribution
            if any(
                k in member for k in ["categories.yaml", "groups.yaml", "types.yaml"]
            ):
                filename = os.path.basename(member)
                os.makedirs(TEMP_DIR, exist_ok=True)
                print(f"    -> Extracting: {member} as {filename}")
                with open(os.path.join(TEMP_DIR, filename), "wb") as f:
                    f.write(z.read(member))


def load_yaml_fast(filename):
    filepath = os.path.join(TEMP_DIR, filename)
    print(f"[*] Parsing {filename}...")
    with open(filepath, "r", encoding="utf-8") as f:
        try:
            return yaml.load(f, Loader=yaml.CSafeLoader)
        except AttributeError:
            print(
                "[!] Warning: CSafeLoader not found. Falling back to slow pure-Python SafeLoader."
            )
            return yaml.load(f, Loader=yaml.SafeLoader)


def process_and_minify():
    # Fenris SDE Plural Schema
    categories_raw = load_yaml_fast("categories.yaml")
    groups_raw = load_yaml_fast("groups.yaml")
    types_raw = load_yaml_fast("types.yaml")

    categories = {}
    print("[*] Filtering database schemas down to core overview taxonomies...")
    for cid, d in categories_raw.items():
        if cid in TARGET_CATEGORIES:
            categories[str(cid)] = {
                "name": d.get("name", {}).get("en", f"Category {cid}"),
                "groups": [],
            }

    groups = {}
    for gid, d in groups_raw.items():
        cid = d.get("categoryID")
        if cid in TARGET_CATEGORIES and group_allowed(cid, gid):
            groups[str(gid)] = {
                "name": d.get("name", {}).get("en", f"Group {gid}"),
                "categoryId": cid,
                "types": [],
            }
            if str(cid) in categories:
                categories[str(cid)]["groups"].append(gid)

    types = {}
    for tid, d in types_raw.items():
        gid = d.get("groupID")
        if str(gid) in groups:
            raw_name = d.get("name", {}).get("en", f"Type {tid}")
            # Strip SDE markup tags
            clean_name = (
                raw_name.replace("<font size=14>", "").replace("</font>", "").strip()
            )
            types[str(tid)] = {"name": clean_name, "groupId": gid}
            groups[str(gid)]["types"].append(tid)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {
                "metadata": {
                    "version": "SDE-Latest-Official",
                    "compiledAt": int(time.time()),
                },
                "categories": categories,
                "groups": groups,
                "types": types,
            },
            f,
            separators=(",", ":"),
        )
    print(
        f"[+] Minified lookup matrix written: {OUTPUT_PATH} ({os.path.getsize(OUTPUT_PATH) / 1024 / 1024:.2f} MB)"
    )


def cleanup():
    if os.path.exists(TEMP_DIR):
        print("[*] Cleaning up intermediate yaml workspace...")
        shutil.rmtree(TEMP_DIR)


if __name__ == "__main__":
    try:
        download_and_extract_sde()
        process_and_minify()
    finally:
        cleanup()
