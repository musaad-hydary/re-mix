import { useSampleStore } from "../store/useSampleStore";

export default function HistoryTrail() {
  const { history, current, loadTrack } = useSampleStore();

  const recent = history.filter(
    (h) =>
      !(
        current &&
        h.track.title === current.title &&
        h.track.artist === current.artist
      ),
  );

  if (recent.length === 0) return null;

  return (
    <div className="mt-5">
      <p
        className="text-[9px] tracking-[0.3em] mb-2 normal-case"
        style={{ color: "var(--fg)", opacity: 0.45 }}
      >
        RECENTLY VIEWED
      </p>
      <div className="flex flex-col gap-1">
        {recent.slice(0, 4).map((entry, i) => (
          <button
            key={i}
            onClick={() => loadTrack(entry.artistSlug, entry.trackSlug)}
            className="halftone-hover px-2.5 py-1.5 text-[10px] flex justify-between items-center text-left normal-case opacity-60 hover:opacity-100 transition-opacity"
            style={{ border: "1px solid var(--fg)", color: "var(--fg)" }}
          >
            <span className="truncate pr-2">
              {entry.track.artist} — {entry.track.title}
            </span>
            <span>↺</span>
          </button>
        ))}
      </div>
    </div>
  );
}
