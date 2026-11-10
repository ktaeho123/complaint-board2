import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';

const REASON_TEMPLATES = [
  '학내 구성원 대상 비방, 욕설, 인격 모독성 표현 포함',
  '근거 없는 허위 사실 유포 및 명예훼손 우려',
  '상업적 광고, 홍보성 게시글 또는 무의미한 도배',
  '타인의 개인정보(연락처, 학번, 이름 등) 무단 노출',
  '기타 학과 게시판 운영 규정 위반'
];

export default function AdminNoticeDeleteModal({
  isOpen,
  onClose,
  target,
  targetType = 'post', // 'post' | 'comment'
  onConfirm
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(REASON_TEMPLATES[0]);
  const [detailReason, setDetailReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !target) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = detailReason.trim()
      ? `[${selectedTemplate}] ${detailReason.trim()}`
      : selectedTemplate;

    try {
      setIsSubmitting(true);
      await onConfirm(target.id, finalReason);
      onClose();
    } catch (err) {
      alert(err.message || '삭제 처리에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card-sm">
        <div className="modal-header admin-modal-header">
          <div className="modal-title-wrap" style={{ color: '#b91c1c' }}>
            <ShieldAlert size={20} />
            <h3>규정 위반 통보 및 삭제</h3>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="admin-notice-box">
            <AlertTriangle size={18} />
            <p>
              관리자는 글을 임의로 수정할 수 없으며, 규정 위반 건에 한해 <strong>사유를 통보 및 감사 로그에 기록한 후 삭제</strong>합니다.
            </p>
          </div>

          <div className="target-summary">
            <strong>대상 {targetType === 'post' ? '게시글' : '댓글'}:</strong>
            <span>{targetType === 'post' ? target.title : `"${target.content?.substring(0, 30)}..."`}</span>
            <small>작성자: {target.author}</small>
          </div>

          <div className="form-group">
            <label>규정 위반 유형 선택 <span className="required">*</span></label>
            <select
              className="form-input"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {REASON_TEMPLATES.map((tmpl) => (
                <option key={tmpl} value={tmpl}>{tmpl}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>세부 사유 및 통보 안내문 (선택 입력)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="위반 조항이나 작성자에게 남길 구체적인 안내 사유를 입력하세요."
              value={detailReason}
              onChange={(e) => setDetailReason(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '1rem', padding: 0, background: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              취소
            </button>
            <button type="submit" className="btn btn-danger" disabled={isSubmitting}>
              <ShieldAlert size={16} /> {isSubmitting ? '삭제 처리중...' : '통보 후 삭제 확정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

