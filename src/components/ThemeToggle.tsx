import { useSampleStore } from "../store/useSampleStore";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useSampleStore();

  return (
    <button
      onClick={toggleTheme}
      className="text-[8px] tracking-[0.15em] px-2 py-1 normal-case opacity-50 hover:opacity-100 transition-opacity"
      style={{ border: "1px solid var(--fg)", color: "var(--fg)" }}
    >
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}
