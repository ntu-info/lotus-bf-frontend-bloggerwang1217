/**
 * LogicOperatorButtons - 邏輯運算符按鈕
 * A presentational component that calls a parent function on click.
 */
import React, { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext.jsx';
import { OPERATORS } from '../../utils/constants';
import styles from './SearchBar.module.css';

export function LogicOperatorButtons({ onOperatorClick, focusedIndex, onMouseEnter }) {
  const { operator } = useContext(SearchContext);

  return (
    <div className={styles.operatorGroup}>
      {OPERATORS.map((op, index) => (
        <button
          key={op.id}
          className={`${styles.operatorButton} ${operator === op.id ? styles.active : ''} ${focusedIndex === index ? styles.focused : ''}`}
          onClick={() => onOperatorClick?.(op.label)}
          title="Click to insert at cursor"
          onMouseEnter={onMouseEnter}
          type="button"
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
