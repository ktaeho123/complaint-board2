import React from 'react';
import {
  Megaphone,
  MessageSquare,
  GraduationCap,
  Building2,
  Lightbulb,
  LayoutGrid,
  UserCheck,
  MessageCircle,
  FileText
} from 'lucide-react';

export default function CategoryTabs({
  activeView,
  onSelectView,
  selectedCategory,
  onSelectCategory,
  isAdmin
}) {
  const isMyPostView = activeView === 'my-posts';
  const isMyCommentView = activeView === 'my-comments';
  const isAuditLogView = activeView === 'audit-logs';

  const CATEGORIES = [
    { name: '전체', icon: LayoutGrid },
    { name: '공지사항', icon: Megaphone },
    { name: '불만/건의', icon: MessageSquare },
    { name: '학사/수업', icon: GraduationCap },
    { name: '시설/환경', icon: Building2 },
    { name: '자유의견', icon: Lightbulb }
  ];

  return (
    <div className="view-and-category-wrap">
      {/* 🎯 상단 뷰 전환 (전체 게시판 vs 내가 쓴 글 vs 내가 쓴 댓글) */}
      <div className="main-views-nav">
        <button
          type="button"
          className={`nav-view-btn ${activeView === 'all' ? 'active' : ''}`}
          onClick={() => onSelectView('all')}
        >
          <LayoutGrid size={16} />
          <span>전체 게시판</span>
        </button>

        <button
          type="button"
          className={`nav-view-btn highlight ${isMyPostView ? 'active' : ''}`}
          onClick={() => onSelectView('my-posts')}
        >
          <UserCheck size={16} />
          <span>내가 쓴 글</span>
        </button>

        <button
          type="button"
          className={`nav-view-btn highlight ${isMyCommentView ? 'active' : ''}`}
          onClick={() => onSelectView('my-comments')}
        >
          <MessageCircle size={16} />
          <span>내가 쓴 댓글</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            className={`nav-view-btn admin-view ${isAuditLogView ? 'active' : ''}`}
            onClick={() => onSelectView('audit-logs')}
          >
            <FileText size={16} />
            <span>규정 위반 삭제 통보함</span>
          </button>
        )}
      </div>

      {/* 카테고리 필터 탭 (전체 게시판 또는 내 글 보기일 때 노출) */}
      {activeView !== 'my-comments' && activeView !== 'audit-logs' && (
        <div className="category-tabs">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.name)}
              >
                <Icon size={15} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
