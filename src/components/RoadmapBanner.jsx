import React from 'react';
import { Info } from 'lucide-react';

export default function RoadmapBanner() {
  return (
    <div className="roadmap-banner">
      <div className="banner-badge">
        <Info size={16} /> 기능 로드맵 안내
      </div>
      <div className="banner-text">
        현재 <strong>게시글 작성 및 조회(필수 기능)</strong>가 Supabase 연동 사양으로 동작 중입니다.
        <span className="upcoming-tags">
          <span className="tag">회원가입/로그인 (준비중)</span>
          <span className="tag">댓글 (준비중)</span>
          <span className="tag">파일 첨부 (준비중)</span>
          <span className="tag">알림 (준비중)</span>
        </span>
      </div>
    </div>
  );
}

