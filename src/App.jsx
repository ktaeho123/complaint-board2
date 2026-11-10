import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import CategoryTabs from './components/CategoryTabs';
import FilterBar from './components/FilterBar';
import PostCard from './components/PostCard';
import PostWriteModal from './components/PostWriteModal';
import PostDetailModal from './components/PostDetailModal';
import PasswordPromptModal from './components/PasswordPromptModal';
import AdminNoticeDeleteModal from './components/AdminNoticeDeleteModal';
import MyCommentsView from './components/MyCommentsView';
import AdminAuditLogsView from './components/AdminAuditLogsView';
import Toast from './components/Toast';
import { postService, DEFAULT_ADMIN_KEY, isMyPost, getMyPostPassword } from './lib/supabase';
import { FolderOpen, PenSquare, UserCheck } from 'lucide-react';

const CURRENT_USER_KEY = 'complaint_board_current_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // View 모드: 'all' | 'my-posts' | 'my-comments' | 'audit-logs'
  const [activeView, setActiveView] = useState('all');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');

  // 관리자 권한 상태
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    action: null,
    targetPost: null
  });

  const [adminDeleteModal, setAdminDeleteModal] = useState({
    isOpen: false,
    target: null,
    targetType: 'post'
  });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    showToast(`${user.name || user.id}님 환영합니다! 게시판에 접속되었습니다.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setIsAdmin(false);
    showToast('로그아웃되었습니다. 로그인 화면으로 이동합니다.', 'info');
  };

  // Load posts
  const loadPosts = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const isMyOnly = activeView === 'my-posts';
      const data = await postService.fetchPosts({
        category: selectedCategory,
        status: selectedStatus,
        search: searchQuery,
        sort: selectedSort,
        myOnly: isMyOnly
      });
      setPosts(data);
    } catch (err) {
      console.error('게시글 로드 실패:', err);
      showToast('게시글 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, activeView, selectedCategory, selectedStatus, searchQuery, selectedSort]);

  useEffect(() => {
    if (currentUser && activeView !== 'my-comments' && activeView !== 'audit-logs') {
      loadPosts();
    }
  }, [loadPosts, currentUser, activeView]);

  // 관리자 모드 토글
  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      showToast('관리자 모드가 해제되었습니다.', 'info');
      if (activeView === 'audit-logs') setActiveView('all');
    } else {
      const input = prompt(
        `관리자 보안 비밀번호를 입력하세요.\n(기본 테스트 키: ${DEFAULT_ADMIN_KEY})`
      );
      if (input === null) return;
      if (input.trim() === DEFAULT_ADMIN_KEY) {
        setIsAdmin(true);
        showToast('관리자 권한이 인증되었습니다. (규정 위반 통보 삭제 권한 활성화)', 'success');
      } else {
        showToast('관리자 비밀번호가 일치하지 않습니다.', 'error');
      }
    }
  };

  // 게시글 저장
  const handleSavePost = async (postData) => {
    if (editingPost) {
      const updated = await postService.updatePost(editingPost.id, postData, postData.password);
      showToast('게시글이 성공적으로 수정되었습니다.', 'success');
      setEditingPost(null);
      if (selectedPost && selectedPost.id === updated.id) {
        setSelectedPost(updated);
      }
    } else {
      await postService.createPost(postData);
      showToast('게시글이 성공적으로 등록되었습니다!', 'success');
    }
    loadPosts();
  };

  // 상세 보기 열기
  const handleOpenDetail = async (post) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);

    try {
      const newViews = await postService.incrementViews(post.id);
      if (newViews !== undefined) {
        setSelectedPost((prev) => (prev && prev.id === post.id ? { ...prev, views: newViews } : prev));
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, views: newViews } : p)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 특정 ID로 상세 보기 열기 (댓글/알림에서 원문 바로가기)
  const handleOpenPostById = async (postId) => {
    try {
      const allPosts = await postService.fetchPosts({ category: '전체' });
      const target = allPosts.find((p) => p.id === Number(postId));
      if (target) {
        handleOpenDetail(target);
      } else {
        showToast('해당 게시글을 찾을 수 없습니다.', 'error');
      }
    } catch {
      showToast('게시글 열기에 실패했습니다.', 'error');
    }
  };

  // 공감하기
  const handleLike = async (postId) => {
    try {
      const newLikes = await postService.incrementLikes(postId);
      showToast('게시글에 공감했습니다!', 'success');
      setSelectedPost((prev) => (prev && prev.id === postId ? { ...prev, likes: newLikes } : prev));
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: newLikes } : p)));
    } catch (err) {
      showToast(err.message || '공감 처리에 실패했습니다.', 'error');
    }
  };

  // 수정 요청
  const handleRequestEdit = (post) => {
    const isMine = isMyPost(post.id);
    const cachedPwd = getMyPostPassword(post.id);

    if (isMine && cachedPwd && cachedPwd === post.password) {
      setIsDetailModalOpen(false);
      setEditingPost({ ...post, password: cachedPwd });
      setIsWriteModalOpen(true);
      return;
    }

    setPasswordModal({
      isOpen: true,
      title: '게시글 수정 (작성자 본인 확인)',
      description: '작성자 본인만 수정할 수 있습니다. 등록했던 비밀번호를 입력해주세요.',
      targetPost: post,
      action: 'edit'
    });
  };

  // 삭제 요청
  const handleRequestDelete = (post) => {
    setPasswordModal({
      isOpen: true,
      title: '게시글 삭제 (작성자 본인 확인)',
      description: '작성자 본인만 삭제할 수 있습니다. 등록했던 비밀번호를 입력해주세요.',
      targetPost: post,
      action: 'delete'
    });
  };

  const handlePasswordConfirm = async (inputPassword) => {
    const { action, targetPost } = passwordModal;
    if (!targetPost) return;

    if (action === 'delete') {
      await postService.deletePost(targetPost.id, inputPassword);
      showToast('게시글이 삭제되었습니다.', 'success');
      setIsDetailModalOpen(false);
      setSelectedPost(null);
      loadPosts();
    } else if (action === 'edit') {
      if (targetPost.password !== inputPassword) {
        throw new Error('작성자 비밀번호가 일치하지 않아 수정할 수 없습니다.');
      }
      setIsDetailModalOpen(false);
      setEditingPost({ ...targetPost, password: inputPassword });
      setIsWriteModalOpen(true);
    }
  };

  // 관리자 통보 삭제
  const handleAdminDeletePost = (post) => {
    setAdminDeleteModal({
      isOpen: true,
      target: post,
      targetType: 'post'
    });
  };

  const handleAdminDeleteConfirm = async (postId, reason) => {
    await postService.adminDeletePost(postId, reason);
    showToast(`[관리자 조치] 규정 위반 사유 통보 후 게시글이 삭제되었습니다.`, 'success');
    setIsDetailModalOpen(false);
    setSelectedPost(null);
    loadPosts();
  };

  if (!currentUser) {
    return (
      <>
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Header
        onOpenWriteModal={() => { setEditingPost(null); setIsWriteModalOpen(true); }}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        activeView={activeView}
        onSelectView={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenPostById={handleOpenPostById}
      />

      {/* 🎯 "Supabase 연동 안내"와 "기능 로드맵 안내" 배너 삭제 완료 */}

      <main className="board-container">
        <section className="toolbar-section">
          <CategoryTabs
            activeView={activeView}
            onSelectView={setActiveView}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isAdmin={isAdmin}
          />

          {activeView !== 'my-comments' && activeView !== 'audit-logs' && (
            <FilterBar
              selectedStatus={selectedStatus}
              onChangeStatus={setSelectedStatus}
              selectedSort={selectedSort}
              onChangeSort={setSelectedSort}
              searchQuery={searchQuery}
              onChangeSearch={setSearchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          )}
        </section>

        {activeView !== 'my-comments' && activeView !== 'audit-logs' && (
          <>
            <div className="stats-bar">
              {activeView === 'my-posts' ? (
                <span className="my-posts-stat">
                  <UserCheck size={16} /> 내가 작성한 게시글 <strong>{posts.length}</strong>개가 있습니다.
                </span>
              ) : (
                <span>총 <strong>{posts.length}</strong>개의 게시글이 있습니다.</span>
              )}
            </div>

            <section className="posts-section">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>게시글을 불러오는 중입니다...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FolderOpen size={48} />
                  </div>
                  <h3>
                    {activeView === 'my-posts'
                      ? '내가 작성한 게시글이 없습니다.'
                      : '등록된 게시글이 없습니다.'}
                  </h3>
                  <p>
                    {activeView === 'my-posts'
                      ? '새 게시글을 작성하면 이곳에서 언제든 모아보고 수정/삭제할 수 있습니다.'
                      : '첫 번째 게시글이나 학과 구성원을 위한 의견을 작성해보세요!'}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => { setEditingPost(null); setIsWriteModalOpen(true); }}
                  >
                    <PenSquare size={16} /> 게시글 작성하기
                  </button>
                </div>
              ) : (
                <div className="posts-list">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onClick={handleOpenDetail} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeView === 'my-comments' && (
          <MyCommentsView
            onOpenPostById={handleOpenPostById}
            onRefreshList={loadPosts}
          />
        )}

        {activeView === 'audit-logs' && <AdminAuditLogsView />}
      </main>

      <footer className="main-footer">
        <p>© 2026 학과 구성원 의견 수렴 및 불만 게시판 • 학과 구성원 전용 인증 포털</p>
      </footer>

      {/* Modals */}
      <PostWriteModal
        isOpen={isWriteModalOpen}
        onClose={() => { setIsWriteModalOpen(false); setEditingPost(null); }}
        onSave={handleSavePost}
        editingPost={editingPost}
        defaultAuthorName={currentUser.name || currentUser.id}
      />

      <PostDetailModal
        post={selectedPost}
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedPost(null); }}
        onLike={handleLike}
        onOpenEdit={handleRequestEdit}
        onOpenDelete={handleRequestDelete}
        onAdminDeletePost={handleAdminDeletePost}
        isAdmin={isAdmin}
      />

      <PasswordPromptModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, title: '', description: '', action: null, targetPost: null })}
        title={passwordModal.title}
        description={passwordModal.description}
        onConfirm={handlePasswordConfirm}
      />

      <AdminNoticeDeleteModal
        isOpen={adminDeleteModal.isOpen}
        onClose={() => setAdminDeleteModal({ isOpen: false, target: null, targetType: 'post' })}
        target={adminDeleteModal.target}
        targetType={adminDeleteModal.targetType}
        onConfirm={handleAdminDeleteConfirm}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
