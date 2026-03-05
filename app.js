// Pyro Scroll - Main Application
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
    doc
} from './firebase-config.js';

// DOM Elements
const authContainer = document.getElementById('authContainer');
const feedContainer = document.getElementById('feedContainer');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const postBtn = document.getElementById('postBtn');
const profileBtn = document.getElementById('profileBtn');
const userAvatar = document.getElementById('userAvatar');
const videoFeed = document.getElementById('videoFeed');
const postModal = document.getElementById('postModal');
const profileModal = document.getElementById('profileModal');
const videoModal = document.getElementById('videoModal');
const postForm = document.getElementById('postForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const closeVideoBtn = document.getElementById('closeVideoBtn');
const signOutBtn = document.getElementById('signOutBtn');
const loadingIndicator = document.getElementById('loadingIndicator');

// State
let currentUser = null;
let loadedVideos = [];
let lastVisibleDoc = null;
let isLoadingMore = false;

// ============= AUTH HANDLERS =============
googleSignInBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('User signed in:', result.user);
    } catch (error) {
        console.error('Sign in error:', error);
        alert('Failed to sign in. Please try again.');
    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        authContainer.classList.add('hidden');
        feedContainer.classList.remove('hidden');
        userAvatar.src = user.photoURL || 'https://via.placeholder.com/44';
        await loadVideos();
    } else {
        currentUser = null;
        authContainer.classList.remove('hidden');
        feedContainer.classList.add('hidden');
        loadedVideos = [];
    }
});

signOutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        profileModal.classList.add('hidden');
    } catch (error) {
        console.error('Sign out error:', error);
    }
});

// ============= MODAL HANDLERS =============
postBtn.addEventListener('click', () => {
    postModal.classList.remove('hidden');
});

profileBtn.addEventListener('click', async () => {
    if (currentUser) {
        await updateProfileModal();
        profileModal.classList.remove('hidden');
    }
});

closeModalBtn.addEventListener('click', () => {
    postModal.classList.add('hidden');
    postForm.reset();
    document.getElementById('tagsList').innerHTML = '';
    document.getElementById('charCount').textContent = '0/500';
});

closeProfileBtn.addEventListener('click', () => {
    profileModal.classList.add('hidden');
});

closeVideoBtn.addEventListener('click', () => {
    videoModal.classList.add('hidden');
    document.getElementById('modalVideo').pause();
});

// Close modals on background click
postModal.addEventListener('click', (e) => {
    if (e.target === postModal) {
        closeModalBtn.click();
    }
});

profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        closeProfileBtn.click();
    }
});

videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
        closeVideoBtn.click();
    }
});

// ============= POST FORM HANDLERS =============
const captionInput = document.getElementById('caption');
const charCount = document.getElementById('charCount');
const tagsInput = document.getElementById('tags');
const tagsList = document.getElementById('tagsList');

captionInput.addEventListener('input', () => {
    const count = captionInput.value.length;
    charCount.textContent = `${count}/500`;
});

tagsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tag = tagsInput.value.trim().replace(',', '');
        if (tag && tag.length > 0) {
            addTag(tag);
            tagsInput.value = '';
        }
    }
});

function addTag(tag) {
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        ${tag}
        <button type="button">×</button>
    `;
    
    tagElement.querySelector('button').addEventListener('click', () => {
        tagElement.remove();
    });
    
    tagsList.appendChild(tagElement);
}

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please sign in first');
        return;
    }
    
    const videoUrl = document.getElementById('videoUrl').value;
    const caption = document.getElementById('caption').value;
    const thumbnail = document.getElementById('thumbnail').value;
    
    const tags = Array.from(document.querySelectorAll('#tagsList .tag'))
        .map(el => el.textContent.trim().replace('×', '').trim());
    
    if (!videoUrl) {
        alert('Please enter a video URL');
        return;
    }
    
    try {
        loadingIndicator.classList.remove('hidden');
        
        const videoData = {
            videoUrl,
            caption,
            thumbnail: thumbnail || `https://img.youtube.com/vi/${extractVideoId(videoUrl)}/maxresdefault.jpg`,
            tags,
            userId: currentUser.uid,
            userName: currentUser.displayName,
            userEmail: currentUser.email,
            userPhotoURL: currentUser.photoURL,
            timestamp: new Date(),
            views: 0,
            likes: 0
        };
        
        const docRef = await addDoc(collection(db, 'videos'), videoData);
        console.log('Video posted:', docRef.id);
        
        loadingIndicator.classList.add('hidden');
        postModal.classList.add('hidden');
        postForm.reset();
        document.getElementById('tagsList').innerHTML = '';
        document.getElementById('charCount').textContent = '0/500';
        
        // Reload videos
        loadedVideos = [];
        lastVisibleDoc = null;
        videoFeed.innerHTML = '';
        await loadVideos();
        
        alert('🔥 Video posted to Pyro Scroll!');
    } catch (error) {
        loadingIndicator.classList.add('hidden');
        console.error('Error posting video:', error);
        alert('Failed to post video. Please try again.');
    }
});

// ============= VIDEO FEED HANDLERS =============
async function loadVideos() {
    if (isLoadingMore) return;
    isLoadingMore = true;
    loadingIndicator.classList.remove('hidden');
    
    try {
        const q = query(
            collection(db, 'videos'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );
        
        const snapshot = await getDocs(q);
        lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
        
        snapshot.forEach((doc) => {
            const video = doc.data();
            video.id = doc.id;
            loadedVideos.push(video);
            renderVideo(video);
        });
        
        loadingIndicator.classList.add('hidden');
    } catch (error) {
        console.error('Error loading videos:', error);
        loadingIndicator.classList.add('hidden');
    }
    
    isLoadingMore = false;
}

function renderVideo(video) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    const tagsHTML = video.tags && video.tags.length > 0 
        ? video.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')
        : '';
    
    videoCard.innerHTML = `
        <div class="video-player">
            ${video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')
                ? `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${extractVideoId(video.videoUrl)}" 
                    frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0;"></iframe>`
                : `<video class="video-element" data-video-id="${video.id}" 
                    src="${video.videoUrl}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;"></video>`
            }
            <div class="video-overlay">
                <div class="video-meta">
                    <div class="user-info">
                        <img src="${video.userPhotoURL}" alt="${video.userName}" class="user-avatar">
                        <div class="user-details">
                            <h3>${video.userName}</h3>
                            <p>@${video.userEmail.split('@')[0]}</p>
                        </div>
                    </div>
                    ${video.userId !== currentUser.uid ? '<button class="follow-btn">Follow</button>' : ''}
                </div>
                
                ${video.caption ? `<div class="video-caption">${escapeHtml(video.caption)}</div>` : ''}
                
                ${tagsHTML ? `<div class="video-tags">${tagsHTML}</div>` : ''}
            </div>
            
            <div class="video-actions">
                <button class="action-btn like-btn" data-video-id="${video.id}">
                    <span>❤️</span>
                    <span class="like-count">${video.likes || 0}</span>
                </button>
                <button class="action-btn comment-btn">
                    <span>💬</span>
                    <span>0</span>
                </button>
                <button class="action-btn share-btn">
                    <span>🔗</span>
                    <span>0</span>
                </button>
            </div>
        </div>
    `;
    
    videoFeed.appendChild(videoCard);
    
    // Add video click handler
    const videoElement = videoCard.querySelector('.video-element');
    if (videoElement) {
        videoElement.addEventListener('click', () => {
            playVideoModal(video.videoUrl);
        });
    }
    
    // Add like handler
    const likeBtn = videoCard.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', async () => {
            await likeVideo(video.id, likeBtn);
        });
    }
}

function playVideoModal(videoUrl) {
    const modalVideo = document.getElementById('modalVideo');
    modalVideo.src = videoUrl;
    videoModal.classList.remove('hidden');
    modalVideo.play();
}

async function likeVideo(videoId, button) {
    try {
        const videoRef = doc(db, 'videos', videoId);
        const video = loadedVideos.find(v => v.id === videoId);
        
        if (video) {
            const newLikes = (video.likes || 0) + 1;
            await updateDoc(videoRef, {
                likes: newLikes
            });
            
            video.likes = newLikes;
            button.querySelector('.like-count').textContent = newLikes;
            button.style.color = '#ff69b4';
        }
    } catch (error) {
        console.error('Error liking video:', error);
    }
}

// ============= PROFILE MODAL =============
async function updateProfileModal() {
    if (!currentUser) return;
    
    try {
        // Set basic profile info
        document.getElementById('profileAvatar').src = currentUser.photoURL || 'https://via.placeholder.com/80';
        document.getElementById('profileName').textContent = currentUser.displayName;
        document.getElementById('profileEmail').textContent = currentUser.email;
        
        // Get user's posts
        const userPostsRef = collection(db, 'videos');
        const q = query(userPostsRef, where('userId', '==', currentUser.uid), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        
        const postsCount = snapshot.size;
        let viewsCount = 0;
        
        const userPostsContainer = document.getElementById('userPosts');
        userPostsContainer.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const video = doc.data();
            viewsCount += video.views || 0;
            
            const postItem = document.createElement('div');
            postItem.className = 'user-post-item';
            postItem.innerHTML = `
                <img src="${video.thumbnail}" alt="Post">
                <div class="user-post-info">
                    <p>${escapeHtml(video.caption || 'No caption')}</p>
                    <p style="color: var(--text-secondary); font-size: 11px;">
                        ${video.likes || 0} likes • ${video.views || 0} views
                    </p>
                </div>
            `;
            userPostsContainer.appendChild(postItem);
        });
        
        document.getElementById('postsCount').textContent = postsCount;
        document.getElementById('viewsCount').textContent = viewsCount;
    } catch (error) {
        console.error('Error updating profile modal:', error);
    }
}

// ============= INFINITE SCROLL =============
videoFeed.addEventListener('scroll', async () => {
    const { scrollTop, scrollHeight, clientHeight } = videoFeed;
    
    if (scrollHeight - scrollTop - clientHeight < 500 && !isLoadingMore) {
        // Load more videos when near bottom
        await loadMoreVideos();
    }
});

async function loadMoreVideos() {
    if (isLoadingMore || !lastVisibleDoc) return;
    isLoadingMore = true;
    
    try {
        const q = query(
            collection(db, 'videos'),
            orderBy('timestamp', 'desc'),
            where('timestamp', '<', lastVisibleDoc.data().timestamp),
            limit(10)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.docs.length === 0) {
            console.log('No more videos to load');
            isLoadingMore = false;
            return;
        }
        
        lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
        
        snapshot.forEach((doc) => {
            const video = doc.data();
            video.id = doc.id;
            loadedVideos.push(video);
            renderVideo(video);
        });
    } catch (error) {
        console.error('Error loading more videos:', error);
    }
    
    isLoadingMore = false;
}

// ============= UTILITY FUNCTIONS =============
function extractVideoId(url) {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : '';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============= INITIALIZATION =============
console.log('🔥 Pyro Scroll initialized. Ready to burn.');
