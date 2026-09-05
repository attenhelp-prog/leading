// ============================================
//   ATTENTION — ОСНОВНАЯ ЛОГИКА (FIREBASE)
// ============================================

// ===== ДАННЫЕ =====
let posts = [];
let currentUser = "user";
let subscribedAuthors = [];
let currentReplyTo = null;

// ===== ПОДПИСКИ (FIRESTORE) =====
async function loadSubscriptions() {
    try {
        const userUid = localStorage.getItem('userUid');
        if (!userUid) return;

        const doc = await window.db.collection('subscriptions').doc(userUid).get();
        if (doc.exists) {
            subscribedAuthors = doc.data().authors || [];
        } else {
            subscribedAuthors = [];
            await window.db.collection('subscriptions').doc(userUid).set({ authors: [] });
        }
        console.log('📚 Подписки загружены:', subscribedAuthors);
    } catch (error) {
        console.error('Ошибка загрузки подписок:', error);
        subscribedAuthors = [];
    }
}

async function saveSubscription() {
    try {
        const userUid = localStorage.getItem('userUid');
        if (!userUid) return;

        await window.db.collection('subscriptions').doc(userUid).set({
            authors: subscribedAuthors
        });
        console.log('💾 Подписки сохранены:', subscribedAuthors);
    } catch (error) {
        console.error('Ошибка сохранения подписок:', error);
    }
}

// ===== ЗАГРУЗКА ПОСТОВ ИЗ FIRESTORE =====
async function loadData() {
    try {
        const snapshot = await window.db.collection('posts')
            .orderBy('createdAt', 'desc')
            .get();
        
        posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            hasLiked: false,
            hasDisliked: false,
            likedBy: doc.data().likedBy || [],
            viewedBy: doc.data().viewedBy || []
        }));
        
        renderFeedWithAnimation();
    } catch (error) {
        console.error('Ошибка загрузки постов:', error);
    }
}

// ===== СОХРАНЕНИЕ ПОСТА В FIRESTORE =====
async function savePostToFirestore(post) {
    try {
        const docRef = await window.db.collection('posts').add(post);
        post.id = docRef.id;
        posts.unshift(post);
        renderFeedWithAnimation();
    } catch (error) {
        console.error('Ошибка сохранения поста:', error);
    }
}

// ===== ОБНОВЛЕНИЕ ПОСТА В FIRESTORE =====
async function updatePostInFirestore(post) {
    try {
        await window.db.collection('posts').doc(post.id).update({
            likes: post.likes || 0,
            dislikes: post.dislikes || 0,
            likedBy: post.likedBy || [],
            viewedBy: post.viewedBy || [],
            views: post.views || 0
        });
    } catch (error) {
        console.error('Ошибка обновления поста:', error);
    }
}

// ===== УДАЛЕНИЕ ПОСТА ИЗ FIRESTORE =====
async function deletePostFromFirestore(postId) {
    try {
        await window.db.collection('posts').doc(postId).delete();
        posts = posts.filter(p => p.id !== postId);
        renderFeedWithAnimation();
    } catch (error) {
        console.error('Ошибка удаления поста:', error);
    }
}

// ===== ОБРАТНЫЙ ОТСЧЁТ =====
function getRemainingTime(post) {
    const now = Date.now();
    const expiresAt = post.createdAt + (post.lifeTime * 60 * 60 * 1000);
    const remaining = expiresAt - now;
    if (remaining <= 0) return "0ч";
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}д ${hours % 24}ч`;
    return `${hours}ч`;
}

// ===== УДАЛЕНИЕ ПРОСРОЧЕННЫХ ПОСТОВ =====
async function removeExpiredPosts() {
    const now = Date.now();
    const expired = posts.filter(post => {
        const expiresAt = post.createdAt + (post.lifeTime * 60 * 60 * 1000);
        return expiresAt <= now;
    });
    
    for (const post of expired) {
        await deletePostFromFirestore(post.id);
    }
}

// ===== ОТРИСОВКА С АНИМАЦИЕЙ =====
function renderFeedWithAnimation() {
    const feed = document.getElementById('feed');
    const template = document.getElementById('form');
    const isMyAuthors = document.getElementById('suBTN')?.classList.contains('active');
    
    if (!feed || !template) return;
    feed.innerHTML = '';
    
    let visible = [...posts];
    
    if (searchQuery) {
        visible = visible.filter(post => {
            const textMatch = post.text.toLowerCase().includes(searchQuery);
            const authorMatch = post.author.toLowerCase().includes(searchQuery);
            return textMatch || authorMatch;
        });
    }
    
    if (isMyAuthors) {
        visible = visible.filter(p => subscribedAuthors.includes(p.author));
    }
    
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`hidden_${currentUser}_`)) {
            const hideUntil = parseInt(localStorage.getItem(key));
            if (hideUntil > now) {
                const author = key.replace(`hidden_${currentUser}_`, '');
                visible = visible.filter(p => p.author !== author);
            } else {
                localStorage.removeItem(key);
            }
        }
    }
    
    // ===== НАЧИСЛЕНИЕ ПРОСМОТРОВ (ПО ID ПОЛЬЗОВАТЕЛЯ) =====
    const userId = localStorage.getItem('userUid');
    if (userId) {
        visible.forEach(post => {
            if (!post.viewedBy || !post.viewedBy.includes(userId)) {
                if (!post.viewedBy) post.viewedBy = [];
                post.viewedBy.push(userId);
                post.views = (post.views || 0) + 1;
                updatePostInFirestore(post);
            }
        });
    }
    
    visible.sort((a, b) => {
        const boostA = a.boost || 0;
        const boostB = b.boost || 0;
        return boostB - boostA;
    });
    
    visible.forEach((post, index) => {
        const card = template.querySelector('.post-card');
        if (!card) return;
        
        const postCard = card.cloneNode(true);
        postCard.setAttribute('data-post-id', post.id);
        
        const nikEl = postCard.querySelector('.nik');
        if (nikEl) nikEl.textContent = post.author;
        
        const timeEl = postCard.querySelector('.time');
        if (timeEl) timeEl.innerHTML = getRemainingTime(post);
        
        const likeCountEl = postCard.querySelector('.like-count');
        if (likeCountEl) likeCountEl.textContent = post.likes || 0;
        
        const dizCountEl = postCard.querySelector('.diz-count');
        if (dizCountEl) dizCountEl.textContent = post.dislikes || 0;
        
        const viewsCountEl = postCard.querySelector('.views-count');
        if (viewsCountEl) viewsCountEl.textContent = post.views || 0;
        
        const descEl = postCard.querySelector('.post-description');
        if (descEl) descEl.textContent = post.text;
        
        const postImageDiv = postCard.querySelector('.post-image');
        if (post.image && postImageDiv) {
            postImageDiv.innerHTML = `<img src="${post.image}" style="max-width:100%; border-radius:12px;">`;
            postImageDiv.style.display = '';
        } else if (postImageDiv) {
            postImageDiv.style.display = 'none';
            postImageDiv.innerHTML = '';
        }
        
        if (post.boost && post.boost > 0) {
            postCard.classList.add('boosted');
        }
        
        // ===== ОТВЕТ (КОНТЕКСТ) =====
        if (post.replyTo) {
            const parentPost = posts.find(p => p.id === post.replyTo);
            if (parentPost) {
                const contextDiv = document.createElement('div');
                contextDiv.className = 'reply-context';
                contextDiv.innerHTML = `
                    <div class="reply-header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Ответ на пост от ${parentPost.author}
                    </div>
                    <div class="reply-text">${parentPost.text}</div>
                `;
                contextDiv.style.cursor = 'pointer';
                contextDiv.onclick = function(e) {
                    e.stopPropagation();
                    const targetPost = document.querySelector(`.post-card[data-post-id="${parentPost.id}"]`);
                    if (targetPost) {
                        targetPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(function() {
                            targetPost.classList.add('highlight');
                            setTimeout(function() {
                                targetPost.classList.remove('highlight');
                            }, 2500);
                        }, 350);
                    }
                };
                const infoEl = postCard.querySelector('.info');
                if (infoEl) postCard.insertBefore(contextDiv, infoEl);
            }
        }
        
        // ===== ЛАЙК (С ID ПОЛЬЗОВАТЕЛЯ) =====
        const likeBtn = postCard.querySelector('.like');
        if (likeBtn) {
            const newLikeBtn = likeBtn.cloneNode(true);
            likeBtn.parentNode.replaceChild(newLikeBtn, likeBtn);
            newLikeBtn.onclick = async () => {
                const originalPost = posts.find(p => p.id === post.id);
                if (!originalPost) return;
                
                const userId = localStorage.getItem('userUid');
                if (!userId) return;
                
                if (originalPost.likedBy && originalPost.likedBy.includes(userId)) return;
                
                if (!originalPost.likedBy) originalPost.likedBy = [];
                originalPost.likedBy.push(userId);
                originalPost.likes = (originalPost.likes || 0) + 1;
                
                if (originalPost.hasDisliked) {
                    originalPost.hasDisliked = false;
                    originalPost.dislikes = (originalPost.dislikes || 0) - 1;
                }
                
                if (originalPost.author !== currentUser && !subscribedAuthors.includes(originalPost.author)) {
                    subscribedAuthors.push(originalPost.author);
                    await saveSubscription();
                }
                
                await updatePostInFirestore(originalPost);
                renderFeedWithAnimation();
            };
        }
        
        // ===== ДИЗЛАЙК (С ID ПОЛЬЗОВАТЕЛЯ) =====
        const dizBtn = postCard.querySelector('.diz');
        if (dizBtn) {
            const newDizBtn = dizBtn.cloneNode(true);
            dizBtn.parentNode.replaceChild(newDizBtn, dizBtn);
            newDizBtn.onclick = () => {
                const originalPost = posts.find(p => p.id === post.id);
                if (!originalPost) return;
                
                const userId = localStorage.getItem('userUid');
                if (!userId) return;
                
                if (originalPost.dislikedBy && originalPost.dislikedBy.includes(userId)) return;

                showConfirm(
                    `Скрыть автора "${originalPost.author}" на 45 дней?`,
                    async function(confirmed) {
                        if (confirmed) {
                            if (!originalPost.dislikedBy) originalPost.dislikedBy = [];
                            originalPost.dislikedBy.push(userId);
                            originalPost.dislikes = (originalPost.dislikes || 0) + 1;
                            
                            if (originalPost.hasLiked) {
                                originalPost.hasLiked = false;
                                originalPost.likes = (originalPost.likes || 0) - 1;
                            }
                            
                            const hideUntil = Date.now() + (45 * 24 * 60 * 60 * 1000);
                            localStorage.setItem(`hidden_${currentUser}_${originalPost.author}`, hideUntil);
                            await updatePostInFirestore(originalPost);
                            renderFeedWithAnimation();
                        }
                    }
                );
            };
        }
        
        // ===== КНОПКА ОТВЕТИТЬ =====
        const replyBtn = document.createElement('button');
        replyBtn.className = 'reply-btn';
        replyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Ответить
        `;
        replyBtn.onclick = () => {
            currentReplyTo = post.id;
            document.querySelector('.overlay').classList.add('active');
        };
        postCard.appendChild(replyBtn);
        
        postCard.style.opacity = '0';
        postCard.style.transform = 'translateY(20px) scale(0.96)';
        postCard.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        postCard.style.transitionDelay = (index * 0.04) + 's';
        
        feed.appendChild(postCard);
        
        requestAnimationFrame(() => {
            postCard.style.opacity = '1';
            postCard.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ===== СОЗДАНИЕ ПОСТА =====
async function createPost() {
    const descInput = document.querySelector('.des');
    const text = descInput?.value;
    
    if (!text?.trim()) {
        alert('Напиши описание');
        return;
    }
    
    const boost = parseInt(document.querySelector('input[name="boost-plan"]:checked')?.value) || 0;
    const lifeTime = parseInt(document.querySelector('input[name="post-time"]:checked')?.value) || 24;
    
    const newPost = {
        author: currentUser,
        text: text,
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        viewedBy: [],
        hasLiked: false,
        hasDisliked: false,
        views: 0,
        viewCounted: false,
        lifeTime: lifeTime,
        replyTo: currentReplyTo || null,
        image: null,
        boost: boost,
        boostExpiresAt: boost > 0 ? Date.now() + boost * 60 * 60 * 1000 : null,
        createdAt: Date.now()
    };
    
    const file = document.getElementById('file-upload');
    if (file?.files[0]) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            newPost.image = e.target.result;
            await savePostToFirestore(newPost);
            currentReplyTo = null;
            renderFeedWithAnimation();
        };
        reader.readAsDataURL(file.files[0]);
    } else {
        await savePostToFirestore(newPost);
        currentReplyTo = null;
        renderFeedWithAnimation();
    }
    
    if (descInput) descInput.value = '';
    if (file) file.value = '';
    
    const previewLabel = document.getElementById('preview-label');
    if (previewLabel) {
        previewLabel.style.backgroundImage = '';
    }
    const uploadText = document.getElementById('upload-text');
    if (uploadText) uploadText.style.display = 'block';
    
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.classList.remove('active');
}

// ===== ПОДТВЕРЖДЕНИЕ =====
function showConfirm(message, callback) {
    const overlay = document.getElementById('confirmOverlay');
    const messageEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');

    if (!overlay || !messageEl || !okBtn || !cancelBtn) {
        if (confirm(message)) {
            callback(true);
        } else {
            callback(false);
        }
        return;
    }

    messageEl.textContent = message;
    overlay.classList.add('active');

    const newOk = okBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newOk.onclick = function() {
        overlay.classList.remove('active');
        callback(true);
    };

    newCancel.onclick = function() {
        overlay.classList.remove('active');
        callback(false);
    };

    overlay.onclick = function(e) {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            callback(false);
        }
    };
}

// ===== ПОИСК =====
const searchInput = document.querySelector('.search2');
const searchBtn = document.querySelector('.N');
let searchQuery = '';

function searchPosts() {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderFeedWithAnimation();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    // ===== ПРОВЕРКА АВТОРИЗАЦИИ =====
    const userUid = localStorage.getItem('userUid');
    if (!userUid) {
        window.location.href = 'login.html';
        return;
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) currentUser = savedUser;

    // ===== ЗАГРУЗКА ПОДПИСОК =====
    loadSubscriptions().then(() => {
        loadData();
    });

    const addBtn = document.getElementById('addPostBtn');
    if (addBtn) {
        addBtn.onclick = () => {
            document.querySelector('.overlay')?.classList.add('active');
        };
    }
    
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        };
    }
    
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.querySelector('.overlay')?.classList.remove('active');
        };
    }
    
    const publishBtn = document.querySelector('.go');
    if (publishBtn) {
        publishBtn.onclick = createPost;
    }
    
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
        fileInput.onchange = (e) => {
            if (e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = ev => {
                    const label = document.getElementById('preview-label');
                    if (label) {
                        label.style.backgroundImage = `url('${ev.target.result}')`;
                        label.style.backgroundSize = 'cover';
                    }
                    const uploadText = document.getElementById('upload-text');
                    if (uploadText) uploadText.style.display = 'none';
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
    }
    
    const suBtn = document.getElementById('suBTN');
    const reBtn = document.getElementById('reBTN');
    
    if (suBtn) {
        suBtn.onclick = () => {
            suBtn.classList.add('active');
            reBtn?.classList.remove('active');
            renderFeedWithAnimation();
        };
    }
    
    if (reBtn) {
        reBtn.onclick = () => {
            reBtn.classList.add('active');
            suBtn?.classList.remove('active');
            renderFeedWithAnimation();
        };
    }
    
    if (searchBtn) {
        searchBtn.onclick = searchPosts;
    }
    
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                searchPosts();
            }
        });
    }
});

window.createPost = createPost;