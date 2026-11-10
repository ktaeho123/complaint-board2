import React, { useEffect, useState } from 'react';
import { MessageCircle, ExternalLink, Trash2, Calendar, UserCheck } from 'lucide-react';
import { postService } from '../lib/supabase';

export default function MyCommentsView({ onOpenPostById, onRefreshList }) {
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyComments();
  }, []);

  const loadMyComments = async () => {
    try {
      setLoading(true);
      const data = await postService.fetchMyComments();
      setMyComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (comment) => {
    const pwd = prompt('댓글 작성 시 설정한 비밀번호를 입력해주세요:');
    if (!pwd) return;

    try {
      await postService.deleteComment(comment.id, pwd.trim());
      alert('댓글이 삭제되었습니다.');
      loadMyComments();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      alert(err.message || '댓글 삭제에 실패했습니다.');
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="my-activities-container">
      <div className="my-activities-header">
        <div className="activity-title">
          <MessageCircle size={20} />
          <h3>내가 작성한 댓글 <span>({myComments.length})</span></h3>
        </div>
        <p>이 기기(브라우저)에서 작성한 댓글 목록입니다. 작성글로 이동하거나 직접 삭제할 수 있습니다.</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>댓글을 불러오는 중입니다...</p>
        </div>
      ) : myComments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <MessageCircle size={44} />
          </div>
          <h3>작성한 댓글이 없습니다</h3>
          <p>게시글에 의견이나 격려의 댓글을 남겨보세요!</p>
        </div>
      ) : (
        <div className="my-comments-list">
          {myComments.map((comment) => (
            <div key={comment.id} className="my-comment-card">
              <div className="my-comment-top">
                <div className="linked-post-info" onClick={() => onOpenPostById(comment.post_id)}>
                  <span className="post-ref-tag">원문 게시글</span>
                  <span className="post-ref-title">{comment.posts?.title || `게시글 #${comment.post_id}`}</span>
                  <ExternalLink size={13} />
                </div>
                <div className="my-comment-meta">
                  <Calendar size={13} />
                  <span>{formatDate(comment.created_at)}</span>
                </div>
              </div>

              <div className="my-comment-content">{comment.content}</div>

              <div className="my-comment-bottom">
                <span className="my-author-chip">작성자: {comment.author}</span>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(comment)}
                >
                  <Trash2 size={13} /> 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

