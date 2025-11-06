/**
 * LogicOperatorButtons - Logical operator and parenthesis buttons
 * A presentational component that calls a parent function on click.
 */
import React, { useContext, useRef, useEffect } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import styles from './SearchBar.module.css';

export function LogicOperatorButtons({ onOperatorClick, onBracketClick, focusedIndex, onMouseEnter, onKeyDown }) {
  const { operator } = useContext(SearchContext);
  const buttonRefs = useRef([]);

  // All buttons: operators + parentheses + coordinates
  // focusedIndex corresponds to the order of ALL_BUTTONS in SearchContainer: ['AND', 'OR', 'NOT', '(', ')', '[,,]']
  const allButtons = [
    { label: 'AND', id: 'AND' },
    { label: 'OR', id: 'OR' },
    { label: 'NOT', id: 'NOT' },
    { label: '(', id: 'LPAREN', isCoord: false },
    { label: ')', id: 'RPAREN', isCoord: false },
    { label: '[,,]', id: 'COORD', isCoord: true },
  ];

  // When the focus index changes, focus the corresponding button
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
