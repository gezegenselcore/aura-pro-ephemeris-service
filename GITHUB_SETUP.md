# GitHub Repository Setup Instructions

## A) GitHub Repo Oluşturma (ORG altına)

### 1. GitHub Web Interface

1. Go to: https://github.com/organizations/GezegenselCore
2. Click **"New repository"** button
3. Fill in:
   - **Repository name**: `aura-pro-ephemeris-service`
   - **Description**: `AURA PRO Ephemeris Service - Swiss Ephemeris based cloud service for Chiron + asteroids (AGPL-3.0)`
   - **Visibility**: **Public** (required for AGPL-3.0 compliance)
   - **Initialize repository**: **DO NOT CHECK** any boxes (README, .gitignore, license)
     - We already have these files locally
4. Click **"Create repository"**

### 2. Verify Repo URL

After creation, verify the URL is:
```
https://github.com/GezegenselCore/aura-pro-ephemeris-service
```

## B) Push Local Code to GitHub

After creating the repo on GitHub, run these commands locally:

```bash
cd aura-pro-ephemeris-service
git push -u origin main
```

If you get authentication errors, you may need to:
- Use GitHub Personal Access Token (PAT) instead of password
- Or use SSH: `git remote set-url origin git@github.com:GezegenselCore/aura-pro-ephemeris-service.git`

## C) Verify Push Success

After pushing, check:
- ✅ README.md is visible on GitHub
- ✅ LICENSE file is visible
- ✅ `functions/` directory structure is complete
- ✅ `scripts/` directory exists
- ✅ `.gitignore` is present

## D) Post-Push Checklist

- [ ] Repo is PUBLIC
- [ ] README.md renders correctly
- [ ] LICENSE (AGPL-3.0) is visible
- [ ] All source files are present
- [ ] `.gitignore` excludes `node_modules/`, `.env`, etc.
