// Application State
const state = {
  currentCategory: '전체',
  currentStatus: '전체',
  currentSort: 'latest',
  searchQuery: '',
  posts: [],
  currentPost: null,
  pendingAction: null // { type: 'edit' | 'delete', postId }
};

// DOM Elements
const openWriteModalBtn = document.getElementById('openWriteModalBtn');
const writeModal = document.getElementById('writeModal');
const writeForm = document.getElementById('writeForm');
const writeModalTitle = document.getElementById('writeModalTitle');
const editPostId = document.getElementById('editPostId');
const postCategory = document.getElementById('postCategory');
const postStatus = document.getElementById('postStatus');
const statusGroup = document.getElementById('statusGroup');
const postTitle = document.getElementById('postTitle');
const postAuthor = document.getElementById('postAuthor');
const postAnonymous = document.getElementById('postAnonymous');
const postPassword = document.getElementById('postPassword');
const postContent = document.getElementById('postContent');
const savePostBtn = document.getElementById('savePostBtn');

const detailModal = document.getElementById('detailModal');
const detailCategory = document.getElementById('detailCategory');
const detailStatus = document.getElementById('detailStatus');
const detailTitle = document.getElementById('detailTitle');
const detailAuthor = document.getElementById('detailAuthor');
const detailCreatedAt = document.getElementById('detailCreatedAt');
const detailViews = document.getElementById('detailViews');
const detailContent = document.getElementById('detailContent');
const detailLikes = document.getElementById('detailLikes');
const likeBtn = document.getElementById('likeBtn');
const editPostBtn = document.getElementById('editPostBtn');
const deletePostBtn = document.getElementById('deletePostBtn');

const passwordModal = document.getElementById('passwordModal');
const passwordForm = document.getElementById('passwordForm');
const passwordModalTitle = document.getElementById('passwordModalTitle');
const passwordModalDesc = document.getElementById('passwordModalDesc');
const verifyPasswordInput = document.getElementById('verifyPasswordInput');

const postsList = document.getElementById('postsList');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const categoryTabs = document.getElementById('categoryTabs');
const statusFilter = document.getElementById('statusFilter');
const sortFilter = document.getElementById('sortFilter');
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  fetchPosts();
});

function initEventListeners() {
  // Open write modal
  openWriteModalBtn.addEventListener('click', () => openWriteModal());

  // Anonymous checkbox toggle
  postAnonymous.addEventListener('change', (e) => {
    if (e.target.checked) {
      postAuthor.value = '';
      postAuthor.disabled = true;
      postAuthor.placeholder = '익명으로 등록됩니다';
    } else {
      postAuthor.disabled = false;
      postAuthor.placeholder = '이름 또는 닉네임';
    }
  });

  // Category changed in write form
  postCategory.addEventListener('change', (e) => {
    if (e.target.value === '공지사항') {
      postStatus.value = '공지';
    } else if (postStatus.value === '공지') {
      postStatus.value = '접수대기';
    }
  });

  // Write Form Submit (Create or Update)
  writeForm.addEventListener('submit', handleSavePost);

  // Category Tabs
  categoryTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentCategory = btn.dataset.category;
    fetchPosts();
  });

  // Status Filter
  statusFilter.addEventListener('change', (e) => {
    state.currentStatus = e.target.value;
    fetchPosts();
  });

  // Sort Filter
  sortFilter.addEventListener('change', (e) => {
    state.currentSort = e.target.value;
    fetchPosts();
  });

  // Search Input with debounce
  let searchTimeout = null;
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    searchClearBtn.style.display = val ? 'block' : 'none';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = val.trim();
      fetchPosts();
    }, 300);
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    state.searchQuery = '';
    fetchPosts();
  });

  // Like button
  likeBtn.addEventListener('click', handleLikePost);

  // Edit / Delete in Detail Modal
  editPostBtn.addEventListener('click', () => {
    if (!state.currentPost) return;
    openPasswordModal('edit', state.currentPost.id);
  });

  deletePostBtn.addEventListener('click', () => {
    if (!state.currentPost) return;
    openPasswordModal('delete', state.currentPost.id);
  });

  // Password confirmation form submit
  passwordForm.addEventListener('submit', handlePasswordSubmit);

  // Close modals on clicking outside
  [writeModal, detailModal, passwordModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

// Fetch Posts from Server
async function fetchPosts() {
  try {
    const params = new URLSearchParams({
      category: state.currentCategory,
      status: state.currentStatus,
      sort: state.currentSort,
      search: state.searchQuery
    });

    const response = await fetch(`/api/posts?${params.toString()}`);
    const result = await response.json();

    if (result.success) {
      state.posts = result.data;
      renderPosts(result.data);
    } else {
      showToast(result.message || '게시글 목록을 불러오지 못했습니다.', 'error');
    }
  } catch (err) {
    console.error('Fetch posts failed:', err);
    showToast('서버와의 통신에 실패했습니다.', 'error');
  }
}

// Render Posts List
function renderPosts(posts) {
  totalCount.textContent = posts.length;

  if (posts.length === 0) {
    postsList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  postsList.innerHTML = posts.map(post => {
    const isNotice = post.category === '공지사항';
    const relativeTime = formatRelativeTime(post.createdAt);

    return `
      <article class="post-card ${isNotice ? 'notice-card' : ''}" onclick="openDetailModal(${post.id})">
        <div class="post-card-header">
          <div class="badge-group">
            <span class="category-badge" data-cat="${escapeHtml(post.category)}">${escapeHtml(post.category)}</span>
            <span class="status-badge status-${escapeHtml(post.status)}">${escapeHtml(post.status)}</span>
          </div>
          <span class="post-time">${relativeTime}</span>
        </div>

        <h3 class="post-card-title">
          ${isNotice ? '<i class="fa-solid fa-bullhorn" style="color: #8b5cf6; font-size: 0.95rem;"></i>' : ''}
          ${escapeHtml(post.title)}
        </h3>

        <p class="post-card-snippet">${escapeHtml(post.content)}</p>

        <div class="post-card-footer">
          <div class="card-footer-left">
            <span class="author-chip">
              <i class="fa-regular fa-user" style="margin-right: 4px;"></i>${escapeHtml(post.author)}
            </span>
          </div>
          <div class="card-footer-right">
            <span class="meta-count" title="조회수">
              <i class="fa-regular fa-eye"></i> ${post.views || 0}
            </span>
            <span class="meta-count" title="공감/추천">
              <i class="fa-regular fa-thumbs-up"></i> ${post.likes || 0}
            </span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Open Write Modal (Mode: Create or Edit)
function openWriteModal(post = null) {
  writeForm.reset();
  postAnonymous.checked = false;
  postAuthor.disabled = false;
  postAuthor.placeholder = '이름 또는 닉네임';

  if (post) {
    // Edit mode
    writeModalTitle.textContent = '게시글 수정';
    editPostId.value = post.id;
    postCategory.value = post.category;
    postTitle.value = post.title;
    postContent.value = post.content;
    statusGroup.style.display = 'block';
    postStatus.value = post.status;

    if (post.isAnonymous) {
      postAnonymous.checked = true;
      postAuthor.value = '';
      postAuthor.disabled = true;
    } else {
      postAuthor.value = post.author;
    }
    postPassword.value = '';
    postPassword.placeholder = '작성 시 입력했던 비밀번호 재확인';
    savePostBtn.innerHTML = '<i class="fa-solid fa-check"></i> 수정 완료';
  } else {
    // New Post mode
    writeModalTitle.textContent = '새 게시글 작성';
    editPostId.value = '';
    statusGroup.style.display = 'none';
    postStatus.value = '접수대기';
    postPassword.placeholder = '4자리 이상 입력 (수정/삭제용)';
    savePostBtn.innerHTML = '<i class="fa-solid fa-check"></i> 작성 완료';
  }

  writeModal.classList.add('active');
  setTimeout(() => postTitle.focus(), 100);
}

function closeWriteModal() {
  writeModal.classList.remove('active');
  writeForm.reset();
}

// Handle Save Post (Create / Update)
async function handleSavePost(e) {
  e.preventDefault();

  const id = editPostId.value;
  const isEditing = Boolean(id);

  const payload = {
    category: postCategory.value,
    title: postTitle.value.trim(),
    content: postContent.value.trim(),
    author: postAnonymous.checked ? '익명' : (postAuthor.value.trim() || '익명'),
    isAnonymous: postAnonymous.checked,
    password: postPassword.value.trim(),
    status: isEditing ? postStatus.value : undefined
  };

  if (!payload.title) {
    showToast('제목을 입력해주세요.', 'error');
    postTitle.focus();
    return;
  }

  if (!payload.content) {
    showToast('내용을 입력해주세요.', 'error');
    postContent.focus();
    return;
  }

  if (!payload.password) {
    showToast('비밀번호를 입력해주세요.', 'error');
    postPassword.focus();
    return;
  }

  try {
    savePostBtn.disabled = true;
    savePostBtn.textContent = '처리 중...';

    const url = isEditing ? `/api/posts/${id}` : '/api/posts';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      showToast(isEditing ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다!', 'success');
      closeWriteModal();
      fetchPosts();

      // If we were editing from detail view, update detail modal as well
      if (isEditing && state.currentPost && state.currentPost.id === Number(id)) {
        openDetailModal(id, false);
      }
    } else {
      showToast(result.message || '요청 처리에 실패했습니다.', 'error');
    }
  } catch (err) {
    console.error('Save post error:', err);
    showToast('서버 오류가 발생했습니다.', 'error');
  } finally {
    savePostBtn.disabled = false;
  }
}

// Open Detail Modal
async function openDetailModal(id, incrementView = true) {
  try {
    const response = await fetch(`/api/posts/${id}?view=${incrementView}`);
    const result = await response.json();

    if (!result.success || !result.data) {
      showToast('게시글을 불러올 수 없습니다.', 'error');
      return;
    }

    const post = result.data;
    state.currentPost = post;

    detailCategory.textContent = post.category;
    detailCategory.setAttribute('data-cat', post.category);
    detailStatus.textContent = post.status;
    detailStatus.className = `status-badge status-${post.status}`;
    detailTitle.textContent = post.title;
    detailAuthor.textContent = post.author;
    detailCreatedAt.textContent = formatFullDate(post.createdAt);
    detailViews.textContent = post.views || 0;
    detailLikes.textContent = post.likes || 0;
    detailContent.textContent = post.content;

    detailModal.classList.add('active');

    // Also update view count in local list if needed
    if (incrementView) {
      const target = state.posts.find(p => p.id === Number(id));
      if (target) {
        target.views = post.views;
      }
    }
  } catch (err) {
    console.error('Fetch post detail error:', err);
    showToast('게시글 상세 조회에 실패했습니다.', 'error');
  }
}

function closeDetailModal() {
  detailModal.classList.remove('active');
  state.currentPost = null;
}

// Handle Like (추천)
async function handleLikePost() {
  if (!state.currentPost) return;

  try {
    likeBtn.disabled = true;
    const response = await fetch(`/api/posts/${state.currentPost.id}/like`, {
      method: 'POST'
    });
    const result = await response.json();

    if (result.success) {
      state.currentPost.likes = result.likes;
      detailLikes.textContent = result.likes;
      showToast('게시글을 추천했습니다!', 'success');
      
      const inList = state.posts.find(p => p.id === state.currentPost.id);
      if (inList) inList.likes = result.likes;
      renderPosts(state.posts);
    }
  } catch (err) {
    console.error('Like error:', err);
    showToast('추천 처리에 실패했습니다.', 'error');
  } finally {
    likeBtn.disabled = false;
  }
}

// Password Modal for Edit/Delete
function openPasswordModal(action, postId) {
  state.pendingAction = { type: action, postId };
  verifyPasswordInput.value = '';

  if (action === 'edit') {
    passwordModalTitle.textContent = '게시글 수정 확인';
    passwordModalDesc.textContent = '게시글 수정을 위해 작성 시 등록한 비밀번호를 입력해주세요.';
  } else {
    passwordModalTitle.textContent = '게시글 삭제 확인';
    passwordModalDesc.textContent = '정말 삭제하시겠습니까? 등록한 비밀번호를 입력해주세요.';
  }

  passwordModal.classList.add('active');
  setTimeout(() => verifyPasswordInput.focus(), 100);
}

function closePasswordModal() {
  passwordModal.classList.remove('active');
  state.pendingAction = null;
}

// Handle Password Verification for Edit / Delete
async function handlePasswordSubmit(e) {
  e.preventDefault();
  if (!state.pendingAction) return;

  const { type, postId } = state.pendingAction;
  const password = verifyPasswordInput.value.trim();

  if (!password) {
    showToast('비밀번호를 입력해주세요.', 'error');
    return;
  }

  if (type === 'delete') {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const result = await response.json();

      if (result.success) {
        showToast('게시글이 삭제되었습니다.', 'success');
        closePasswordModal();
        closeDetailModal();
        fetchPosts();
      } else {
        showToast(result.message || '비밀번호가 일치하지 않습니다.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('삭제 처리 중 오류가 발생했습니다.', 'error');
    }
  } else if (type === 'edit') {
    // For edit, test password by fetching current post and checking
    if (state.currentPost && state.currentPost.password && state.currentPost.password !== password) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    const postToEdit = { ...state.currentPost, password };
    closePasswordModal();
    closeDetailModal();
    openWriteModal(postToEdit);
  }
}

// Helper: Toast notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper: Date format
function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return '방금 전';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}일 전`;

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function formatFullDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}년 ${m}월 ${d}일 ${h}:${min}`;
}

