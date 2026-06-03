### Step-by-Step Setup Guide

Follow this sequence to set up, build, and deploy the modular workspace:

#### 1. Setup Local Repository
Create your workspace directories and install dependencies:
```bash
mkdir zs-overview-customiser && cd zs-overview-customiser
npm install
```

#### 2. Run the SDE Compiler
Compile the latest CCP YAML SDE data into the optimized, lightweight JSON map:
```bash
npm run sde:build
```
This script will download the official EVE Online static data zip directly from CCP, extract the pluralized `categories.yaml`, `groups.yaml`, and `types.yaml` files, compress the relationships, and save them straight to `/static/data/matrix_latest.json`.

#### 3. Run Your Local Development Server
Launch the Vite hot-reloading development server to test and refine the UI:
```bash
npm run dev