#!/usr/bin/env python3
"""
Z-S SDE Matrix Builder (Official 2026 CCP YAML Schema Compliant)
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

# Target Categories to extract
# Category 6 = Ships, Category 2 = Modules, Category 3 = Celestials, Category 18 = Drones
TARGET_CATEGORIES = {2, 3, 6, 18}


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
            # CCP uses plural names for the official YAML distribution
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
    # CCP SDE Plural Schema
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
        if cid in TARGET_CATEGORIES:
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
