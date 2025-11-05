/**
 * LogicOperatorButtons - 邏輯運算符和括號按鈕
 * A presentational component that calls a parent function on click.
 */
import React, { useContext, useRef, useEffect } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import styles from './SearchBar.module.css';

export function LogicOperatorButtons({ onOperatorClick, onBracketClick, focusedIndex, onMouseEnter, onKeyDown }) {
  const { operator } = useContext(SearchContext);
  const buttonRefs = useRef([]);

  // 所有按鈕：運算符 + 括號 + 座標
  // focusedIndex 對應到 ALL_BUTTONS 在 SearchContainer 中的順序: ['AND', 'OR', 'NOT', '(', ')', '[,,]']
  const allButtons = [
    { label: 'AND', id: 'AND' },
    { label: 'OR', id: 'OR' },
    { label: 'NOT', id: 'NOT' },
    { label: '(', id: 'LPAREN', isCoord: false },
    { label: ')', id: 'RPAREN', isCoord: false },
    { label: '[,,]', id: 'COORD', isCoord: true },
  ];

  // 當焦點指標改變時，聚焦相應的按鈕
  useEffect(() => {
    if (focusedIndex !== undefined && focusedIndex >= 0 && focusedIndex < buttonRefs.current.length) {
      buttonRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleClick = (btn) => {
    if (btn.isCoord || btn.label === '[,,]') {
      onBracketClick?.(btn.label);
    } else if (btn.label === '(' || btn.label === ')') {
      onBracketClick?.(btn.label);
    } else {
      onOperatorClick?.(btn.label);
    }
  };

  return (
    <div className={styles.operatorGroup}>
      {allButtons.map((btn, index) => (
        <button
          key={btn.id}
          ref={(el) => { buttonRefs.current[index] = el; }}
          className={`${styles.operatorButton} ${operator === btn.id ? styles.active : ''} ${focusedIndex === index ? styles.focused : ''}`}
          onClick={() => handleClick(btn)}
          onKeyDown={(e) => {
            // Forward keyboard events to parent for layer navigation
            onKeyDown?.(e);
          }}
          title={btn.isCoord || btn.label === '[,,]' ? 'Click to insert coordinates (cursor will be at first comma)' : 'Click to insert at cursor'}
          onMouseEnter={() => onMouseEnter?.(index)}
          type="button"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
