import { useEffect, useState } from "react";
import { useSampleStore } from "./store/useSampleStore";
import SplitDisc from "./components/SplitDisc";
import SurpriseButton from "./components/SurpriseButton";
import TrackCards from "./components/TrackCards";
import ThemeToggle from "./components/ThemeToggle";
import HistoryTrail from "./components/HistoryTrail";

function App() {
  const { error, surpriseMe, current, theme, sampleCount } = useSampleStore();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (!current) {
      surpriseMe();
    }
  }, [current, surpriseMe]);

  useEffect(() => {
    if (current) {
      const timer = setTimeout(() => setIsFirstLoad(false), 100);
      return () => clearTimeout(timer);
    }
  }, [current]);

  return (
    <div
      data-theme={theme}
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg)",
        backgroundImage:
          "radial-gradient(circle, var(--dot) 0.5px, transparent 0.5px)",
        backgroundSize: "16px 16px",
        color: "var(--fg)",
      }}
    >
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="relative pb-2">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <div className="text-center">
            <p
              className="text-[9px] tracking-[0.4em] m-0 normal-case"
              style={{ opacity: 0.6 }}
            >
              CATALOG 0x54
            </p>
            <h1 className="font-display text-[48px] tracking-[0.04em] m-0 mt-1 leading-none uppercase">
              RE//MIX
            </h1>
          </div>
        </div>

        {isFirstLoad && current && (
          <p
            className="text-[10px] tracking-[0.25em] mt-3 normal-case text-center"
            style={{ opacity: 0.55 }}
          >
            Most popular sample today
          </p>
        )}

        <SplitDisc />

        <SurpriseButton />

        {error && (
          <p
            className="text-center text-[10px] tracking-widest mt-3 normal-case"
            style={{ color: "#b3433f" }}
          >
            {error}
          </p>
        )}

        <div className="mt-6">
          <TrackCards />
        </div>

        <HistoryTrail />

        {sampleCount > 0 && (
          <p
            className="text-[9px] tracking-[0.3em] mt-6 text-center normal-case"
            style={{ opacity: 0.35 }}
          >
            Sample #{String(sampleCount).padStart(3, "0")} this session
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
