import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Clock,
  Eye,
  ThumbsUp,
  Pen,
  Trash2,
  Lock,
  Globe,
  MessageSquare,
  AlertCircle,
  ShieldAlert,
  Send,
  UserCheck,
  Paperclip,
  Download,
  Image as ImageIcon,
  FileText,
  Ban
} from 'lucide-react';
import { isMyPost, getUserToken, postService, isMyComment } from '../lib/supabase';

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  onLike,
  onOpenEdit,
  onOpenDelete,
  onAdminDeletePost,
  isAdmin
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [secretError, setSecretError] = useState(false);

  // 댓글 관련 상태
  const [comments, setComments] = useState([]);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [commentPassword, setCommentPassword] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 🎯 이미지 확대 모달
  const [previewImage, setPreviewImage] = useState(null);

  // 본인 글 여부
  const isMine = post ? (isMyPost(post.id) || (post.author_token && post.author_token === getUserToken())) : false;
  const isPrivate = post?.visibility === 'private';
  const isLocked = isPrivate && !isMine && !unlocked;
  const allowLikes = post?.allow_likes !== false;

  // 🎯 댓글 허용 여부: 공지사항이거나 allow_comments가 false인 경우 차단
  const isNotice = post?.category === '공지사항';
  const allowComments = !isNotice && post?.allow_comments !== false;

  const attachments = post?.attachments || [];
  const imageAttachments = attachments.filter((a) => a.isImage);
  const fileAttachments = attachments.filter((a) => !a.isImage);

  // 댓글 불러오기
  useEffect(() => {
    if (post && isOpen) {
      loadComments(post.id);
      setUnlocked(false);
      setSecretInput('');
      setSecretError(false);
      setPreviewImage(null);
    }
  }, [post, isOpen]);

  const loadComments = async (postId) => {
    try {
      const data = await postService.fetchComments(postId);
      setComments(data);
    } catch (e) {
      console.error('Comments load error', e);
    }
  };

  if (!isOpen || !post) return null;

  // 비밀글 해제
  const handleUnlock = (e) => {
    e.preventDefault();
    if (secretInput === post.password) {
      setUnlocked(true);
      setSecretError(false);
    } else {
      setSecretError(true);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!allowComments) {
      alert('관리자 공지사항 글에는 댓글을 작성할 수 없습니다.');
      return;
    }
    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    if (!commentPassword.trim()) {
      alert('댓글 삭제 권한 확인을 위한 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsSubmittingComment(true);
      await postService.createComment({
        postId: post.id,
        author: commentAnonymous ? '익명' : (commentAuthor.trim() || '익명'),
        isAnonymous: commentAnonymous,
        content: commentContent.trim(),
        password: commentPassword.trim()
      });
      setCommentContent('');
      setCommentPassword('');
      loadComments(post.id);
    } catch (err) {
      alert(err.message || '댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 작성자 본인 댓글 삭제
  const handleDeleteComment = async (comment) => {
    const pwd = prompt('댓글 작성 시 설정한 비밀번호를 입력해주세요:');
    if (!pwd) return;

    try {
      await postService.deleteComment(comment.id, pwd.trim());
      alert('댓글이 삭제되었습니다.');
      loadComments(post.id);
    } catch (err) {
      alert(err.message || '댓글 삭제에 실패했습니다.');
    }
  };

  // 관리자 댓글 통보 삭제
  const handleAdminDeleteComment = async (comment) => {
    const reason = prompt(`[관리자] 규정 위반 댓글 삭제 사유(통보 내용)를 입력해주세요:`);
    if (!reason || !reason.trim()) return;

    try {
      await postService.adminDeleteComment(comment.id, reason.trim());
      alert(`[통보 완료] 규정 위반으로 댓글이 삭제되었습니다.\n사유: ${reason}`);
      loadComments(post.id);
    } catch (err) {
      alert(err.message || '관리자 댓글 삭제 처리에 실패했습니다.');
    }
  };

  const formatFullDate = (isoStr) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card-lg">
        {/* Header */}
        <div className="modal-header">
          <div className="detail-header-tags">
            <span className="category-badge" data-cat={post.category}>
              {post.category}
            </span>
            <span className={`status-badge status-${post.status}`}>
              {post.status}
            </span>
            {isPrivate ? (
              <span className="visibility-badge private">
                <Lock size={12} /> 비밀글
              </span>
            ) : (
              <span className="visibility-badge public">
                <Globe size={12} /> 전체공개
              </span>
            )}
            {isMine && (
              <span className="my-badge">
                <UserCheck size={12} /> 내가 쓴 글
              </span>
            )}
            {attachments.length > 0 && (
              <span className="attachment-badge" title={`첨부파일 ${attachments.length}개`}>
                <Paperclip size={12} /> 첨부 {attachments.length}
              </span>
            )}
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body detail-body">
          <h2 className="detail-title">{post.title}</h2>

          <div className="detail-meta">
            <div className="meta-item author-meta">
              <User size={15} />
              <span>{post.author}</span>
            </div>
            <div className="meta-divider">•</div>
            <div className="meta-item">
              <Clock size={15} />
              <span>{formatFullDate(post.created_at)}</span>
            </div>
            <div className="meta-divider">•</div>
            <div className="meta-item">
              <Eye size={15} />
              <span>조회수 {post.views || 0}</span>
            </div>
          </div>

          <hr className="detail-divider" />

          {/* 본문 (비밀글 잠금 처리) */}
          {isLocked ? (
            <div className="locked-box">
              <Lock size={36} className="locked-icon" />
              <h3>비밀글입니다</h3>
              <p>작성 시 설정한 비밀번호를 입력하면 내용을 확인할 수 있습니다.</p>
              <form onSubmit={handleUnlock} className="locked-form">
                <input
                  type="password"
                  className="form-input"
                  placeholder="비밀번호 입력"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  확인
                </button>
              </form>
              {secretError && (
                <span className="error-text">
                  <AlertCircle size={14} /> 비밀번호가 일치하지 않습니다.
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="detail-content">{post.content}</div>

              {/* 🎯 첨부된 사진 갤러리 */}
              {imageAttachments.length > 0 && (
                <div className="detail-images-gallery">
                  <h4 className="detail-section-title">
                    <ImageIcon size={16} /> 첨부 이미지 ({imageAttachments.length})
                  </h4>
                  <div className="gallery-grid">
                    {imageAttachments.map((img) => (
                      <div
                        key={img.id}
                        className="gallery-item"
                        onClick={() => setPreviewImage(img)}
                        title="클릭하여 원본 보기"
                      >
                        <img src={img.dataUrl} alt={img.name} />
                        <span className="gallery-item-name">{img.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🎯 첨부된 일반 파일 목록 및 다운로드 */}
              {fileAttachments.length > 0 && (
                <div className="detail-files-box">
                  <h4 className="detail-section-title">
                    <Paperclip size={16} /> 첨부 파일 ({fileAttachments.length})
                  </h4>
                  <div className="files-download-list">
                    {fileAttachments.map((file) => (
                      <a
                        key={file.id}
                        href={file.dataUrl}
                        download={file.name}
                        className="file-download-card"
                        title="클릭하여 다운로드"
                      >
                        <div className="file-icon-box">
                          <FileText size={18} />
                        </div>
                        <div className="file-name-meta">
                          <span className="file-name-text">{file.name}</span>
                          <span className="file-size-text">{formatFileSize(file.size)}</span>
                        </div>
                        <Download size={16} className="file-dl-icon" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 공감(추천) 섹션 */}
          <div className="like-section">
            {allowLikes ? (
              <button type="button" className="btn btn-like" onClick={() => onLike(post.id)}>
                <ThumbsUp size={18} /> 공감해요 <span>{post.likes || 0}</span>
              </button>
            ) : (
              <div className="like-disabled-msg">
                <ThumbsUp size={16} /> 작성자가 공감(추천)을 비허용한 게시글입니다.
              </div>
            )}
          </div>

          {/* ==================================================================== */}
          {/* 🎯 댓글 섹션 (관리자 공지사항 vs 일반 게시글 규칙 분기) */}
          {/* ==================================================================== */}
          <div className="comments-section">
            <div className="comments-header">
              <h4>
                <MessageSquare size={17} /> 댓글 <span>({comments.length})</span>
              </h4>
            </div>

            {/* 규칙 1: 관리자 공지사항인 경우 댓글 작성 차단 배너 노출 */}
            {!allowComments ? (
              <div className="notice-comments-disabled-banner">
                <Ban size={20} />
                <div>
                  <strong>댓글 작성이 제한된 게시글입니다.</strong>
                  <p>학과 운영 규정에 따라 관리자 공지사항 게시글에는 댓글을 작성할 수 없습니다.</p>
                </div>
              </div>
            ) : (
              /* 규칙 2: 관리자 외 일반 사용자가 작성한 글에는 모든 독자가 댓글 작성 가능 */
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <div className="comment-form-top">
                  <div className="comment-author-wrap">
                    <input
                      type="text"
                      className="form-input comment-input-sm"
                      placeholder="작성자 이름"
                      value={commentAnonymous ? '익명' : commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      disabled={commentAnonymous}
                      maxLength={15}
                    />
                    <label className="checkbox-label" style={{ fontSize: '0.78rem' }}>
                      <input
                        type="checkbox"
                        checked={commentAnonymous}
                        onChange={(e) => setCommentAnonymous(e.target.checked)}
                      />
                      <span>익명</span>
                    </label>
                  </div>

                  <div className="comment-password-wrap">
                    <input
                      type="password"
                      className="form-input comment-input-sm"
                      placeholder="삭제용 비밀번호 (4자리)"
                      value={commentPassword}
                      onChange={(e) => setCommentPassword(e.target.value)}
                      required
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="comment-form-bottom">
                  <textarea
                    className="form-textarea comment-textarea"
                    rows={2}
                    placeholder="건전하고 따뜻한 댓글을 남겨주세요."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary comment-submit-btn"
                    disabled={isSubmittingComment}
                  >
                    <Send size={15} /> {isSubmittingComment ? '등록중' : '등록'}
                  </button>
                </div>
              </form>
            )}

            {/* 댓글 목록 */}
            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="empty-comments">
                  {allowComments
                    ? '아직 등록된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!'
                    : '등록된 댓글이 없습니다.'}
                </div>
              ) : (
                comments.map((c) => {
                  const isMyComm = isMyComment(c.id) || (c.author_token && c.author_token === getUserToken());
                  return (
                    <div key={c.id} className="comment-item">
                      <div className="comment-item-header">
                        <div className="comment-author-info">
                          <User size={13} />
                          <strong>{c.author}</strong>
                          {isMyComm && <span className="comment-my-tag">내가 쓴 댓글</span>}
                          <span className="comment-date">{formatFullDate(c.created_at)}</span>
                        </div>

                        <div className="comment-actions">
                          <button
                            type="button"
                            className="comment-del-btn"
                            onClick={() => handleDeleteComment(c)}
                            title="댓글 작성자 삭제 (비밀번호 확인)"
                          >
                            삭제
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              className="comment-admin-del-btn"
                              onClick={() => handleAdminDeleteComment(c)}
                              title="[관리자] 규정 위반 통보 후 삭제"
                            >
                              <ShieldAlert size={12} /> 규정위반 삭제
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="comment-body">{c.content}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer detail-footer">
          <div className="footer-left">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              목록으로
            </button>
          </div>

          <div className="footer-right">
            {isAdmin && (
              <button
                type="button"
                className="btn btn-admin-danger"
                onClick={() => onAdminDeletePost(post)}
                title="관리자 권한: 규정 위반 사유 통보 후 삭제"
              >
                <ShieldAlert size={15} /> 규정 위반 통보 삭제
              </button>
            )}

            <button
              type="button"
              className="btn btn-warning"
              onClick={() => onOpenEdit(post)}
            >
              <Pen size={14} /> 수정
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onOpenDelete(post)}
            >
              <Trash2 size={14} /> 삭제
            </button>
          </div>
        </div>

        {/* 이미지 전체화면 모달 */}
        {previewImage && (
          <div className="image-zoom-overlay" onClick={() => setPreviewImage(null)}>
            <div className="image-zoom-box" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="image-zoom-close"
                onClick={() => setPreviewImage(null)}
              >
                <X size={24} />
              </button>
              <img src={previewImage.dataUrl} alt={previewImage.name} />
              <div className="image-zoom-caption">{previewImage.name}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
