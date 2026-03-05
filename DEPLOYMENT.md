# 🚀 GitHub Pages Deployment Guide

Quick setup to get Pyro Scroll live on GitHub Pages in minutes.

## Prerequisites

- GitHub account (free)
- Git installed on your computer
- All Pyro Scroll files ready

## Option 1: User/Organization Pages (Recommended)

This method gives you a main website at `yourusername.github.io`

### Step 1: Create Repository

1. Go to https://github.com/new
2. Name it **exactly**: `yourusername.github.io` (replace with your GitHub username)
3. Make it Public
4. Don't add README, .gitignore, or license yet
5. Click "Create repository"

### Step 2: Upload Files

**Using Terminal:**
```bash
# Navigate to your project folder
cd ~/pyro-scroll

# Initialize git
git init
git add .
git commit -m "Initial Pyro Scroll commit"

# Add remote (replace username)
git remote add origin https://github.com/yourusername/yourusername.github.io.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Using GitHub Desktop:**
1. File → Clone Repository
2. Paste repository URL
3. Choose local path
4. Drag and drop all Pyro Scroll files
5. Commit and push

**Using Web Upload:**
1. Go to repository page
2. Click "Add file" → "Upload files"
3. Drag files into the upload area
4. Commit changes

### Step 3: Verify Deployment

1. Wait 1-2 minutes for GitHub Pages to build
2. Visit `https://yourusername.github.io`
3. Your app is live! 🎉

---

## Option 2: Project Pages

This creates a site at `yourusername.github.io/pyro-scroll`

### Step 1: Create Repository

1. Go to https://github.com/new
2. Name it: `pyro-scroll`
3. Make it Public
4. Click "Create repository"

### Step 2: Upload Files

```bash
cd ~/pyro-scroll
git init
git add .
git commit -m "Initial Pyro Scroll commit"
git remote add origin https://github.com/yourusername/pyro-scroll.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to repository Settings
2. Scroll to "Pages" section
3. Under "Build and deployment":
   - Source: Deploy from a branch
   - Branch: main / root
4. Click Save
5. Wait 1-2 minutes

### Step 4: Access Your Site

Visit `https://yourusername.github.io/pyro-scroll`

---

## Update Your Site

After initial deployment, updating is easy:

**Via Terminal:**
```bash
git add .
git commit -m "Update message"
git push origin main
```

**Via Web:**
1. Open GitHub repository
2. Click "Add file" → "Upload files"
3. Or use GitHub Desktop to sync changes

Changes appear live within 1-2 minutes.

---

## Custom Domain (Optional)

### Use Your Own Domain

1. Purchase domain (GoDaddy, Namecheap, etc.)
2. In repository Settings → Pages
3. Add custom domain under "Custom domain"
4. Add DNS records from your registrar:
   ```
   A Record: 185.199.108.153
   A Record: 185.199.109.153
   A Record: 185.199.110.153
   A Record: 185.199.111.153
   
   CNAME: yourusername.github.io (if using subdomain)
   ```
5. Wait for DNS propagation (can take 24-48 hours)
6. Enable HTTPS in GitHub Pages settings

---

## Firebase Configuration on GitHub Pages

Your Firebase credentials are public in this code. This is okay for:
- Hobby projects
- Non-critical apps
- Learning/development

For production, restrict access with Firestore rules (included in README).

---

## Troubleshooting

### Pages not appearing

1. Check repository is PUBLIC (not private)
2. Verify branch is set to "main" in Settings
3. Check file names are correct (index.html, style.css, app.js)
4. Look for build errors in repository Actions tab

### Firebase auth not working

1. Verify domain is authorized in Firebase Console
2. Go to Authentication → Settings → Authorized domains
3. Add `yourusername.github.io` to the list
4. If using custom domain, add that too

### CSS/JS not loading

1. Ensure all files are in root directory
2. Check file references are relative paths
3. Open browser DevTools (F12) to check 404 errors
4. Verify file names match exactly (case-sensitive)

### CORS errors with videos

1. Only works with video URLs that support cross-origin requests
2. YouTube videos work automatically
3. Self-hosted videos need CORS headers enabled

---

## Performance Tips

### Optimize for Mobile

- GitHub Pages is fast by default
- Use CDN links for Firebase
- All files are already minified-friendly

### Monitor Performance

1. Use Lighthouse (Chrome DevTools)
2. Check PageSpeed Insights at pagespeed.web.dev
3. Use WebPageTest for detailed analysis

---

## Keep Backups

Important: Keep a local copy of your files!

```bash
# Clone your repository locally
git clone https://github.com/yourusername/pyro-scroll.git

# This keeps a backup of all your code
```

---

## Next Steps After Deployment

1. **Share your app:**
   - Post on social media
   - Share GitHub repository
   - Send to friends/testers

2. **Get feedback:**
   - Add a feedback form
   - Check browser console logs
   - Monitor Firebase usage

3. **Improve security:**
   - Regenerate Firebase credentials if exposed
   - Set strict Firestore security rules
   - Monitor storage usage

4. **Add features:**
   - Comments system
   - Explore/Discovery page
   - User follows
   - Video recommendations

---

## Support

If deployment fails:
1. Check terminal output for errors
2. Verify repository is public
3. Ensure all files exist
4. Check GitHub Pages documentation: https://pages.github.com

Good luck! 🔥 Keep Pyro Scroll burning!
