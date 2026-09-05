// let posts = [];
// let currentUser = "user";


// function loadData() {
//     const saved = localStorage.getItem('posts');
//     if (saved) posts = JSON.parse(saved);
//     const savedUser = localStorage.getItem('currentUser');
//     if (savedUser) currentUser = savedUser;
// }


// function getRemainingTime(post) {
//     const now = Date.now();
//     const expiresAt = post.createdAt + (post.lifeTime * 60 * 60 * 1000);
//     const remaining = expiresAt - now;
//     if (remaining <= 0) return "0ч";
//     const hours = Math.floor(remaining / (60 * 60 * 1000));
//     const days = Math.floor(hours / 24);
//     if (days > 0) return days + "д " + (hours % 24) + "ч";
//     return hours + "ч";
// }


// const confirmOverlay = document.getElementById('confirmOverlayProfile');
// const confirmMessage = document.getElementById('confirmMessageProfile');
// const confirmOk = document.getElementById('confirmOkProfile');
// const confirmCancel = document.getElementById('confirmCancelProfile');

// let confirmCallback = null;

// function showConfirm(message, callback) {
//     confirmMessage.textContent = message;
//     confirmOverlay.classList.add('active');
//     confirmCallback = callback;
// }

// confirmOk.onclick = function() {
//     confirmOverlay.classList.remove('active');
//     if (confirmCallback) confirmCallback(true);
// };

// confirmCancel.onclick = function() {
//     confirmOverlay.classList.remove('active');
//     if (confirmCallback) confirmCallback(false);
// };

// confirmOverlay.onclick = function(e) {
//     if (e.target === confirmOverlay) {
//         confirmOverlay.classList.remove('active');
//         if (confirmCallback) confirmCallback(false);
//     }
// };


// function saveData() {
//     localStorage.setItem('posts', JSON.stringify(posts));
//     localStorage.setItem('currentUser', currentUser);
// }


// function renderProfilePosts() {
//     const container = document.getElementById('profile-feed');
//     const emptyText = document.getElementById('empty-text');

//     if (!container) return;

//     loadData();

//     const userPosts = posts.filter(function(post) {
//         return post.author === currentUser;
//     });

 
//     if (userPosts.length === 0) {
//         document.getElementById('statPosts').textContent = '0';
//         document.getElementById('statLikes').textContent = '0';
//         document.getElementById('statViews').textContent = '0';
//     } else {
//         const totalPosts = userPosts.length;
//         const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
//         const totalViews = userPosts.reduce((sum, p) => sum + (p.views || 0), 0);

//         document.getElementById('statPosts').textContent = totalPosts;
//         document.getElementById('statLikes').textContent = totalLikes;
//         document.getElementById('statViews').textContent = totalViews;
//     }

//     if (userPosts.length === 0) {
//         if (emptyText) emptyText.style.display = 'block';
//         container.innerHTML = '';
//         return;
//     }

//     if (emptyText) emptyText.style.display = 'none';

//     const nameSpan = document.getElementById('profile-username');
//     if (nameSpan) nameSpan.textContent = currentUser;

//     container.innerHTML = '';

//     userPosts.forEach(function(post) {
//         const postDiv = document.createElement('div');
//         postDiv.className = 'profile-post-card';

//         const remaining = getRemainingTime(post);

//         let imageHtml = '';
//         if (post.image) {
//             imageHtml = '<img src="' + post.image + '" class="profile-post-image">';
//         }

//         postDiv.innerHTML = `
//             <div class="profile-post-header">
//                 <span class="profile-post-author">${post.author}</span>
//                 <span class="profile-post-time">
//                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                         <circle cx="12" cy="12" r="10" />
//                         <polyline points="12 6 12 12 16 14" />
//                     </svg>
//                     ${remaining}
//                 </span>
//                 <button class="delete-post-btn" data-post-id="${post.id}">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                         <polyline points="3 6 5 6 21 6" />
//                         <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
//                     </svg>
//                 </button>
//             </div>
//             <div class="profile-post-text">${post.text}</div>
//             ${imageHtml}
//             <div class="profile-post-stats">
//                 <span class="stat-item">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                         <polyline points="18 15 12 9 6 15" />
//                     </svg>
//                     ${post.likes || 0}
//                 </span>
//                 <span class="stat-item">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                         <polyline points="6 9 12 15 18 9" />
//                     </svg>
//                     ${post.dislikes || 0}
//                 </span>
//                 <span class="stat-item">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//                         <circle cx="12" cy="12" r="3" />
//                     </svg>
//                     ${post.views || 0}
//                 </span>
//                 <span class="stat-item">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                         <circle cx="12" cy="12" r="10" />
//                         <polyline points="12 6 12 12 16 14" />
//                     </svg>
//                     ${post.lifeTime || 24}ч
//                 </span>
//             </div>
//         `;

//         container.appendChild(postDiv);
//     });
// }


// document.addEventListener('click', function(e) {
//     const deleteBtn = e.target.closest('.delete-post-btn');
//     if (!deleteBtn) return;

//     const postId = parseInt(deleteBtn.dataset.postId);
//     if (!postId) return;

//     showConfirm('Удалить этот пост?', function(confirmed) {
//         if (confirmed) {
//             const index = posts.findIndex(p => p.id === postId);
//             if (index !== -1) {
//                 posts.splice(index, 1);
//                 saveData();
//                 renderProfilePosts();
//             }
//         }
//     });
// });

// document.addEventListener('DOMContentLoaded', function() {
//     renderProfilePosts();
// });










// ============================================
//   ATTENTION — ПРОФИЛЬ (FIREBASE)
// ============================================

let posts = [];
let currentUser = "";

// ===== ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ =====
function loadUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        console.log('✅ currentUser загружен:', currentUser);
    } else {
        console.warn('⚠️ currentUser не найден в localStorage');
        window.location.href = 'login.html';
    }
}

// ===== ЗАГРУЗКА ПОСТОВ ИЗ FIRESTORE =====
async function loadPosts() {
    try {
        const snapshot = await window.db.collection('posts')
            .orderBy('createdAt', 'desc')
            .get();
        
        posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('✅ Постов загружено:', posts.length);
        console.log('👤 Текущий пользователь:', currentUser);
        console.log('📝 Посты пользователя:', posts.filter(p => p.author === currentUser));
        
        renderProfilePosts();
    } catch (error) {
        console.error('❌ Ошибка загрузки постов:', error);
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
    if (days > 0) return days + "д " + (hours % 24) + "ч";
    return hours + "ч";
}

// ===== ОТРИСОВКА ПОСТОВ В ПРОФИЛЕ =====
function renderProfilePosts() {
    const container = document.getElementById('profile-feed');
    const emptyText = document.getElementById('empty-text');

    if (!container) {
        console.error('❌ Контейнер #profile-feed не найден');
        return;
    }

    // Фильтруем посты текущего пользователя
    const userPosts = posts.filter(p => p.author === currentUser);
    console.log('📝 Постов для отображения:', userPosts.length);

    // ===== СТАТИСТИКА =====
    const totalPosts = userPosts.length;
    const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalViews = userPosts.reduce((sum, p) => sum + (p.views || 0), 0);

    const statPosts = document.getElementById('statPosts');
    const statLikes = document.getElementById('statLikes');
    const statViews = document.getElementById('statViews');
    if (statPosts) statPosts.textContent = totalPosts;
    if (statLikes) statLikes.textContent = totalLikes;
    if (statViews) statViews.textContent = totalViews;

    if (userPosts.length === 0) {
        if (emptyText) emptyText.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    if (emptyText) emptyText.style.display = 'none';

    const nameSpan = document.getElementById('profile-username');
    if (nameSpan) nameSpan.textContent = currentUser;

    container.innerHTML = '';

    userPosts.forEach(function(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'profile-post-card';

        const remaining = getRemainingTime(post);

        let imageHtml = '';
        if (post.image) {
            imageHtml = '<img src="' + post.image + '" class="profile-post-image">';
        }

        postDiv.innerHTML = `
            <div class="profile-post-header">
                <span class="profile-post-author">${post.author}</span>
                <span class="profile-post-time">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    ${remaining}
                </span>
                <button class="delete-post-btn" data-post-id="${post.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
            <div class="profile-post-text">${post.text}</div>
            ${imageHtml}
            <div class="profile-post-stats">
                <span class="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                    ${post.likes || 0}
                </span>
                <span class="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                    ${post.dislikes || 0}
                </span>
                <span class="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    ${post.views || 0}
                </span>
                <span class="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    ${post.lifeTime || 24}ч
                </span>
            </div>
        `;

        container.appendChild(postDiv);
    });
}

// ===== УДАЛЕНИЕ ПОСТА =====
document.addEventListener('click', function(e) {
    const deleteBtn = e.target.closest('.delete-post-btn');
    if (!deleteBtn) return;

    const postId = parseInt(deleteBtn.dataset.postId);
    if (!postId) return;

    if (confirm('Удалить этот пост?')) {
        window.db.collection('posts').doc(String(postId)).delete()
            .then(() => {
                posts = posts.filter(p => p.id !== postId);
                renderProfilePosts();
            })
            .catch(err => console.error('Ошибка удаления:', err));
    }
});

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', function() {
    loadUser();
    loadPosts();
});