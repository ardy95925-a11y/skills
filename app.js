// Scroll - Professional Video Platform
import { 
    auth, 
    db, 
    googleProvider,
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    where,
    updateDoc,
    doc,
    deleteDoc
} from './firebase-config.js';

// ============= DOM ELEMENTS =============
const authScreen = document.getElementById('authScreen');
const mainApp = document.getElementById('mainApp');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const videoFeed = document.getElementById('videoFeed');
const postBtn = document.getElementById('postBtn');
const profileBtn = document.getElementById('profileBtn');
const settingsBtn = document.getElementById('settingsBtn');
const postModal = document.getElementById('postModal');
const profileModal = document.getElementById('profileModal');
const videoModal = document.getElementById('videoModal');
const settingsModal = document.getElementById('settingsModal');
const postForm = document.getElementById('postForm');
const searchInput = document.getElementById('searchInput');
const navLinks = document.querySelectorAll('.nav-link');
const filterBtns = document.querySelectorAll('.tag-btn');

// ============= STATE =============
let currentUser = null;
let allVideos = [];
let currentCategory = 'all';
let bookmarkedVideos = new Set();
let followingUsers = new Set();
let userFollowers = {};

// ============= AUTHENTICATION =============
googleSignInBtn.addEventListener('click', async () => {
    try {
        googleSignInBtn.disabled = true;
        googleSignInBtn.textContent = 'Signing in...';
        const result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Signed in:', result.user.displayName);
    } catch (error) {
        console.error('❌ Sign in error:', error.code);
        let message = 'Failed to sign in.';
        
        if (error.code === 'auth/unauthorized-domain') {
            message = `Domain not authorized. Add "${window.location.hostname}" to Firebase authorized domains.`;
        } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
            message = 'Google Sign-In not configured in Firebase Console.';
        }
        
        alert(message);
        googleSignInBtn.disabled = false;
        googleSignInBtn.textContent = 'Sign in with Google';
    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        authScreen.style.display = 'none';
        mainApp.classList.remove('hidden');
        await loadAllVideos();
        await loadUserData();
    } else {
        currentUser = null;
        authScreen.style.display = 'flex';
        mainApp.classList.add('hidden');
        allVideos = [];
    }
});

// ============= NAVIGATION =============
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active from all
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const section = link.dataset.section;
        
        // Hide all sections
        document.getElementById('feedSection')?.style.display = 'none';
        document.getElementById('discoverSection')?.style.display = 'none';
        document.getElementById('trendingSection')?.style.display = 'none';
        document.getElementById('bookmarksSection')?.style.display = 'none';
        document.getElementById('followingSection')?.style.display = 'none';
        
        // Show selected section
        document.getElementById(section + 'Section')?.style.display = 'block';
        
        if (section === 'trending') loadTrending();
        if (section === 'bookmarks') loadBookmarks();
        if (section === 'following') loadFollowingVideos();
        if (section === 'discover') loadDiscoverCategories();
    });
});

// ============= FILTER BY CATEGORY =============
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        filterVideos();
    });
});

// ============= SEARCH =============
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length === 0) {
        filterVideos();
    } else {
        const filtered = allVideos.filter(v => 
            v.title.toLowerCase().includes(query) ||
            v.caption?.toLowerCase().includes(query) ||
            v.tags?.some(t => t.toLowerCase().includes(query))
        );
        renderVideos(filtered);
    }
});

// ============= VIDEO MANAGEMENT =============
async function loadAllVideos() {
    try {
        const q = query(
            collection(db, 'videos'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );
        
        const snapshot = await getDocs(q);
        allVideos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.()
        }));
        
        filterVideos();
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

function filterVideos() {
    if (currentCategory === 'all') {
        renderVideos(allVideos);
    } else {
        const filtered = allVideos.filter(v => v.category === currentCategory);
        renderVideos(filtered);
    }
}

function renderVideos(videos) {
    videoFeed.innerHTML = '';
    
    if (videos.length === 0) {
        videoFeed.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #65676b;">No videos found</p>';
        return;
    }
    
    videos.forEach(video => {
        const card = createVideoCard(video);
        videoFeed.appendChild(card);
    });
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    const thumbnail = video.thumbnail || getThumbnailUrl(video.videoUrl);
    const duration = formatDate(video.timestamp);
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${thumbnail}" alt="${video.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22120%22%3E%3Crect fill=%22%23f0f2f5%22 width=%22200%22 height=%22120%22/%3E%3C/svg%3E'">
            <div class="video-play-icon">▶️</div>
        </div>
        <div class="video-card-content">
            <div class="video-card-title">${escapeHtml(video.title)}</div>
            <div class="video-card-creator">${escapeHtml(video.userName)}</div>
            <div class="video-card-meta">
                <span>${video.views || 0} views</span>
                <span>${duration}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openVideoModal(video));
    
    return card;
}

// ============= VIDEO MODAL =============
async function openVideoModal(video) {
    // Update video player
    const container = document.getElementById('videoPlayerContainer');
    container.innerHTML = '';
    
    // Create proper video player
    if (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')) {
        const videoId = extractYouTubeId(video.videoUrl);
        container.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        container.innerHTML = `
            <video controls style="width: 100%; height: 100%;">
                <source src="${video.videoUrl}" type="video/mp4">
                Your browser does not support HTML5 video.
            </video>
        `;
    }
    
    // Update metadata
    document.getElementById('modalVideoTitle').textContent = video.title;
    document.getElementById('modalVideoCaption').textContent = video.caption || 'No description';
    document.getElementById('modalVideoViews').textContent = `${video.views || 0} views`;
    document.getElementById('modalVideoDate').textContent = formatDate(video.timestamp);
    document.getElementById('modalCreatorName').textContent = video.userName;
    document.getElementById('modalCreatorEmail').textContent = '@' + video.userEmail.split('@')[0];
    document.getElementById('modalCreatorAvatar').src = video.userPhotoURL || 'https://via.placeholder.com/48';
    document.getElementById('modalLikeCount').textContent = video.likes || 0;
    document.getElementById('modalCommentCount').textContent = video.comments?.length || 0;
    
    // Update tags
    const tagsContainer = document.getElementById('modalVideoTags');
    tagsContainer.innerHTML = (video.tags || []).map(tag => 
        `<span class="tag">#${escapeHtml(tag)}</span>`
    ).join('');
    
    // Update follow button
    const followBtn = document.getElementById('modalFollowBtn');
    if (currentUser.uid === video.userId) {
        followBtn.style.display = 'none';
    } else {
        followBtn.style.display = 'block';
        followBtn.textContent = followingUsers.has(video.userId) ? 'Following' : 'Follow';
        followBtn.onclick = () => toggleFollow(video.userId, video.userName);
    }
    
    // Increment view count
    try {
        const videoRef = doc(db, 'videos', video.id);
        await updateDoc(videoRef, {
            views: (video.views || 0) + 1
        });
    } catch (error) {
        console.error('Error updating views:', error);
    }
    
    // Load comments
    await loadComments(video.id);
    
    // Store current video for comments
    window.currentVideoId = video.id;
    
    // Setup action buttons
    setupActionButtons(video.id);
    
    videoModal.classList.remove('hidden');
}

function extractYouTubeId(url) {
    const regexes = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (let regex of regexes) {
        const match = url.match(regex);
        if (match) return match[1];
    }
    
    return null;
}

function getThumbnailUrl(videoUrl) {
    const videoId = extractYouTubeId(videoUrl);
    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23f0f2f5%22 width=%22400%22 height=%22200%22/%3E%3C/svg%3E';
}

// ============= ACTION BUTTONS =============
function setupActionButtons(videoId) {
    const likeBtn = document.querySelector('[data-action="like"]');
    const commentBtn = document.querySelector('[data-action="comment"]');
    const bookmarkBtn = document.querySelector('[data-action="bookmark"]');
    
    likeBtn.onclick = () => likeVideo(videoId);
    commentBtn.onclick = () => document.getElementById('commentInput').focus();
    bookmarkBtn.onclick = () => toggleBookmark(videoId);
    
    // Update bookmark button state
    if (bookmarkedVideos.has(videoId)) {
        bookmarkBtn.style.color = '#0066cc';
    } else {
        bookmarkBtn.style.color = 'inherit';
    }
}

async function likeVideo(videoId) {
    try {
        const videoRef = doc(db, 'videos', videoId);
        const video = allVideos.find(v => v.id === videoId);
        const newLikes = (video.likes || 0) + 1;
        
        await updateDoc(videoRef, { likes: newLikes });
        
        video.likes = newLikes;
        document.getElementById('modalLikeCount').textContent = newLikes;
    } catch (error) {
        console.error('Error liking video:', error);
    }
}

function toggleBookmark(videoId) {
    if (bookmarkedVideos.has(videoId)) {
        bookmarkedVideos.delete(videoId);
    } else {
        bookmarkedVideos.add(videoId);
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(Array.from(bookmarkedVideos)));
    
    const btn = document.querySelector('[data-action="bookmark"]');
    if (bookmarkedVideos.has(videoId)) {
        btn.style.color = '#0066cc';
    } else {
        btn.style.color = 'inherit';
    }
}

function toggleFollow(userId, userName) {
    const btn = document.getElementById('modalFollowBtn');
    
    if (followingUsers.has(userId)) {
        followingUsers.delete(userId);
        btn.textContent = 'Follow';
    } else {
        followingUsers.add(userId);
        btn.textContent = 'Following';
    }
    
    localStorage.setItem('following', JSON.stringify(Array.from(followingUsers)));
}

// ============= COMMENTS =============
async function loadComments(videoId) {
    try {
        const video = allVideos.find(v => v.id === videoId);
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';
        
        if (!video.comments || video.comments.length === 0) {
            commentsList.innerHTML = '<p style="text-align: center; color: #65676b;">No comments yet</p>';
            return;
        }
        
        video.comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.className = 'comment-item';
            commentEl.innerHTML = `
                <div class="comment-author">${escapeHtml(comment.author)}</div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
            `;
            commentsList.appendChild(commentEl);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

document.getElementById('submitCommentBtn').addEventListener('click', async () => {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    
    if (!text || !window.currentVideoId) return;
    
    try {
        const video = allVideos.find(v => v.id === window.currentVideoId);
        const comments = video.comments || [];
        
        comments.push({
            author: currentUser.displayName,
            text: text,
            timestamp: new Date()
        });
        
        const videoRef = doc(db, 'videos', window.currentVideoId);
        await updateDoc(videoRef, { comments });
        
        video.comments = comments;
        input.value = '';
        
        await loadComments(window.currentVideoId);
    } catch (error) {
        console.error('Error posting comment:', error);
    }
});

// ============= POST VIDEO =============
postBtn.addEventListener('click', () => postModal.classList.remove('hidden'));

document.getElementById('closePostModalBtn').addEventListener('click', () => {
    postModal.classList.add('hidden');
    postForm.reset();
});

// Update character counts
document.getElementById('videoTitle').addEventListener('input', (e) => {
    document.getElementById('titleCount').textContent = `${e.target.value.length}/100`;
});

document.getElementById('videoCaption').addEventListener('input', (e) => {
    document.getElementById('captionCount').textContent = `${e.target.value.length}/500`;
});

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please sign in first');
        return;
    }
    
    try {
        postBtn.disabled = true;
        postBtn.textContent = 'Publishing...';
        
        const videoData = {
            videoUrl: document.getElementById('videoUrl').value,
            title: document.getElementById('videoTitle').value,
            caption: document.getElementById('videoCaption').value,
            category: document.getElementById('videoCategory').value,
            tags: document.getElementById('videoTags').value
                .split(',')
                .map(t => t.trim())
                .filter(t => t),
            thumbnail: document.getElementById('videoThumbnail').value,
            userId: currentUser.uid,
            userName: currentUser.displayName,
            userEmail: currentUser.email,
            userPhotoURL: currentUser.photoURL,
            timestamp: new Date(),
            views: 0,
            likes: 0,
            comments: []
        };
        
        const docRef = await addDoc(collection(db, 'videos'), videoData);
        
        alert('✅ Video published successfully!');
        postModal.classList.add('hidden');
        postForm.reset();
        
        await loadAllVideos();
        
        postBtn.disabled = false;
        postBtn.textContent = '+ Post Video';
    } catch (error) {
        console.error('Error posting video:', error);
        alert('Failed to publish video');
        postBtn.disabled = false;
        postBtn.textContent = '+ Post Video';
    }
});

// ============= PROFILE =============
profileBtn.addEventListener('click', async () => {
    if (!currentUser) return;
    
    document.getElementById('profileAvatar').src = currentUser.photoURL || 'https://via.placeholder.com/80';
    document.getElementById('profileName').textContent = currentUser.displayName;
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    // Load user videos
    const userVideos = allVideos.filter(v => v.userId === currentUser.uid);
    let totalViews = 0;
    userVideos.forEach(v => totalViews += v.views || 0);
    
    document.getElementById('profileVideoCount').textContent = userVideos.length;
    document.getElementById('profileFollowerCount').textContent = Object.keys(userFollowers).length;
    document.getElementById('profileFollowingCount').textContent = followingUsers.size;
    document.getElementById('profileTotalViews').textContent = totalViews;
    
    // Render user videos
    const grid = document.getElementById('profileVideosGrid');
    grid.innerHTML = '';
    userVideos.forEach(video => {
        grid.appendChild(createVideoCard(video));
    });
    
    profileModal.classList.remove('hidden');
});

document.getElementById('closeProfileBtn').addEventListener('click', () => {
    profileModal.classList.add('hidden');
});

document.getElementById('signOutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        profileModal.classList.add('hidden');
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// ============= SETTINGS =============
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

document.getElementById('closeSettingsBtn').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

// ============= SECTION LOADING =============
async function loadBookmarks() {
    const grid = document.getElementById('bookmarksGrid');
    const bookmarked = allVideos.filter(v => bookmarkedVideos.has(v.id));
    
    grid.innerHTML = '';
    bookmarked.forEach(video => {
        grid.appendChild(createVideoCard(video));
    });
}

async function loadFollowingVideos() {
    const grid = document.getElementById('followingGrid');
    const followingVideos = allVideos.filter(v => followingUsers.has(v.userId));
    
    grid.innerHTML = '';
    if (followingVideos.length === 0) {
        grid.innerHTML = '<p>Start following creators to see their videos</p>';
    } else {
        followingVideos.forEach(video => {
            grid.appendChild(createVideoCard(video));
        });
    }
}

async function loadTrending() {
    const grid = document.getElementById('trendingGrid');
    const trending = [...allVideos]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 20);
    
    grid.innerHTML = '';
    trending.forEach(video => {
        grid.appendChild(createVideoCard(video));
    });
}

async function loadDiscoverCategories() {
    const categories = ['tech', 'education', 'entertainment', 'business', 'other'];
    const grid = document.getElementById('discoverGrid');
    
    grid.innerHTML = '';
    grid.className = 'category-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    grid.style.gap = 'var(--spacing-lg)';
    grid.style.padding = 'var(--spacing-lg)';
    
    categories.forEach(cat => {
        const count = allVideos.filter(v => v.category === cat).length;
        const card = document.createElement('div');
        card.style.cssText = `
            padding: 24px;
            background: var(--bg-tertiary);
            border-radius: 8px;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
        `;
        card.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 12px;">📹</div>
            <h3 style="font-size: 16px; font-weight: 600; text-transform: capitalize; margin-bottom: 8px;">${cat}</h3>
            <p style="color: var(--text-tertiary); font-size: 13px;">${count} videos</p>
        `;
        
        card.addEventListener('click', () => {
            document.querySelector(`[data-category="${cat}"]`).click();
            document.querySelector('[data-section="feed"]').click();
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = 'none';
        });
        
        grid.appendChild(card);
    });
}

// ============= MODAL CLOSE BUTTONS =============
document.getElementById('closeVideoBtn').addEventListener('click', () => {
    videoModal.classList.add('hidden');
});

videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
        videoModal.classList.add('hidden');
    }
});

postModal.addEventListener('click', (e) => {
    if (e.target === postModal) {
        postModal.classList.add('hidden');
    }
});

profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        profileModal.classList.add('hidden');
    }
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// ============= UTILITY FUNCTIONS =============
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(date) {
    if (!date) return '';
    
    const now = new Date();
    const diff = now - new Date(date);
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

async function loadUserData() {
    // Load bookmarks from localStorage
    const saved = localStorage.getItem('bookmarks');
    if (saved) {
        bookmarkedVideos = new Set(JSON.parse(saved));
    }
    
    // Load following from localStorage
    const savedFollowing = localStorage.getItem('following');
    if (savedFollowing) {
        followingUsers = new Set(JSON.parse(savedFollowing));
    }
}

console.log('✅ Scroll platform loaded');
