export default function Masthead() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b-4 border-black pb-3 mb-6">
      <div className="flex justify-between items-center text-xs uppercase tracking-widest mb-2 font-mono">
        <span>Vol. 1 — No. {new Date().getDate()}</span>
        <span>{today}</span>
        <span>Price: Free</span>
      </div>
      <h1 className="pixel-font text-3xl md:text-5xl text-center tracking-wider py-2">
        THE SAMPLE TIMES
      </h1>
      <p className="text-center text-xs uppercase tracking-[0.3em] border-t border-black pt-2">
        Tracing the Lineage of Sound — Est. 2026
      </p>
    </header>
  );
}
