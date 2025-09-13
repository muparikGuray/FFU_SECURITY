import { useMemo, useState, useCallback, useRef, useEffect } from 'react';

interface UseVirtualListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualList = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: UseVirtualListProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );

    const visibleStartIndex = Math.max(0, startIndex - overscan);

    return {
      virtualItems: items.slice(visibleStartIndex, endIndex + 1).map((item, index) => ({
        ...item,
        index: visibleStartIndex + index
      })),
      totalHeight: items.length * itemHeight,
      startIndex: visibleStartIndex,
      offsetY: visibleStartIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const scrollToIndex = useCallback((index: number) => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    scrollToIndex,
    handleScroll,
    scrollElementRef
  };
};