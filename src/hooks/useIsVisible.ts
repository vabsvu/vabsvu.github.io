import { useState, useEffect, RefObject } from "react";

export function useIsVisible(
  ref: RefObject<HTMLElement | null>,
  margin: string = "100px",
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: margin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);

  return isVisible;
}
