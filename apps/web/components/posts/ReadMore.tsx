import React, { useLayoutEffect, useRef,useState } from "react";

interface UseTruncatedElementProps {
  ref: React.RefObject<HTMLElement | null>;
}

interface UseTruncatedElementReturn {
  isTruncated: boolean;
  isReadingMore: boolean;
  setIsReadingMore: (value: boolean) => void;
}

const useTruncatedElement = ({
  ref,
}: UseTruncatedElementProps): UseTruncatedElementReturn => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [isReadingMore, setIsReadingMore] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const checkTruncation = () => {
      const { offsetHeight, scrollHeight } = element;

      // Thêm buffer 1px để tránh trường hợp sai lệch do làm tròn số
      if (offsetHeight && scrollHeight && offsetHeight + 1 < scrollHeight) {
        setIsTruncated(true);
      } else {
        setIsTruncated(false);
      }
    };

    checkTruncation();

    // Thêm event listener để xử lý resize
    window.addEventListener("resize", checkTruncation);

    return () => {
      window.removeEventListener("resize", checkTruncation);
    };
  }, [ref]);

  return {
    isTruncated,
    isReadingMore,
    setIsReadingMore,
  };
};

interface NoteProps {
  content?: string;
  className?: string;
  gradientClass?: string;
}

export default function ReadMore({
  content,
  className = "",
  gradientClass = "bg-gradient-to-t from-card via-card/90 to-transparent",
}: NoteProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { isTruncated, isReadingMore, setIsReadingMore } = useTruncatedElement({
    ref: ref as React.RefObject<HTMLElement | null>,
  });

  return (
    <div className={`relative ${className}`}>
      <p
        ref={ref}
        className={`wrap-break-word whitespace-pre-line text-[15px] leading-relaxed text-foreground transition-all duration-200 ${
          !isReadingMore ? "max-h-[4.8rem] overflow-hidden" : ""
        }`}
      >
        {content}
      </p>

      {isTruncated && !isReadingMore && (
        <div
          className={`absolute bottom-0 left-0 w-full h-12 flex items-end justify-center pb-0 ${gradientClass}`}
        >
          <button
            onClick={() => setIsReadingMore(true)}
            className="text-xs font-semibold text-primary hover:text-primary/90 bg-card/95 px-3 py-1 rounded-full shadow-sm backdrop-blur-[2px] border transition-transform hover:scale-105 active:scale-95"
          >
            Xem thêm
          </button>
        </div>
      )}

      {isReadingMore && isTruncated && (
        <button
          onClick={() => setIsReadingMore(false)}
          className="mt-2 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          Thu gọn
        </button>
      )}
    </div>
  );
}
