export default function SoundBars() {
  const bars = [40, 70, 30, 90, 50, 65, 35, 80];

  return (
    <div className="flex items-end gap-[1.5px] h-3 shrink-0 opacity-50">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-[1.5px] rounded-sm"
          style={{
            height: `${height}%`,
            background: "currentColor",
            animation: `soundBar 0.8s ease-in-out ${i * 0.08}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
