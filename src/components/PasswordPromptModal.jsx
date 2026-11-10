import React, { useState } from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';

export default function PasswordPromptModal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm
}) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setErrorMsg('');
      await onConfirm(password.trim());
      setPassword('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || '비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card-sm">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <KeyRound size={18} />
            <h3>{title}</h3>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="password-desc">{description}</p>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {errorMsg && (
            <div className="error-alert">
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '1rem', padding: 0, background: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

