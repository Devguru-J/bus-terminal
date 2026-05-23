export function PaletteStrip({colors, max = 16}: {colors: Array<string | "">; max?: number}) {
    return (
        <div className="flex gap-1">
            {colors.slice(0, max).map((c, i) => (
                <div
                    key={i}
                    className="h-5 flex-1 rounded-sm border border-white/5"
                    style={{background: c || "transparent"}}
                    title={`palette ${i}: ${c || "—"}`}
                />
            ))}
        </div>
    );
}
