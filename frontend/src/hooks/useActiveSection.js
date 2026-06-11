import { useEffect, useState } from "react";

/**
 * Tracks which section id (from the given list) is currently in view.
 * Uses IntersectionObserver. Returns the active section id.
 */
export function useActiveSection(ids, { rootMargin = "-40% 0px -55% 0px" } = {}) {
  const [active, setActive] = useState(ids[0] || "");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootMargin]);
  return active;
}
