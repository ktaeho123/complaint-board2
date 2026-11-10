-- ==============================================================================
-- 학과 소통 & 불만 게시판 (Complaint Board) Supabase 스키마 (v4 - 알림 시스템 포함)
-- ==============================================================================

-- 1. 게시글 (posts) 테이블
CREATE TABLE IF NOT EXISTS public.posts (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL DEFAULT '불만/건의',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '익명',
  is_anonymous BOOLEAN DEFAULT false,
  password TEXT NOT NULL,
  author_token TEXT,
  status TEXT NOT NULL DEFAULT '접수대기',
  visibility TEXT NOT NULL DEFAULT 'public',
  allow_likes BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT true,
  attachments JSONB DEFAULT '[]'::jsonb,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_deleted_by_admin BOOLEAN DEFAULT false,
  admin_delete_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 댓글 (comments) 테이블
CREATE TABLE IF NOT EXISTS public.comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT '익명',
  is_anonymous BOOLEAN DEFAULT false,
  content TEXT NOT NULL,
  password TEXT NOT NULL,
  author_token TEXT,
  is_deleted_by_admin BOOLEAN DEFAULT false,
  admin_delete_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 🎯 알림 (notifications) 테이블
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_token TEXT NOT NULL, -- 알림을 받을 작성자 토큰
  post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
  post_title TEXT NOT NULL,
  comment_author TEXT NOT NULL,
  comment_content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 관리자 규정 위반 삭제 통보 이력 (admin_audit_logs)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id BIGINT NOT NULL,
  target_title TEXT,
  target_author TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_token);

-- RLS 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 게시글 및 댓글 조회/작성 가능
DROP POLICY IF EXISTS "게시글 누구나 조회 가능" ON public.posts;
CREATE POLICY "게시글 누구나 조회 가능" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "게시글 누구나 작성 가능" ON public.posts;
CREATE POLICY "게시글 누구나 작성 가능" ON public.posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "게시글 수정 가능" ON public.posts;
CREATE POLICY "게시글 수정 가능" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "게시글 삭제 가능" ON public.posts;
CREATE POLICY "게시글 삭제 가능" ON public.posts FOR DELETE USING (true);

-- 댓글 정책
DROP POLICY IF EXISTS "댓글 누구나 조회 가능" ON public.comments;
CREATE POLICY "댓글 누구나 조회 가능" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "댓글 작성 가능" ON public.comments;
CREATE POLICY "댓글 작성 가능" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "댓글 수정 가능" ON public.comments;
CREATE POLICY "댓글 수정 가능" ON public.comments FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "댓글 삭제 가능" ON public.comments;
CREATE POLICY "댓글 삭제 가능" ON public.comments FOR DELETE USING (true);

-- 알림 정책
DROP POLICY IF EXISTS "알림 조회 가능" ON public.notifications;
CREATE POLICY "알림 조회 가능" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "알림 작성 가능" ON public.notifications;
CREATE POLICY "알림 작성 가능" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "알림 수정 가능" ON public.notifications;
CREATE POLICY "알림 수정 가능" ON public.notifications FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "알림 삭제 가능" ON public.notifications;
CREATE POLICY "알림 삭제 가능" ON public.notifications FOR DELETE USING (true);

-- 감사 로그 정책
DROP POLICY IF EXISTS "감사로그 조회 가능" ON public.admin_audit_logs;
CREATE POLICY "감사로그 조회 가능" ON public.admin_audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "감사로그 작성 가능" ON public.admin_audit_logs;
CREATE POLICY "감사로그 작성 가능" ON public.admin_audit_logs FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- RPC 함수
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.increment_views(post_id BIGINT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_views INTEGER;
BEGIN
  UPDATE public.posts
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id
  RETURNING views INTO new_views;
  RETURN new_views;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_likes(post_id BIGINT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes INTEGER;
  can_like BOOLEAN;
BEGIN
  SELECT allow_likes INTO can_like FROM public.posts WHERE id = post_id;
  IF can_like IS DISTINCT FROM false THEN
    UPDATE public.posts
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = post_id
    RETURNING likes INTO new_likes;
    RETURN new_likes;
  ELSE
    RAISE EXCEPTION '이 게시글은 공감이 허용되지 않았습니다.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_post(p_id BIGINT, p_reason TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_title TEXT;
  v_author TEXT;
BEGIN
  SELECT title, author INTO v_title, v_author FROM public.posts WHERE id = p_id;
  IF v_title IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.admin_audit_logs (target_type, target_id, target_title, target_author, reason)
  VALUES ('post', p_id, v_title, v_author, p_reason);

  DELETE FROM public.posts WHERE id = p_id;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_comment(c_id BIGINT, p_reason TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_content TEXT;
  v_author TEXT;
BEGIN
  SELECT content, author INTO v_content, v_author FROM public.comments WHERE id = c_id;
  IF v_author IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.admin_audit_logs (target_type, target_id, target_title, target_author, reason)
  VALUES ('comment', c_id, SUBSTRING(v_content, 1, 30), v_author, p_reason);

  DELETE FROM public.comments WHERE id = c_id;
  RETURN TRUE;
END;
$$;
