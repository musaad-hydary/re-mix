import { useSampleStore } from "../store/useSampleStore";
import SoundBars from "./SoundBars";

const youtubeUrl = (artist: string, title: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title}`)}`;

const geniusUrl = (artist: string, title: string) =>
  `https://genius.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`;

const breakdownUrl = (
  artist1: string,
  title1: string,
  artist2: string,
  title2: string,
) =>
  `https://www.google.com/search?q=${encodeURIComponent(`"${artist1}" "${artist2}" sample breakdown ${title1} ${title2}`)}`;

export default function TrackCards() {
  const { current } = useSampleStore();

  if (!current) return null;

  const original = current.connections_summary.find((c) =>
    c.section.startsWith("Contains samples of"),
  );

  return (
    <div className="flex gap-3 px-0 pb-3">
      {/* Original */}
      <div
        className="flex-1 p-3"
        style={{
          background: "var(--card-light)",
          border: "2px solid var(--fg)",
          color: "var(--card-light-fg)",
          clipPath:
            "polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <p
            className="text-[9px] tracking-[0.25em] normal-case"
            style={{ opacity: 0.6 }}
          >
            ORIGINAL
          </p>
          <SoundBars />
        </div>
        {original ? (
          <>
            <p className="font-display text-[16px] leading-tight normal-case">
              {original.name}
            </p>
            <p
              className="text-[10px] mt-1 mb-2 normal-case"
              style={{ opacity: 0.65 }}
            >
              {original.artist}
              {original.year ? ` — ${original.year}` : ""}
            </p>
            <span
              className="block mb-2 text-[8px] border px-1.5 py-0.5 tracking-widest w-fit normal-case font-bold"
              style={{ borderColor: "var(--fg)" }}
            >
              {original.tag}
            </span>
            <div className="flex flex-col gap-1.5">
              <a
                href={youtubeUrl(original.artist, original.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="halftone-hover block text-center text-[9px] tracking-wide border px-2 py-1.5 normal-case"
                style={{
                  borderColor: "var(--fg)",
                  color: "var(--card-light-fg)",
                }}
              >
                WATCH
              </a>
              <a
                href={geniusUrl(original.artist, original.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="halftone-hover block text-center text-[9px] tracking-wide border px-2 py-1.5 normal-case"
                style={{
                  borderColor: "var(--fg)",
                  color: "var(--card-light-fg)",
                }}
              >
                GENIUS LYRICS
              </a>
              <a
                href={breakdownUrl(
                  original.artist,
                  original.name,
                  current.artist,
                  current.title,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="halftone-hover block text-center text-[9px] tracking-wide border px-2 py-1.5 normal-case"
                style={{
                  borderColor: "var(--fg)",
                  color: "var(--card-light-fg)",
                }}
              >
                READ MORE
              </a>
            </div>
          </>
        ) : (
          <p className="text-[10px] normal-case" style={{ opacity: 0.6 }}>
            No sample source found.
          </p>
        )}
      </div>

      {/* Flip */}
      <div
        className="flex-1 p-3"
        style={{
          background: "var(--card-dark)",
          border: "2px solid var(--fg)",
          color: "var(--card-dark-fg)",
          clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)",
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <p
            className="text-[9px] tracking-[0.25em] normal-case"
            style={{ opacity: 0.7 }}
          >
            THE FLIP
          </p>
          <SoundBars />
        </div>
        <p className="font-display text-[16px] leading-tight normal-case">
          {current.title}
        </p>
        <p
          className="text-[10px] mt-1 mb-2 normal-case"
          style={{ opacity: 0.75 }}
        >
          {current.artist}
          {current.year ? ` — ${current.year}` : ""}
        </p>
        <span
          className="block mb-2 text-[8px] border px-1.5 py-0.5 tracking-widest w-fit normal-case font-bold"
          style={{ borderColor: "var(--card-dark-fg)", opacity: 0.85 }}
        >
          {current.album ?? "SINGLE"}
        </span>
        <div className="flex flex-col gap-1.5">
          <a
            href={youtubeUrl(current.artist, current.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="halftone-hover halftone-hover-light block text-center text-[9px] tracking-wide border px-2 py-1.5 normal-case"
            style={{
              borderColor: "var(--card-dark-fg)",
              color: "var(--card-dark-fg)",
            }}
          >
            WATCH
          </a>
          <a
            href={geniusUrl(current.artist, current.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="halftone-hover halftone-hover-light block text-center text-[9px] tracking-wide border px-2 py-1.5 normal-case"
            style={{
              borderColor: "var(--card-dark-fg)",
              color: "var(--card-dark-fg)",
            }}
          >
            GENIUS LYRICS
          </a>
          {original && (
            <a
              href={breakdownUrl(
                current.artist,
                current.title,
                original.artist,
                original.name,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="halftone-hover halftone-hover-light block text-center text-[9px] tracking-wide border px-2 py-1.5 normal-case"
              style={{
                borderColor: "var(--card-dark-fg)",
                color: "var(--card-dark-fg)",
              }}
            >
              READ MORE
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
