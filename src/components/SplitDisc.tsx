import { useState, useRef } from "react";
import { useSampleStore } from "../store/useSampleStore";

export default function SplitDisc() {
  const { current, currentArtwork, originalArtwork, isLoading } =
    useSampleStore();
  const [tilt, setTilt] = useState(0);
  const discRef = useRef<HTMLDivElement>(null);

  const original = current?.connections_summary.find((c) =>
    c.section.startsWith("Contains samples of"),
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = discRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const center = rect.width / 2;
    const offset = (x - center) / center;
    setTilt(offset * 15);
  };

  const handleMouseLeave = () => {
    setTilt(0);
  };

  return (
    <div className="flex flex-col items-center py-4 pb-6">
      <div
        ref={discRef}
        key={current ? `${current.artist}-${current.title}` : "empty"}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative w-[260px] h-[260px] disc-reveal ${isLoading ? "disc-spinning" : ""}`}
        style={{
          filter: "drop-shadow(0 18px 30px rgba(26,37,80,0.25))",
          transform: `perspective(800px) rotateY(${tilt}deg)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <svg
          width="260"
          height="260"
          viewBox="0 0 260 260"
          className="absolute top-0 left-0"
        >
          <defs>
            <clipPath id="discCircle">
              <circle cx="130" cy="130" r="128" />
            </clipPath>
            <clipPath id="lh">
              <rect x="0" y="0" width="130" height="260" />
            </clipPath>
            <clipPath id="rh">
              <rect x="130" y="0" width="130" height="260" />
            </clipPath>
            <pattern
              id="halftoneL"
              width="5"
              height="5"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2.5" cy="2.5" r="2" style={{ fill: "var(--fg)" }} />
            </pattern>
            <pattern
              id="halftoneR"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <rect
                x="0"
                y="0"
                width="2"
                height="2"
                style={{ fill: "var(--fg)" }}
              />
              <rect
                x="2"
                y="2"
                width="2"
                height="2"
                style={{ fill: "var(--fg)" }}
              />
            </pattern>
          </defs>

          <circle
            cx="130"
            cy="130"
            r="128"
            style={{ fill: "var(--card-light)" }}
          />

          <g clipPath="url(#discCircle)">
            <g clipPath="url(#lh)">
              {originalArtwork ? (
                <image
                  href={originalArtwork}
                  x="-65"
                  y="2"
                  width="260"
                  height="256"
                  preserveAspectRatio="xMidYMid slice"
                  opacity="0.35"
                />
              ) : (
                <rect
                  x="0"
                  y="0"
                  width="130"
                  height="260"
                  style={{ fill: "var(--card-light)" }}
                />
              )}
              <circle
                cx="130"
                cy="130"
                r="128"
                fill="url(#halftoneL)"
                opacity="0.85"
              />
            </g>

            <g clipPath="url(#rh)">
              {currentArtwork ? (
                <image
                  href={currentArtwork}
                  x="65"
                  y="2"
                  width="260"
                  height="256"
                  preserveAspectRatio="xMidYMid slice"
                  opacity="0.35"
                />
              ) : (
                <rect
                  x="130"
                  y="0"
                  width="130"
                  height="260"
                  style={{ fill: "var(--card-light)" }}
                />
              )}
              <circle
                cx="130"
                cy="130"
                r="128"
                fill="url(#halftoneR)"
                opacity="0.85"
              />
            </g>
          </g>

          <circle
            cx="130"
            cy="130"
            r="128"
            fill="none"
            strokeWidth="1.5"
            style={{ stroke: "var(--fg)" }}
          />
          <circle
            cx="130"
            cy="130"
            r="110"
            fill="none"
            strokeWidth="1"
            style={{ stroke: "var(--fg)" }}
          />

          <g strokeWidth="1" style={{ stroke: "var(--fg)" }}>
            <line x1="130" y1="2" x2="130" y2="14" />
            <line x1="130" y1="246" x2="130" y2="258" />
            <line x1="2" y1="130" x2="14" y2="130" />
            <line x1="246" y1="130" x2="258" y2="130" />
          </g>

          <line
            x1="130"
            y1="2"
            x2="130"
            y2="258"
            strokeWidth="2"
            style={{ stroke: "var(--fg)" }}
          />

          <circle
            cx="130"
            cy="130"
            r="36"
            strokeWidth="2"
            style={{ fill: "var(--card-light)", stroke: "var(--fg)" }}
          />
          <circle cx="130" cy="130" r="6" style={{ fill: "var(--fg)" }} />
        </svg>

        <div
          className="absolute -bottom-7 left-0 w-full flex justify-between px-1 text-[10px] tracking-[0.3em] font-bold whitespace-nowrap"
          style={{ color: "var(--fg)" }}
        >
          <span>ORIGIN</span>
          <span>FLIP</span>
        </div>
      </div>

      {current && (
        <div className="mt-7 text-center">
          <p
            className="font-display text-[22px]"
            style={{ color: "var(--fg)" }}
          >
            {current.title}
          </p>
          <p
            className="text-[10px] mt-1 tracking-[0.2em] normal-case"
            style={{ color: "var(--fg)", opacity: 0.65 }}
          >
            {current.artist}
            {current.year ? ` — ${current.year}` : ""}
          </p>
          {original && (
            <p
              className="text-[10px] mt-2 tracking-[0.15em] normal-case"
              style={{ color: "var(--fg)", opacity: 0.5 }}
            >
              samples {original.artist} — {original.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
