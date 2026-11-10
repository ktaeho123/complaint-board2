import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  PenSquare,
  Lock,
  Globe,
  ThumbsUp,
  KeyRound,
  ShieldCheck,
  Paperclip,
  Image,
  File,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function PostWriteModal({ isOpen, onClose, onSave, editingPost = null, defaultAuthorName = '' }) {
  const [category, setCategory] = useState('불만/건의');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('접수대기');
  const [visibility, setVisibility] = useState('public');
  const [allowLikes, setAllowLikes] = useState(true);

  // 🎯 파일 및 사진 첨부 목록
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setCategory(editingPost.category || '불만/건의');
      setTitle(editingPost.title || '');
      setAuthor(editingPost.is_anonymous ? '' : editingPost.author || '');
      setIsAnonymous(Boolean(editingPost.is_anonymous));
      setPassword(editingPost.password || '');
      setContent(editingPost.content || '');
      setStatus(editingPost.status || '접수대기');
      setVisibility(editingPost.visibility || 'public');
      setAllowLikes(editingPost.allow_likes !== false);
      setAttachments(editingPost.attachments || []);
    } else {
      setCategory('불만/건의');
      setTitle('');
      setAuthor(defaultAuthorName || '');
      setIsAnonymous(false);
      setPassword('');
      setContent('');
      setStatus('접수대기');
      setVisibility('public');
      setAllowLikes(true);
      setAttachments([]);
    }
  }, [editingPost, isOpen, defaultAuthorName]);

  if (!isOpen) return null;

  // 파일 선택 및 Base64 변환 처리
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      // 파일 크기 제한 (최대 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`파일 "${file.name}"의 크기가 10MB를 초과하여 제외되었습니다.`);
        return;
      }

      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');

      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            id: 'file_' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            isImage,
            dataUrl: reader.result
          }
        ]);
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (fileId) => {
    setAttachments((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('게시글 제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('게시글 내용을 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      alert('수정/삭제 권한 확인을 위한 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        category,
        title: title.trim(),
        content: content.trim(),
        author: isAnonymous ? '익명' : (author.trim() || '익명'),
        is_anonymous: isAnonymous,
        password: password.trim(),
        status: category === '공지사항' ? '공지' : status,
        visibility,
        allow_likes: allowLikes,
        attachments // 🎯 첨부파일 전달
      });
      onClose();
    } catch (err) {
      alert(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNotice = category === '공지사항';

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card-lg">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <PenSquare size={20} />
            <h2>{editingPost ? '게시글 수정' : '새 게시글 작성'}</h2>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* 분류 & 상태 */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="postCategory">
                분류 <span className="required">*</span>
              </label>
              <select
                id="postCategory"
                className="form-input"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value === '공지사항') setStatus('공지');
                }}
                required
              >
                <option value="불만/건의">불만/건의</option>
                <option value="시설/환경">시설/환경</option>
                <option value="학사/수업">학사/수업</option>
                <option value="공지사항">공지사항 (관리자 전용 공지)</option>
                <option value="자유의견">자유의견</option>
              </select>
            </div>

            {editingPost && (
              <div className="form-group flex-1">
                <label htmlFor="postStatus">처리 상태</label>
                <select
                  id="postStatus"
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="접수대기">접수대기</option>
                  <option value="처리중">처리중</option>
                  <option value="답변완료">답변완료</option>
                  <option value="공지">공지</option>
                </select>
              </div>
            )}
          </div>

          {/* 공지사항 댓글 불가 안내 알림 */}
          {isNotice && (
            <div className="notice-comment-alert">
              <AlertCircle size={15} />
              <span>관리자 공지사항 글은 학과 규정에 따라 <strong>댓글 작성이 자동으로 비활성화</strong>됩니다.</span>
            </div>
          )}

          {/* 제목 */}
          <div className="form-group">
            <label htmlFor="postTitle">
              제목 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="postTitle"
              className="form-input"
              placeholder="게시글 제목을 간결하고 명확하게 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          {/* 작성자 & 비밀번호 */}
          <div className="form-row">
            <div className="form-group flex-1">
              <div className="label-with-checkbox">
                <label htmlFor="postAuthor">
                  작성자 <span className="required">*</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>익명으로 작성</span>
                </label>
              </div>
              <input
                type="text"
                id="postAuthor"
                className="form-input"
                placeholder={isAnonymous ? '익명으로 등록됩니다' : '이름 또는 닉네임'}
                value={isAnonymous ? '' : author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={isAnonymous}
                maxLength={20}
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="postPassword">
                <KeyRound size={14} style={{ display: 'inline', marginRight: 4 }} />
                수정/삭제 권한 비밀번호 <span className="required">*</span>
              </label>
              <input
                type="password"
                id="postPassword"
                className="form-input"
                placeholder="4자리 이상 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={20}
              />
              <small className="help-text">작성자 본인 확인 및 글 수정/삭제 시 필요합니다.</small>
            </div>
          </div>

          {/* 세부 옵션: 공개 범위 & 공감 허용 */}
          <div className="options-card">
            <h4 className="options-title">
              <ShieldCheck size={16} /> 게시글 세부 설정 옵션
            </h4>

            <div className="options-grid">
              <div className="option-item">
                <span className="option-label">공개 범위</span>
                <div className="radio-group">
                  <label className={`radio-pill ${visibility === 'public' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === 'public'}
                      onChange={() => setVisibility('public')}
                    />
                    <Globe size={14} /> 전체 공개
                  </label>
                  <label className={`radio-pill ${visibility === 'private' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === 'private'}
                      onChange={() => setVisibility('private')}
                    />
                    <Lock size={14} /> 비밀글 (비공개)
                  </label>
                </div>
              </div>

              <div className="option-item">
                <span className="option-label">공감(추천) 허용</span>
                <label className="toggle-switch-label">
                  <input
                    type="checkbox"
                    checked={allowLikes}
                    onChange={(e) => setAllowLikes(e.target.checked)}
                  />
                  <span className="toggle-custom"></span>
                  <span className="toggle-text">
                    <ThumbsUp size={14} /> 학우들의 공감(추천) 받기 {allowLikes ? '허용' : '비허용'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 본문 내용 */}
          <div className="form-group">
            <label htmlFor="postContent">
              내용 <span className="required">*</span>
            </label>
            <textarea
              id="postContent"
              className="form-textarea"
              rows={7}
              placeholder="불만 사항이나 건의할 내용, 또는 의견을 자세히 적어주세요.&#10;서로를 존중하는 건전한 게시판 문화를 만들어 갑시다."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* ==================================================================== */}
          {/* 🎯 사진 및 파일 첨부 영역 */}
          {/* ==================================================================== */}
          <div className="attachment-upload-box">
            <div className="attachment-upload-header">
              <label className="upload-label">
                <Paperclip size={16} />
                <span>사진 및 파일 첨부</span>
                <small>(이미지 JPG/PNG/GIF, 문서 PDF/ZIP/HWP 등 최대 10MB)</small>
              </label>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={14} /> 파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.zip,.hwp,.docx,.xlsx,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* 첨부된 파일 목록 */}
            {attachments.length > 0 && (
              <div className="attachments-preview-grid">
                {attachments.map((file) => (
                  <div key={file.id} className="attachment-item-card">
                    {file.isImage ? (
                      <div className="attachment-thumb">
                        <img src={file.dataUrl} alt={file.name} />
                      </div>
                    ) : (
                      <div className="attachment-icon-box">
                        <File size={22} />
                      </div>
                    )}

                    <div className="attachment-info">
                      <span className="attachment-name" title={file.name}>
                        {file.name}
                      </span>
                      <span className="attachment-size">{formatFileSize(file.size)}</span>
                    </div>

                    <button
                      type="button"
                      className="attachment-del-btn"
                      onClick={() => handleRemoveAttachment(file.id)}
                      title="첨부 파일 삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Check size={16} /> {isSubmitting ? '처리 중...' : (editingPost ? '수정 완료' : '작성 완료')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
