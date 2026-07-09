"use client";

import { useEffect } from "react";

export function Sheet({
  title,
  onClose,
  children,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fin-overlay" onClick={onClose}>
      <div className="fin-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="fin-grab" />
        {title && <h2 className="fin-sheet-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
