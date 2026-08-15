
// ===== ДАННЫЕ =====
let posts = [];
let currentUser = "user";
let subscribedAuthors = [];
let currentReplyTo = null;

// ===== ЗАГРУЗКА / СОХРАНЕНИЕ =====
function loadData() {
  const saved = localStorage.getItem('posts');
  if (saved) posts = JSON.parse(saved);
  
  const savedSub = localStorage.getItem(`subscribed_${currentUser}`);
  if (savedSub) subscribedAuthors = JSON.parse(savedSub);
}

const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = savedUser;
  }


function saveData() {
  localStorage.setItem('posts', JSON.stringify(posts));
  localStorage.setItem(`subscribed_${currentUser}`, JSON.stringify(subscribedAuthors));
   localStorage.setItem('currentUser', currentUser);
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
function removeExpiredPosts() {
  const now = Date.now();
  let changed = false;
  
  posts = posts.filter(post => {
    const expiresAt = post.createdAt + (post.lifeTime * 60 * 60 * 1000);
    if (expiresAt <= now) {
      changed = true;
      return false;
    }
    return true;
  });
  
  if (changed) saveData();
}

// ===== ОТРИСОВКА ЛЕНТЫ =====
function renderFeed() {
  removeExpiredPosts();
  
  const feed = document.getElementById('feed');
  const template = document.getElementById('form');
  const isMyAuthors = document.getElementById('suBTN')?.classList.contains('active');
  
  if (!feed || !template) return;
  feed.innerHTML = '';
  
  let visible = [...posts];
  
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
  
  visible.forEach((post) => {
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

    // ===== ЛАЙК =====
    const likeBtn = postCard.querySelector('.like');
    if (likeBtn) {
      const newLikeBtn = likeBtn.cloneNode(true);
      likeBtn.parentNode.replaceChild(newLikeBtn, likeBtn);
      
      newLikeBtn.onclick = () => {
        if (post.hasLiked) return;
        post.hasLiked = true;
        post.likes = (post.likes || 0) + 1;
        
        if (post.hasDisliked) {
          post.hasDisliked = false;
          post.dislikes = (post.dislikes || 0) - 1;
        }
        
        if (post.author !== currentUser && !subscribedAuthors.includes(post.author)) {
          subscribedAuthors.push(post.author);
        }
        
        saveData();
        renderFeed();
      };
    }
        // ===== ДИЗЛАЙК + ПОДТВЕРЖДЕНИЕ =====
    const dizBtn = postCard.querySelector('.diz');
    if (dizBtn) {
        const newDizBtn = dizBtn.cloneNode(true);
        dizBtn.parentNode.replaceChild(newDizBtn, dizBtn);

        newDizBtn.onclick = () => {
            if (post.hasDisliked) return;

            showConfirm(
                `Скрыть автора "${post.author}" на 45 дней?`,
                function(confirmed) {
                    if (confirmed) {
                        post.hasDisliked = true;
                        post.dislikes = (post.dislikes || 0) + 1;

                        if (post.hasLiked) {
                            post.hasLiked = false;
                            post.likes = (post.likes || 0) - 1;
                        }

                        const hideUntil = Date.now() + (45 * 24 * 60 * 60 * 1000);
                        localStorage.setItem(`hidden_${currentUser}_${post.author}`, hideUntil);

                        saveData();
                        renderFeed();
                    }
                }
            );
        };
    }

    // ===== ПОДТВЕРЖДЕНИЕ СКРЫТИЯ АВТОРА НА 45 ДНЕЙ =====
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOk = document.getElementById('confirmOk');
const confirmCancel = document.getElementById('confirmCancel');

let confirmCallback = null;

window.showConfirm = function(message, callback) {
    confirmMessage.textContent = message;
    confirmOverlay.classList.add('active');
    confirmCallback = callback;
};

confirmOk.onclick = function() {
    confirmOverlay.classList.remove('active');
    if (confirmCallback) confirmCallback(true);
};

confirmCancel.onclick = function() {
    confirmOverlay.classList.remove('active');
    if (confirmCallback) confirmCallback(false);
};

confirmOverlay.onclick = function(e) {
    if (e.target === confirmOverlay) {
        confirmOverlay.classList.remove('active');
        if (confirmCallback) confirmCallback(false);
    }
};
    
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
    
    feed.appendChild(postCard);
    
    if (!post.viewCounted) {
      post.viewCounted = true;
      post.views = (post.views || 0) + 1;
      saveData();
    }
  });
}

// ===== СОЗДАНИЕ ПОСТА =====
function createPost() {
  const descInput = document.querySelector('.des');
  const text = descInput?.value;
  
  if (!text?.trim()) {
    alert('Напиши описание');
    return;
  }
  
  const boost = parseInt(document.querySelector('input[name="boost-plan"]:checked')?.value) || 0;

const newPost = {
    id: Date.now(),
    author: currentUser,
    text: text,
    likes: 0,
    dislikes: 0,
    hasLiked: false,
    hasDisliked: false,
    views: 0,
    viewCounted: false,
    lifeTime: parseInt(document.querySelector('input[name="post-time"]:checked')?.value) || 24,
    replyTo: currentReplyTo || null,
    image: null,
    boost: boost, 
    boostExpiresAt: boost > 0 ? Date.now() + boost * 60 * 60 * 1000 : null, 
    createdAt: Date.now()
  };
  
  const file = document.getElementById('file-upload');
  if (file?.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      newPost.image = e.target.result;
      posts.unshift(newPost);
      currentReplyTo = null;
      saveData();
      renderFeed();
    };
    reader.readAsDataURL(file.files[0]);
  } else {
    posts.unshift(newPost);
    currentReplyTo = null;
    saveData();
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

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderFeed();
  
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
      renderFeed();
    };
  }
  
  if (reBtn) {
    reBtn.onclick = () => {
      reBtn.classList.add('active');
      suBtn?.classList.remove('active');
      renderFeed();
    };
  }
});
// ===== ПОИСК (БЕЗ КОПИЙ) =====
const searchInput = document.querySelector('.search2');
const searchBtn = document.querySelector('.N');
let searchQuery = '';

function searchPosts() {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderFeedWithAnimation(); // перерисовываем с анимацией
}

// ===== ОТРИСОВКА С АНИМАЦИЕЙ =====
function renderFeedWithAnimation() {
    removeExpiredPosts();
    
    const feed = document.getElementById('feed');
    const template = document.getElementById('form');
    const isMyAuthors = document.getElementById('suBTN')?.classList.contains('active');
    
    if (!feed || !template) return;
    feed.innerHTML = '';
    
    // Фильтруем посты (без копий)
    let visible = posts;
    
    // Поиск
    if (searchQuery) {
        visible = visible.filter(post => {
            const textMatch = post.text.toLowerCase().includes(searchQuery);
            const authorMatch = post.author.toLowerCase().includes(searchQuery);
            return textMatch || authorMatch;
        });
    }
    
    // Мои авторы
    if (isMyAuthors) {
        visible = visible.filter(p => subscribedAuthors.includes(p.author));
    }
    
    // Скрытые авторы
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
    
    // ===== СОРТИРОВКА ПО БУСТУ =====
visible.sort((a, b) => {
    const boostA = a.boost || 0;
    const boostB = b.boost || 0;
    return boostB - boostA; // чем больше буст, тем выше
});

    // Отрисовка с анимацией
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
        
        // ===== ЛАЙК =====
        const likeBtn = postCard.querySelector('.like');
        if (likeBtn) {
            const newLikeBtn = likeBtn.cloneNode(true);
            likeBtn.parentNode.replaceChild(newLikeBtn, likeBtn);
            newLikeBtn.onclick = () => {
                const originalPost = posts.find(p => p.id === post.id);
                if (!originalPost) return;
                if (originalPost.hasLiked) return;
                originalPost.hasLiked = true;
                originalPost.likes = (originalPost.likes || 0) + 1;
                if (originalPost.hasDisliked) {
                    originalPost.hasDisliked = false;
                    originalPost.dislikes = (originalPost.dislikes || 0) - 1;
                }
                if (originalPost.author !== currentUser && !subscribedAuthors.includes(originalPost.author)) {
                    subscribedAuthors.push(originalPost.author);
                }
                saveData();
                renderFeedWithAnimation();
            };
        }
        
        // ===== ДИЗЛАЙК + ПОДТВЕРЖДЕНИЕ =====
const dizBtn = postCard.querySelector('.diz');
if (dizBtn) {
    const newDizBtn = dizBtn.cloneNode(true);
    dizBtn.parentNode.replaceChild(newDizBtn, dizBtn);
    
    newDizBtn.onclick = () => {
        const originalPost = posts.find(p => p.id === post.id);
        if (!originalPost) return;
        if (originalPost.hasDisliked) return;

        showConfirm(
            `Скрыть автора "${originalPost.author}" на 45 дней?`,
            function(confirmed) {
                if (confirmed) {
                    originalPost.hasDisliked = true;
                    originalPost.dislikes = (originalPost.dislikes || 0) + 1;

                    if (originalPost.hasLiked) {
                        originalPost.hasLiked = false;
                        originalPost.likes = (originalPost.likes || 0) - 1;
                    }

                    const hideUntil = Date.now() + (45 * 24 * 60 * 60 * 1000);
                    localStorage.setItem(`hidden_${currentUser}_${originalPost.author}`, hideUntil);

                    saveData();
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
        
        // ===== АНИМАЦИЯ ПОЯВЛЕНИЯ =====
        postCard.style.opacity = '0';
        postCard.style.transform = 'translateY(20px) scale(0.96)';
        postCard.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        postCard.style.transitionDelay = (index * 0.04) + 's';
        
        feed.appendChild(postCard);
        
        requestAnimationFrame(() => {
            postCard.style.opacity = '1';
            postCard.style.transform = 'translateY(0) scale(1)';
        });
        
        // Просмотры
        if (!post.viewCounted) {
            const originalPost = posts.find(p => p.id === post.id);
            if (originalPost) {
                originalPost.viewCounted = true;
                originalPost.views = (originalPost.views || 0) + 1;
                saveData();
            }
        }
    });
}

// ===== ПОДКЛЮЧАЕМ ПОИСК =====
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

window.createPost = createPost;
