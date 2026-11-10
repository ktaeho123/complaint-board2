import React, { useEffect, useState } from 'react';
import { ShieldAlert, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { postService } from '../lib/supabase';

export default function AdminAuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await postService.fetchAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="audit-logs-container">
      <div className="audit-header">
        <div className="audit-title-wrap">
          <ShieldAlert size={22} className="admin-icon" />
          <h3>규정 위반 삭제 통보 및 조치 이력</h3>
        </div>
        <p>관리자가 게시글이나 댓글을 규정 위반 사유로 삭제할 때 투명하게 기록된 통보 이력입니다.</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>이력을 불러오는 중입니다...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <CheckCircle2 size={44} style={{ color: '#10b981' }} />
          </div>
          <h3>규정 위반 조치 이력이 없습니다</h3>
          <p>현재까지 모든 글과 댓글이 학과 게시판 운영 규정을 준수하고 있습니다.</p>
        </div>
      ) : (
        <div className="audit-list">
          {logs.map((log) => (
            <div key={log.id} className="audit-card">
              <div className="audit-card-top">
                <span className={`audit-target-badge ${log.target_type}`}>
                  {log.target_type === 'post' ? '게시글 삭제' : '댓글 삭제'}
                </span>
                <span className="audit-target-title">
                  {log.target_title || `#${log.target_id}`}
                </span>
                <span className="audit-date">
                  <Calendar size={13} /> {formatDate(log.created_at)}
                </span>
              </div>

              <div className="audit-reason-box">
                <strong>통보 사유:</strong>
                <p>{log.reason}</p>
              </div>

              <div className="audit-author-info">
                원작성자: {log.target_author || '익명'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

