'use client'

import { ChevronDown } from 'lucide-react';
import React, { RefObject,useEffect, useState } from 'react';

import { cn } from '../lib/utils';
import { Button } from './button';

interface ScrollButtonProps {
  /** Ref to the scrollable container */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Ref to scroll anchor element at the bottom */
  scrollAnchorRef?: RefObject<HTMLDivElement | null>;
  /** Distance from bottom to show button (default: 150px) */
  threshold?: number;
  className?: string;
}

/**
 * Button that appears when user scrolls up from bottom.
 * Click to scroll back to newest messages (like Facebook Messenger).
 */
export default function ScrollButton({ 
  containerRef, 
  scrollAnchorRef,
  threshold = 150,
  className 
}: ScrollButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setVisible(distanceFromBottom > threshold);
    };

    // Initial check
    checkScroll();

    container.addEventListener('scroll', checkScroll);
    return () => container.removeEventListener('scroll', checkScroll);
  }, [containerRef, threshold]);

  const scrollToBottom = () => {
    if (scrollAnchorRef?.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      const container = containerRef.current;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  if (!visible) return null;

  return (
    <Button
      onClick={scrollToBottom}
      size="icon"
      variant="secondary"
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 z-10",
        "h-9 w-9 rounded-full shadow-lg",
        "bg-background/95 backdrop-blur border",
        "hover:bg-accent transition-all duration-200",
        className
      )}
      aria-label="Cuộn xuống tin nhắn mới nhất"
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}
