/**
 * LogicOperatorButtons - 邏輯運算符按鈕
 * 符合 prototype 的上方搜尋區設計
 */

import { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import { OPERATORS } from '../../utils/constants';
import './SearchBar.module.css';

export function LogicOperatorButtons() {
  const { operator, setOperator, query, setQuery } = useContext(SearchContext);

  const handleOperatorClick = (opId) => {
    setOperator(opId);
    
    // 如果搜尋框有內容，自動在末尾添加運算符
    if (query.trim()) {
      const trimmedQuery = query.trim();
      // 檢查是否已有運算符
      const hasOperator = OPERATORS.some(op => trimmedQuery.endsWith(op.label));
      
      if (!hasOperator) {
        setQuery(`${trimmedQuery} ${opId} `);
      }
    }
  };

  return (
    <div className="operator-buttons">
      {OPERATORS.map((op) => (
        <button
          key={op.id}
          className={`operator-btn ${operator === op.id ? 'active' : ''}`}
          onClick={() => handleOperatorClick(op.id)}
          title={`${op.label} 運算符`}
          type="button"
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
