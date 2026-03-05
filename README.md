# 🔥 Pyro Scroll - TikTok Style Doomscroll App

A beautiful, high-performance doomscroll web app optimized for iPad, built with vanilla JavaScript and Firebase. Post videos with tags, infinite scroll through content, and engage with the community.

## Features

✨ **Core Features**
- Google authentication with Firebase
- Infinite doomscroll feed (vertical scroll snap)
- Post videos with captions and hashtags
- Like and view tracking
- User profiles with post history
- Fully responsive iPad-optimized UI
- Dark theme with fiery red/orange accent colors
- Smooth animations and transitions

🎨 **Design Highlights**
- Bold fiery aesthetic (#ff6b35 primary color)
- Premium typography with Poppins display font
- Glassmorphism effects with backdrop blur
- Smooth scroll-snap feed experience
- Gesture-friendly iPad interface
- Full-screen video player with overlay controls

⚡ **Technical Stack**
- HTML5 + CSS3 + Vanilla JavaScript
- Firebase Authentication (Google Login)
- Firestore Database for video storage
- No build tools required - pure web technology
- Mobile-first, fully responsive design

## File Structure

```
pyro-scroll/
├── index.html           # Main HTML structure
├── style.css            # Complete styling (single file)
├── app.js               # Application logic
├── firebase-config.js   # Firebase configuration
└── README.md            # This file
```

## Setup Instructions

### 1. Clone or Download Files

Clone this repository to your local machine:
```bash
git clone https://github.com/yourusername/pyro-scroll.git
cd pyro-scroll
```

Or simply download all files to your computer.

### 2. Firebase Configuration

The app uses your provided Firebase configuration. The `firebase-config.js` file contains:
- API Key: AIzaSyBsFs1qrmojBkuwIynMrFUYmt5NovALDoo
- Auth Domain: pyro-scroll.firebaseapp.com
- Project ID: pyro-scroll
- Storage Bucket: pyro-scroll.firebasestorage.app

**⚠️ Security Note**: Since Firebase credentials are exposed in this code, you should:
1. Go to Firebase Console
2. Navigate to Project Settings → Service Accounts
3. Regenerate credentials to invalidate the old ones
4. Update `firebase-config.js` with new credentials

### 3. Configure Firebase Project

In your Firebase Console:

**Enable Google Sign-In:**
1. Go to Authentication → Sign-in method
2. Enable Google provider
3. Add authorized domains (your domain and localhost:3000 for testing)

**Set Up Firestore Database:**
1. Create a Firestore database in test mode (or production with proper rules)
2. The app will automatically create the "videos" collection on first use

**Firestore Rules (Production):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /videos/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4. Local Testing

Option A: Simple HTTP Server
```bash
python3 -m http.server 3000
# Then visit http://localhost:3000
```

Option B: Using Node.js http-server
```bash
npm install -g http-server
http-server -p 3000
```

Option C: VS Code Live Server Extension
- Install the Live Server extension
- Right-click `index.html` → "Open with Live Server"

### 5. Deploy to GitHub Pages

**Method 1: Direct Repository**
1. Create a new GitHub repository named `yourusername.github.io`
2. Push all files to the repository
3. Access at `https://yourusername.github.io`

**Method 2: Project Repository**
1. Create a repository named `pyro-scroll`
2. Enable GitHub Pages in repository settings
3. Select main branch as source
4. Access at `https://yourusername.github.io/pyro-scroll`

**Method 3: Using gh-pages branch**
```bash
git subtree push --prefix . origin gh-pages
```

## Usage Guide

### For Users

**Signing In:**
1. Click "Sign in with Google" button
2. Select your Google account
3. Authorize the app

**Browsing Videos:**
- Scroll vertically through the feed
- Videos snap to full-screen on the iPad
- Tap video to expand player
- Double-tap heart icon to like videos

**Posting Videos:**
1. Click the "+" button in header
2. Paste video URL (supports MP4, YouTube, etc.)
3. Add caption and hashtags
4. Optionally add custom thumbnail
5. Click "Post to Pyro Scroll"

**Your Profile:**
1. Click your avatar in header
2. See your posting stats
3. View your posted videos
4. Sign out when done

### Video URL Tips

**YouTube Videos:**
- Just paste the full YouTube URL
- App auto-extracts video ID and creates embed

**Direct MP4 Files:**
- Use any direct video URL (AWS S3, self-hosted, etc.)
- Must support CORS headers for playback

**Thumbnail:**
- Auto-generated for YouTube videos
- Customize by providing image URL

## Customization Guide

### Change Colors

Edit `:root` variables in `style.css`:
```css
:root {
    --primary: #ff6b35;        /* Main brand color */
    --accent: #ff0080;         /* Secondary accent */
    --dark-bg: #0a0e27;        /* Dark background */
    --card-bg: #1a1f3a;        /* Card background */
}
```

### Change Fonts

Update font imports in CSS:
```css
--font-display: 'Poppins', sans-serif;  /* Headings */
--font-body: 'Inter', sans-serif;       /* Body text */
```

### Modify App Name

1. Update `<title>` in index.html
2. Change `.app-title` text in HTML
3. Update `.pyro-logo h1` text

### Video Feed Settings

In `app.js`, modify the `loadVideos()` function:
```javascript
limit(10)  // Change 10 to load more/fewer videos per page
```

## Troubleshooting

**"Sign in with Google" button not working:**
- Check that Google Sign-In is enabled in Firebase
- Verify authorized domains include your hosting domain
- Check browser console for error messages (F12)

**Videos not loading:**
- Verify Firestore database is created and accessible
- Check browser console for Firestore errors
- Ensure Firebase rules allow read access

**CORS errors when playing videos:**
- Make sure video URLs support CORS headers
- Some video hosts block cross-origin requests
- Test URLs at https://cors-anywhere.herokuapp.com/

**App looks zoomed on iPad:**
- Check viewport meta tag in `index.html`
- Clear browser cache (Cmd+Shift+R)
- Try different iPad orientation

**Firebase credentials exposed:**
- Immediately regenerate credentials in Firebase Console
- GitHub commits are permanent - consider credentials compromised
- Use environment variables in production (see next section)

## Production Deployment Tips

### Secure Firebase Credentials

Use environment variables instead of hardcoding credentials:

1. Create `.env.local` file:
```
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_auth_domain
```

2. Build with environment variable support (requires build step)

### Add Analytics

The app includes Firebase Analytics setup. Track:
- User sign-ups
- Video posts
- Engagement metrics

### Optimize Performance

- Use Firebase CDN for image serving
- Enable Firestore caching
- Implement image lazy-loading
- Minify CSS/JS for production

### Add Back-up and Recovery

- Enable Firestore automated backups
- Implement user data export feature
- Set up alerts for data anomalies

## Browser Support

✅ **Fully Supported:**
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- iPad Safari (all recent versions)

⚠️ **Partially Supported:**
- Mobile Chrome/Safari (responsive but optimized for tablet)

❌ **Not Supported:**
- IE 11 and below

## Contributing

To contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on iPad
5. Submit a pull request

## License

MIT License - Feel free to use for personal or commercial projects

## Support

For issues or questions:
- Check browser console (F12) for error messages
- Review Firebase documentation
- Check GitHub issues
- Verify all files are in the correct location

## Roadmap

Planned features:
- [ ] Comments and replies
- [ ] Direct messaging
- [ ] Video discovery/explore page
- [ ] User follows/followers
- [ ] Video duration limits
- [ ] Audio track management
- [ ] HD video quality options
- [ ] Dark/Light theme toggle
- [ ] Offline viewing support
- [ ] Progressive Web App (PWA) support

---

🔥 **Keep it burning!** - Pyro Scroll Team

Last Updated: March 2024
