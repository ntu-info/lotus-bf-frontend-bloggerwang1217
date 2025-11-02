/**
 * useInfiniteScroll Hook
 * Handles infinite scroll functionality
 */
import { useState, useEffect, useRef } from 'react';
import { PAGINATION } from '../utils/constants';

export function useInfiniteScroll(items = [], batchSize = PAGINATION.BATCH_SIZE) {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  // Initialize with first batch
  useEffect(() => {
    if (items.length > 0) {
      setDisplayedItems(items.slice(0, batchSize));
      setHasMore(items.length > batchSize);
    }
  }, [items, batchSize]);

  // Setup intersection observer
  useEffect(() => {
    const currentSentinel = sentinelRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore) {
            // Load next batch
            setDisplayedItems((prev) => {
              const nextBatch = items.slice(
                prev.length,
                prev.length + batchSize
              );
              setHasMore(prev.length + nextBatch.length < items.length);
              return [...prev, ...nextBatch];
            });
          }
        });
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [items, hasMore, batchSize]);

  return {
    displayedItems,
    hasMore,
    sentinelRef,
  };
}
