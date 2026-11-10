import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, CheckCheck, Trash2, X, ExternalLink } from 'lucide-react';
import { postService } from '../lib/supabase';

export default function NotificationDropdown({ onOpenPostById }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // 주기적으로 알림 불러오기
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await postService.fetchNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleClickNotice = async (notice) => {
    try {
      await postService.markNotificationAsRead(notice.id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
    setIsOpen(false);
    onOpenPostById(notice.post_id);
  };

  const handleClearAll = async (e) => {
    e.stopPropagation();
    try {
      await postService.clearAllNotifications();
      setNotifications([]);
    } catch (e) {
      console.error(e);
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return '방금 전';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="notification-wrap" ref={dropdownRef}>
      <button
        type="button"
        className="btn-notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="댓글 알림"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notification-badge-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-panel">
          <div className="notification-panel-header">
            <div className="panel-title">
              <Bell size={15} />
              <span>댓글 알림</span>
              {unreadCount > 0 && <span className="unread-dot">{unreadCount}</span>}
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                className="btn-clear-notices"
                onClick={handleClearAll}
                title="모든 알림 지우기"
              >
                <Trash2 size={13} /> 지우기
              </button>
            )}
          </div>

          <div className="notification-panel-body">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={28} className="empty-bell" />
                <p>도착한 새 알림이 없습니다.</p>
                <small>내 게시물에 새로운 댓글이 달리면 이곳에 알림이 표시됩니다.</small>
              </div>
            ) : (
              <div className="notification-items-list">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                    onClick={() => handleClickNotice(n)}
                  >
                    <div className="notice-icon-circle">
                      <MessageSquare size={14} />
                    </div>

                    <div className="notice-content-box">
                      <div className="notice-meta-top">
                        <span className="notice-post-name" title={n.post_title}>
                          [{n.post_title}]
                        </span>
                        <span className="notice-time">{formatRelativeTime(n.created_at)}</span>
                      </div>

                      <p className="notice-message">
                        <strong>{n.comment_author}</strong>님이 댓글을 남겼습니다:
                      </p>
                      <p className="notice-snippet">"{n.comment_content}"</p>
                    </div>

                    <ExternalLink size={12} className="notice-arrow" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

