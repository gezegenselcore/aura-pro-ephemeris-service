# GitHub Push Instructions (403 Error Fix)

## Problem
```
remote: Permission to gezegenselcore/aura-pro-ephemeris-service.git denied (wrong account or token).
fatal: unable to access 'https://github.com/gezegenselcore/aura-pro-ephemeris-service.git/': The requested URL returned error: 403
```

## Solution: Use Personal Access Token

### Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note**: `aura-pro-ephemeris-service-push`
   - **Expiration**: Choose (90 days recommended)
   - **Scopes**: Check **`repo`** (Full control of private repositories)
4. Click **"Generate token"**
5. **COPY THE TOKEN** - You won't see it again!

### Step 2: Push Using Token

```powershell
cd D:\GezegenselGames\Aura\aura-pro-ephemeris-service
git push -u origin main
```

When prompted:
- **Username**: `gezegenselcore` (yeni hesap)
- **Password**: **Paste the Personal Access Token** (NOT your GitHub password)

### Alternative: Use SSH

If you have SSH keys set up:

```powershell
cd D:\GezegenselGames\Aura\aura-pro-ephemeris-service
git remote set-url origin git@github.com:gezegenselcore/aura-pro-ephemeris-service.git
git push -u origin main
```

### Check credentials

If you're still getting 403:
1. Ensure Windows Credential Manager has **gezegenselcore** (not gezegenselcores/gezegenseltr) for git:https://github.com
2. Use a PAT with `repo` and `workflow` scope from the **gezegenselcore** account
3. Repo must exist at https://github.com/gezegenselcore/aura-pro-ephemeris-service

## Quick Test

After push, verify:
- https://github.com/gezegenselcore/aura-pro-ephemeris-service
- README.md should be visible
- LICENSE file should be visible
- All source files should be present
