import React, { useState } from 'react';
import {
  Megaphone,
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  Info
} from 'lucide-react';

const TEST_ACCOUNT = {
  id: 'abcd',
  pw: '1234',
  name: '컴퓨터공학과 학생'
};

const REGISTERED_USERS_KEY = 'complaint_board_registered_users';

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    const users = raw ? JSON.parse(raw) : {};
    if (!users['abcd']) {
      users['abcd'] = { id: 'abcd', pw: '1234', name: '컴퓨터공학과 학생', studentNo: '20260001' };
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    }
    return users;
  } catch {
    return { abcd: { id: 'abcd', pw: '1234', name: '컴퓨터공학과 학생', studentNo: '20260001' } };
  }
}

function saveRegisteredUser(id, pw, name, studentNo) {
  const users = getRegisteredUsers();
  users[id] = { id, pw, name, studentNo };
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

export default function AuthScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // 로그인 상태
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');

  // 회원가입 상태
  const [regId, setRegId] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regName, setRegName] = useState('');
  const [regStudentNo, setRegStudentNo] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // 🎯 원클릭 테스트 계정 자동 로그인
  const handleAutoFillTestAccount = () => {
    setLoginId(TEST_ACCOUNT.id);
    setLoginPw(TEST_ACCOUNT.pw);
    setLoginError('');
  };

  // 로그인 제출
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const users = getRegisteredUsers();
    const user = users[loginId.trim()];

    if (!user || user.pw !== loginPw.trim()) {
      setLoginError('아이디 또는 비밀번호가 일치하지 않습니다.');
      return;
    }

    onLoginSuccess({
      id: user.id,
      name: user.name || user.id,
      studentNo: user.studentNo || ''
    });
  };

  // 회원가입 제출
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMsg('');

    if (!regId.trim() || !regPw.trim() || !regName.trim()) {
      setRegError('모든 필수 항목을 입력해주세요.');
      return;
    }

    const users = getRegisteredUsers();
    if (users[regId.trim()]) {
      setRegError('이미 존재하는 아이디입니다.');
      return;
    }

    saveRegisteredUser(regId.trim(), regPw.trim(), regName.trim(), regStudentNo.trim());

    setRegSuccessMsg('회원가입이 완료되었습니다! 위 로그인 탭에서 로그인해주세요.');
    setLoginId(regId.trim());
    setLoginPw(regPw.trim());

    setTimeout(() => {
      setMode('login');
      setRegSuccessMsg('');
    }, 1200);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* 서비스 타이틀 & 로고 */}
        <div className="auth-header">
          <div className="auth-logo-icon">
            <Megaphone size={30} />
          </div>
          <h2>학과 소통 & 불만 게시판</h2>
          <p className="auth-subtitle">
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4, color: '#10b981' }} />
            학과 구성원(재학생, 교수, 행정실) 전용 인증 포털
          </p>
        </div>

        {/* 🎯 과제/실험용 테스트 계정 안내 배너 */}
        <div className="test-account-box">
          <div className="test-account-header">
            <Sparkles size={16} className="sparkle-icon" />
            <strong>과제 및 실험용 테스트 계정</strong>
          </div>
          <div className="account-credentials">
            <div className="cred-chip">
              아이디: <code>abcd</code>
            </div>
            <div className="cred-chip">
              비밀번호: <code>1234</code>
            </div>
          </div>
          <button
            type="button"
            className="btn-quick-fill"
            onClick={handleAutoFillTestAccount}
          >
            <ArrowRight size={13} /> 이 계정으로 자동 입력하기
          </button>
        </div>

        {/* 로그인 / 회원가입 탭 */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setLoginError(''); }}
          >
            <LogIn size={16} />
            <span>로그인</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setRegError(''); }}
          >
            <UserPlus size={16} />
            <span>신규 회원가입</span>
          </button>
        </div>

        {/* 1. 로그인 폼 */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="loginId">
                <User size={14} style={{ display: 'inline', marginRight: 4 }} />
                아이디 (ID)
              </label>
              <input
                type="text"
                id="loginId"
                className="form-input"
                placeholder="아이디를 입력하세요 (예: abcd)"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginPw">
                <KeyRound size={14} style={{ display: 'inline', marginRight: 4 }} />
                비밀번호 (PW)
              </label>
              <input
                type="password"
                id="loginPw"
                className="form-input"
                placeholder="비밀번호를 입력하세요 (예: 1234)"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                required
              />
            </div>

            {loginError && (
              <div className="auth-error-alert">
                <Info size={14} /> {loginError}
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit-btn">
              <LogIn size={16} /> 로그인하고 게시판 입장
            </button>
          </form>
        )}

        {/* 2. 회원가입 폼 */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="regId">
                희망 아이디 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="regId"
                className="form-input"
                placeholder="영문, 숫자 4자 이상"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="regPw">
                비밀번호 <span className="required">*</span>
              </label>
              <input
                type="password"
                id="regPw"
                className="form-input"
                placeholder="비밀번호 4자리 이상"
                value={regPw}
                onChange={(e) => setRegPw(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="regName">
                  이름/닉네임 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="regName"
                  className="form-input"
                  placeholder="예: 홍길동"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label htmlFor="regStudentNo">학번 (선택)</label>
                <input
                  type="text"
                  id="regStudentNo"
                  className="form-input"
                  placeholder="예: 20261234"
                  value={regStudentNo}
                  onChange={(e) => setRegStudentNo(e.target.value)}
                />
              </div>
            </div>

            {regError && (
              <div className="auth-error-alert">
                <Info size={14} /> {regError}
              </div>
            )}

            {regSuccessMsg && (
              <div className="auth-success-alert">
                {regSuccessMsg}
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit-btn">
              <UserPlus size={16} /> 학과 구성원 회원가입
            </button>
          </form>
        )}

        <div className="auth-footer-notice">
          <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
          본 사이트는 학과 구성원 전용 소통 공간으로 외부인의 접근이 제한됩니다.
        </div>
      </div>
    </div>
  );
}

