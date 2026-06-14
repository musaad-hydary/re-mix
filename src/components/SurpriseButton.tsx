import { useEffect } from "react";
import { useSampleStore } from "../store/useSampleStore";

export default function SurpriseButton() {
  const { surpriseMe, isLoading } = useSampleStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isLoading) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        surpriseMe();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [surpriseMe, isLoading]);

  return (
    <div className="text-center mt-1">
      <button
        onClick={surpriseMe}
        disabled={isLoading}
        className="halftone-hover font-display text-[16px] tracking-[0.05em] px-9 py-3.5 cursor-pointer disabled:opacity-50 transition-opacity normal-case"
        style={{
          border: "2px solid var(--fg)",
          background: "var(--fg)",
          color: "var(--bg)",
          clipPath:
            "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
        }}
      >
        {isLoading ? "Loading..." : "Inspire Me"}
      </button>
    </div>
  );
}
