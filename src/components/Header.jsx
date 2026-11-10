import React from 'react';
import {
  Megaphone,
  PenSquare,
  Database,
  Shield,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { isConfigured } from '../lib/supabase';
import NotificationDropdown from './NotificationDropdown';

export default function Header({
  onOpenWriteModal,
  isAdmin,
  onToggleAdmin,
  activeView,
  onSelectView,
  currentUser,
  onLogout,
  onOpenPostById
}) {
  return (
    <header className="main-header">
      <div className="header-content">
        <div className="logo-area" onClick={() => onSelectView('all')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <Megaphone size={26} />
          </div>
          <div className="logo-text">
            <h1>학과 소통 & 불만 게시판</h1>
            <p>공지와 의견을 함께 나누고 학과를 개선하는 열린 공간</p>
          </div>
        </div>

        <div className="header-actions">
          {/* 🎯 로그인 사용자 프로필 및 알림 벨 */}
          {currentUser && (
            <>
              {/* 내 게시물 댓글 알림 드롭다운 */}
              <NotificationDropdown onOpenPostById={onOpenPostById} />

              <div className="user-profile-badge">
                <UserCheck size={14} className="user-icon" />
                <span className="user-name">
                  <strong>{currentUser.name || currentUser.id}</strong> 님
                </span>
                <button
                  type="button"
                  className="btn-logout"
                  onClick={onLogout}
                  title="로그아웃하고 로그인 화면으로 이동"
                >
                  <LogOut size={13} /> 로그아웃
                </button>
              </div>
            </>
          )}

          {/* Supabase 연결 상태 */}
          <div
            className="connection-badge"
            title={
              isConfigured
                ? 'Supabase 클라우드 데이터베이스 연동됨'
                : '로컬 브라우저 모드 (Supabase 설정 대기중)'
            }
          >
            <Database size={14} />
            <span>{isConfigured ? 'Supabase 연동됨' : '로컬 모드'}</span>
            {isConfigured ? (
              <CheckCircle2 size={13} className="badge-icon-success" />
            ) : (
              <AlertCircle size={13} className="badge-icon-warning" />
            )}
          </div>

          {/* 관리자 모드 버튼 */}
          {isAdmin ? (
            <button
              type="button"
              className="btn btn-admin-active"
              onClick={onToggleAdmin}
              title="관리자 모드 해제"
            >
              <ShieldAlert size={16} />
              <span>관리자 ON</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-admin-toggle"
              onClick={onToggleAdmin}
              title="관리자 권한 로그인 (규정 위반 삭제 전용)"
            >
              <Shield size={16} />
              <span>관리자 전환</span>
            </button>
          )}

          {/* 새 글 작성 버튼 */}
          <button type="button" className="btn btn-primary" onClick={onOpenWriteModal}>
            <PenSquare size={16} /> 새 게시글 작성
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="admin-status-strip">
          <ShieldAlert size={15} />
          <span>
            <strong>관리자 모드 활성화됨:</strong> 원칙에 따라 글/댓글을 <u>임의로 수정할 수 없으며</u>, 규정에 위반되는 글·댓글에 한해 사유 통보 후 삭제할 수 있습니다.
          </span>
        </div>
      )}
    </header>
  );
}
