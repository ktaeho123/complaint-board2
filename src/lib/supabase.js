import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key-here';

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// 브라우저별 고유 사용자 식별자
// ==============================================================================
const USER_TOKEN_KEY = 'complaint_board_user_token';
export function getUserToken() {
  let token = localStorage.getItem(USER_TOKEN_KEY);
  if (!token) {
    token = 'usr_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(USER_TOKEN_KEY, token);
  }
  return token;
}

const MY_POSTS_KEY = 'complaint_board_my_posts';
const MY_COMMENTS_KEY = 'complaint_board_my_comments';

export function recordMyPost(postId, password) {
  try {
    const list = JSON.parse(localStorage.getItem(MY_POSTS_KEY) || '{}');
    list[postId] = { password, createdAt: new Date().toISOString() };
    localStorage.setItem(MY_POSTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function isMyPost(postId) {
  try {
    const list = JSON.parse(localStorage.getItem(MY_POSTS_KEY) || '{}');
    return Boolean(list[postId]);
  } catch {
    return false;
  }
}

export function getMyPostPassword(postId) {
  try {
    const list = JSON.parse(localStorage.getItem(MY_POSTS_KEY) || '{}');
    return list[postId]?.password || '';
  } catch {
    return '';
  }
}

export function recordMyComment(commentId, password) {
  try {
    const list = JSON.parse(localStorage.getItem(MY_COMMENTS_KEY) || '{}');
    list[commentId] = { password, createdAt: new Date().toISOString() };
    localStorage.setItem(MY_COMMENTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function isMyComment(commentId) {
  try {
    const list = JSON.parse(localStorage.getItem(MY_COMMENTS_KEY) || '{}');
    return Boolean(list[commentId]);
  } catch {
    return false;
  }
}

export const DEFAULT_ADMIN_KEY = 'admin2026!';

// ==============================================================================
// Local Fallback Storage
// ==============================================================================
const STORAGE_POSTS_KEY = 'complaint_board_posts';
const STORAGE_COMMENTS_KEY = 'complaint_board_comments';
const STORAGE_LOGS_KEY = 'complaint_board_audit_logs';
const STORAGE_NOTICES_KEY = 'complaint_board_notifications';

function getLocalPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_POSTS_KEY);
    if (raw) return JSON.parse(raw);
    
    // 신규 실행 시 (교수님 컴퓨터 등) 기본 제공되는 예시 데이터
    const seedPosts = [
      {
        id: 1,
        category: '공지사항',
        title: '📢 [공지] 2026년도 학과 소통 및 불만 접수 게시판 오픈 안내',
        content: '학과 구성원 여러분 안녕하십니까. 학과 소통 & 불만 접수 게시판이 정식 오픈되었습니다.\n\n* 본 게시판은 학과 내 건의사항, 시설 불만, 학사 질문을 자유롭게 나눌 수 있는 공간입니다.\n* 관리자 공지사항 글은 규정에 따라 댓글 작성이 제한됩니다.\n* 건전하고 유익한 소통 공간이 될 수 있도록 많은 이용 바랍니다.',
        author: '학과행정실(관리자)',
        is_anonymous: false,
        password: 'admin',
        author_token: 'admin_token',
        status: '공지',
        visibility: 'public',
        allow_likes: true,
        allow_comments: false,
        attachments: [],
        views: 24,
        likes: 5,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 2,
        category: '불만/건의',
        title: '공학관 3층 실습실 냉난방기 소음 및 온도 점검 요청',
        content: '3층 제2실습실 중앙 냉난방기에서 지속적인 소음이 발생하고 온도가 너무 낮게 유지되어 수업 및 자습에 지장이 있습니다. 시설팀 점검 및 조치 부탁드립니다!',
        author: '소프트웨어전공생',
        is_anonymous: false,
        password: '1234',
        author_token: 'seed_user_token',
        status: '처리중',
        visibility: 'public',
        allow_likes: true,
        allow_comments: true,
        attachments: [],
        views: 18,
        likes: 8,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    saveLocalPosts(seedPosts);
    return seedPosts;
  } catch {
    return [];
  }
}

function saveLocalPosts(posts) {
  localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
}

function getLocalComments() {
  try {
    const raw = localStorage.getItem(STORAGE_COMMENTS_KEY);
    if (raw) return JSON.parse(raw);

    const seedComments = [
      {
        id: 1,
        post_id: 2,
        author: '익명학우',
        is_anonymous: true,
        content: '저도 저번 주에 실습할 때 너무 추워서 건의드리려고 했는데 공감합니다!',
        password: '1234',
        author_token: 'seed_commenter_token',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ];
    saveLocalComments(seedComments);
    return seedComments;
  } catch {
    return [];
  }
}

function saveLocalComments(comments) {
  localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
}

function getLocalAuditLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAuditLogs(logs) {
  localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
}

function getLocalNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_NOTICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(notices) {
  localStorage.setItem(STORAGE_NOTICES_KEY, JSON.stringify(notices));
}

// ==============================================================================
// Post, Comment, Notification Service Layer
// ==============================================================================
export const postService = {
  async fetchPosts({ category = '전체', status = '전체', search = '', sort = 'latest', myOnly = false } = {}) {
    const userToken = getUserToken();

    if (isConfigured && supabase) {
      let query = supabase.from('posts').select('*');

      if (myOnly) {
        query = query.eq('author_token', userToken);
      }
      if (category !== '전체') {
        query = query.eq('category', category);
      }
      if (status !== '전체') {
        query = query.eq('status', status);
      }
      if (search.trim()) {
        const q = `%${search.trim()}%`;
        query = query.or(`title.ilike.${q},content.ilike.${q},author.ilike.${q}`);
      }

      if (sort === 'views') {
        query = query.order('views', { ascending: false });
      } else if (sort === 'likes') {
        query = query.order('likes', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } else {
      let posts = getLocalPosts();
      if (myOnly) {
        posts = posts.filter(p => p.author_token === userToken || isMyPost(p.id));
      }
      if (category !== '전체') posts = posts.filter(p => p.category === category);
      if (status !== '전체') posts = posts.filter(p => p.status === status);
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        posts = posts.filter(p => 
          p.title.toLowerCase().includes(q) || 
          p.content.toLowerCase().includes(q) || 
          p.author.toLowerCase().includes(q)
        );
      }

      if (sort === 'views') posts.sort((a, b) => b.views - a.views);
      else if (sort === 'likes') posts.sort((a, b) => b.likes - a.likes);
      else posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return posts;
    }
  },

  async createPost(postData) {
    const userToken = getUserToken();
    const isNotice = postData.category === '공지사항';
    const allowComments = isNotice ? false : (postData.allow_comments ?? true);

    const newRecord = {
      category: postData.category || '불만/건의',
      title: postData.title.trim(),
      content: postData.content.trim(),
      author: postData.is_anonymous ? '익명' : (postData.author?.trim() || '익명'),
      is_anonymous: Boolean(postData.is_anonymous),
      password: postData.password.trim(),
      author_token: userToken,
      status: postData.status || (isNotice ? '공지' : '접수대기'),
      visibility: postData.visibility || 'public',
      allow_likes: postData.allow_likes ?? true,
      allow_comments: allowComments,
      attachments: postData.attachments || [],
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('posts').insert([newRecord]).select().single();
      if (error) throw error;
      recordMyPost(data.id, postData.password.trim());
      return data;
    } else {
      const posts = getLocalPosts();
      const id = posts.length > 0 ? Math.max(...posts.map(p => p.id || 0)) + 1 : 1;
      const created = { id, ...newRecord };
      posts.unshift(created);
      saveLocalPosts(posts);
      recordMyPost(id, postData.password.trim());
      return created;
    }
  },

  async updatePost(id, updateData, password) {
    const isNotice = updateData.category === '공지사항';
    const allowComments = isNotice ? false : (updateData.allow_comments ?? true);

    const patch = {
      ...updateData,
      allow_comments: allowComments,
      updated_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('password')
        .eq('id', id)
        .single();
      
      if (fetchErr || !post) throw new Error('게시글을 찾을 수 없습니다.');
      if (post.password !== password) throw new Error('작성자 비밀번호가 일치하지 않아 수정할 수 없습니다.');

      const { data, error } = await supabase
        .from('posts')
        .update(patch)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const posts = getLocalPosts();
      const index = posts.findIndex(p => p.id === Number(id));
      if (index === -1) throw new Error('게시글을 찾을 수 없습니다.');
      if (posts[index].password !== password) {
        throw new Error('작성자 비밀번호가 일치하지 않아 수정할 수 없습니다.');
      }

      posts[index] = {
        ...posts[index],
        ...patch
      };
      saveLocalPosts(posts);
      return posts[index];
    }
  },

  async deletePost(id, password) {
    if (isConfigured && supabase) {
      const { data: post, error: fetchErr } = await supabase
        .from('posts')
        .select('password')
        .eq('id', id)
        .single();
      
      if (fetchErr || !post) throw new Error('게시글을 찾을 수 없습니다.');
      if (post.password !== password) throw new Error('작성자 비밀번호가 일치하지 않아 삭제할 수 없습니다.');

      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const posts = getLocalPosts();
      const index = posts.findIndex(p => p.id === Number(id));
      if (index === -1) throw new Error('게시글을 찾을 수 없습니다.');
      if (posts[index].password !== password) {
        throw new Error('작성자 비밀번호가 일치하지 않아 삭제할 수 없습니다.');
      }

      posts.splice(index, 1);
      saveLocalPosts(posts);
      return true;
    }
  },

  async adminDeletePost(id, reason) {
    if (!reason || !reason.trim()) {
      throw new Error('규정 위반 삭제 통보 사유를 반드시 입력해야 합니다.');
    }

    if (isConfigured && supabase) {
      const { data, error } = await supabase.rpc('admin_delete_post', {
        p_id: id,
        p_reason: reason.trim()
      });
      if (error) {
        const { data: target } = await supabase.from('posts').select('title, author').eq('id', id).single();
        if (target) {
          await supabase.from('admin_audit_logs').insert([{
            target_type: 'post',
            target_id: id,
            target_title: target.title,
            target_author: target.author,
            reason: reason.trim()
          }]);
        }
        await supabase.from('posts').delete().eq('id', id);
      }
      return true;
    } else {
      const posts = getLocalPosts();
      const index = posts.findIndex(p => p.id === Number(id));
      if (index === -1) throw new Error('게시글을 찾을 수 없습니다.');

      const target = posts[index];
      const logs = getLocalAuditLogs();
      logs.unshift({
        id: Date.now(),
        target_type: 'post',
        target_id: id,
        target_title: target.title,
        target_author: target.author,
        reason: reason.trim(),
        created_at: new Date().toISOString()
      });
      saveLocalAuditLogs(logs);

      posts.splice(index, 1);
      saveLocalPosts(posts);
      return true;
    }
  },

  async incrementViews(id) {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('increment_views', { post_id: id });
        if (!error && data !== undefined) return data;
      } catch {}
      const { data: current } = await supabase.from('posts').select('views').eq('id', id).single();
      if (current) {
        const nextViews = (current.views || 0) + 1;
        await supabase.from('posts').update({ views: nextViews }).eq('id', id);
        return nextViews;
      }
    } else {
      const posts = getLocalPosts();
      const target = posts.find(p => p.id === Number(id));
      if (target) {
        target.views = (target.views || 0) + 1;
        saveLocalPosts(posts);
        return target.views;
      }
    }
  },

  async incrementLikes(id) {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('increment_likes', { post_id: id });
        if (!error && data !== undefined) return data;
      } catch {}
      const { data: current } = await supabase.from('posts').select('likes, allow_likes').eq('id', id).single();
      if (current && current.allow_likes !== false) {
        const nextLikes = (current.likes || 0) + 1;
        await supabase.from('posts').update({ likes: nextLikes }).eq('id', id);
        return nextLikes;
      }
      throw new Error('이 게시글은 공감이 허용되지 않았습니다.');
    } else {
      const posts = getLocalPosts();
      const target = posts.find(p => p.id === Number(id));
      if (target) {
        if (target.allow_likes === false) throw new Error('이 게시글은 공감이 허용되지 않았습니다.');
        target.likes = (target.likes || 0) + 1;
        saveLocalPosts(posts);
        return target.likes;
      }
    }
  },

  // ============================================================================
  // 댓글 (Comments) & 🎯 알림 (Notifications) 자동 연동
  // ============================================================================
  async fetchComments(postId) {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (error) return [];
      return data || [];
    } else {
      const comments = getLocalComments();
      return comments.filter(c => c.post_id === Number(postId));
    }
  },

  async fetchMyComments() {
    const userToken = getUserToken();
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('comments')
        .select('*, posts(title)')
        .eq('author_token', userToken)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } else {
      const comments = getLocalComments();
      const posts = getLocalPosts();
      return comments
        .filter(c => c.author_token === userToken || isMyComment(c.id))
        .map(c => ({
          ...c,
          posts: { title: posts.find(p => p.id === c.post_id)?.title || '삭제된 게시글' }
        }));
    }
  },

  async createComment({ postId, author, isAnonymous, content, password }) {
    const userToken = getUserToken();
    let targetPost = null;

    if (isConfigured && supabase) {
      const { data: p } = await supabase.from('posts').select('title, author_token, allow_comments').eq('id', postId).single();
      targetPost = p;
    } else {
      const posts = getLocalPosts();
      targetPost = posts.find(p => p.id === Number(postId));
    }

    if (targetPost && targetPost.allow_comments === false) {
      throw new Error('관리자 공지사항 글에는 댓글을 작성할 수 없습니다.');
    }

    const newComment = {
      post_id: Number(postId),
      author: isAnonymous ? '익명' : (author?.trim() || '익명'),
      is_anonymous: Boolean(isAnonymous),
      content: content.trim(),
      password: password.trim(),
      author_token: userToken,
      created_at: new Date().toISOString()
    };

    let created = null;

    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('comments').insert([newComment]).select().single();
      if (error) throw error;
      created = data;
      recordMyComment(data.id, password.trim());
    } else {
      const comments = getLocalComments();
      const id = comments.length > 0 ? Math.max(...comments.map(c => c.id || 0)) + 1 : 1;
      created = { id, ...newComment };
      comments.push(created);
      saveLocalComments(comments);
      recordMyComment(id, password.trim());
    }

    // 🎯 내 게시물에 다른 사람이 댓글을 달았을 때 알림 생성 (본인이 본인 글에 단 댓글은 제외)
    if (targetPost && targetPost.author_token && targetPost.author_token !== userToken) {
      await this.createNotification({
        recipientToken: targetPost.author_token,
        postId: Number(postId),
        postTitle: targetPost.title || '게시글',
        commentAuthor: newComment.author,
        commentContent: newComment.content
      });
    }

    return created;
  },

  async deleteComment(commentId, password) {
    if (isConfigured && supabase) {
      const { data, error: fetchErr } = await supabase
        .from('comments')
        .select('password')
        .eq('id', commentId)
        .single();
      if (fetchErr || !data) throw new Error('댓글을 찾을 수 없습니다.');
      if (data.password !== password) throw new Error('작성자 비밀번호가 일치하지 않습니다.');

      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      return true;
    } else {
      const comments = getLocalComments();
      const index = comments.findIndex(c => c.id === Number(commentId));
      if (index === -1) throw new Error('댓글을 찾을 수 없습니다.');
      if (comments[index].password !== password) throw new Error('작성자 비밀번호가 일치하지 않습니다.');

      comments.splice(index, 1);
      saveLocalComments(comments);
      return true;
    }
  },

  async adminDeleteComment(commentId, reason) {
    if (!reason || !reason.trim()) {
      throw new Error('규정 위반 삭제 통보 사유를 입력해야 합니다.');
    }

    if (isConfigured && supabase) {
      try {
        await supabase.rpc('admin_delete_comment', {
          c_id: commentId,
          p_reason: reason.trim()
        });
      } catch {
        await supabase.from('comments').delete().eq('id', commentId);
      }
      return true;
    } else {
      const comments = getLocalComments();
      const index = comments.findIndex(c => c.id === Number(commentId));
      if (index === -1) throw new Error('댓글을 찾을 수 없습니다.');

      const target = comments[index];
      const logs = getLocalAuditLogs();
      logs.unshift({
        id: Date.now(),
        target_type: 'comment',
        target_id: commentId,
        target_title: target.content.substring(0, 30),
        target_author: target.author,
        reason: reason.trim(),
        created_at: new Date().toISOString()
      });
      saveLocalAuditLogs(logs);

      comments.splice(index, 1);
      saveLocalComments(comments);
      return true;
    }
  },

  // ============================================================================
  // 🔔 알림 (Notifications) 기능
  // ============================================================================
  async fetchNotifications() {
    const userToken = getUserToken();

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_token', userToken)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } else {
      const notices = getLocalNotifications();
      return notices
        .filter(n => n.recipient_token === userToken)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async createNotification({ recipientToken, postId, postTitle, commentAuthor, commentContent }) {
    const notice = {
      recipient_token: recipientToken,
      post_id: postId,
      post_title: postTitle,
      comment_author: commentAuthor,
      comment_content: commentContent,
      is_read: false,
      created_at: new Date().toISOString()
    };

    if (isConfigured && supabase) {
      try {
        await supabase.from('notifications').insert([notice]);
      } catch (e) {
        console.error('Notification insert failed', e);
      }
    } else {
      const notices = getLocalNotifications();
      notice.id = Date.now();
      notices.unshift(notice);
      saveLocalNotifications(notices);
    }
  },

  async markNotificationAsRead(noticeId) {
    if (isConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', noticeId);
    } else {
      const notices = getLocalNotifications();
      const target = notices.find(n => n.id === noticeId);
      if (target) {
        target.is_read = true;
        saveLocalNotifications(notices);
      }
    }
  },

  async clearAllNotifications() {
    const userToken = getUserToken();
    if (isConfigured && supabase) {
      await supabase.from('notifications').delete().eq('recipient_token', userToken);
    } else {
      let notices = getLocalNotifications();
      notices = notices.filter(n => n.recipient_token !== userToken);
      saveLocalNotifications(notices);
    }
  },

  async fetchAuditLogs() {
    if (isConfigured && supabase) {
      const { data } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false });
      return data || [];
    } else {
      return getLocalAuditLogs();
    }
  }
};
