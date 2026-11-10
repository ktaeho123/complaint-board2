import React from 'react';
import { Megaphone, Lock, Globe, User, Eye, ThumbsUp, UserCheck, Paperclip, Image as ImageIcon } from 'lucide-react';
import { isMyPost, getUserToken } from '../lib/supabase';

export default function PostCard({ post, onClick }) {
  const isNotice = post.category === '공지사항';
  const isPrivate = post.visibility === 'private';
  const allowLikes = post.allow_likes !== false;
  const isMine = isMyPost(post.id) || (post.author_token && post.author_token === getUserToken());
  const attachments = post.attachments || [];
  const hasImages = attachments.some(a => a.isImage);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return '방금 전';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}일 전`;

    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <article className={`post-card ${isNotice ? 'notice-card' : ''} ${isMine ? 'my-post-card' : ''}`} onClick={() => onClick(post)}>
      <div className="post-card-header">
        <div className="badge-group">
          <span className="category-badge" data-cat={post.category}>
            {post.category}
          </span>
          <span className={`status-badge status-${post.status}`}>
            {post.status}
          </span>
          {isPrivate ? (
            <span className="visibility-badge private" title="비밀글 (비공개)">
              <Lock size={12} /> 비밀글
            </span>
          ) : (
            <span className="visibility-badge public" title="전체 공개">
              <Globe size={12} /> 전체공개
            </span>
          )}
          {isMine && (
            <span className="my-badge" title="내가 작성한 게시글입니다">
              <UserCheck size={12} /> 내가 쓴 글
            </span>
          )}
          {attachments.length > 0 && (
            <span className="attachment-card-badge" title={`첨부파일 ${attachments.length}개`}>
              {hasImages ? <ImageIcon size={12} /> : <Paperclip size={12} />}
              {attachments.length}
            </span>
          )}
        </div>
        <span className="post-time">{formatDate(post.created_at)}</span>
      </div>

      <h3 className="post-card-title">
        {isNotice && <Megaphone size={16} className="notice-icon" />}
        {isPrivate && <Lock size={16} className="private-icon" />}
        {post.title}
      </h3>

      <p className="post-card-snippet">
        {isPrivate && !isMine
          ? '비밀글로 등록된 게시글입니다. 작성자 비밀번호를 통해 본문을 열람할 수 있습니다.'
          : post.content}
      </p>

      <div className="post-card-footer">
        <div className="card-footer-left">
          <span className="author-chip">
            <User size={14} /> {post.author}
          </span>
        </div>
        <div className="card-footer-right">
          <span className="meta-count" title="조회수">
            <Eye size={14} /> {post.views || 0}
          </span>
          <span
            className={`meta-count ${!allowLikes ? 'disabled-likes' : ''}`}
            title={allowLikes ? '공감/추천' : '공감 비허용'}
          >
            <ThumbsUp size={14} /> {post.likes || 0}
          </span>
        </div>
      </div>
    </article>
  );
}
