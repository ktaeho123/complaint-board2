import React from 'react';
import { Filter, ArrowUpDown, Search, X } from 'lucide-react';

export default function FilterBar({
  selectedStatus,
  onChangeStatus,
  selectedSort,
  onChangeSort,
  searchQuery,
  onChangeSearch,
  onClearSearch
}) {
  return (
    <div className="filter-bar">
      <div className="filter-left">
        <div className="select-group">
          <label htmlFor="statusFilter">
            <Filter size={15} /> 상태:
          </label>
          <select
            id="statusFilter"
            className="form-select"
            value={selectedStatus}
            onChange={(e) => onChangeStatus(e.target.value)}
          >
            <option value="전체">모든 상태</option>
            <option value="접수대기">접수대기</option>
            <option value="처리중">처리중</option>
            <option value="답변완료">답변완료</option>
            <option value="공지">공지</option>
          </select>
        </div>

        <div className="select-group">
          <label htmlFor="sortFilter">
            <ArrowUpDown size={15} /> 정렬:
          </label>
          <select
            id="sortFilter"
            className="form-select"
            value={selectedSort}
            onChange={(e) => onChangeSort(e.target.value)}
          >
            <option value="latest">최신순</option>
            <option value="views">조회순</option>
            <option value="likes">추천순</option>
          </select>
        </div>
      </div>

      <div className="filter-right">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="제목, 내용, 작성자 검색..."
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="search-clear-btn" onClick={onClearSearch}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

