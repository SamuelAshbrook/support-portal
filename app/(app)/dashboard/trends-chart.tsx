type TrendsChartProps = {
  values: number[];
  daysInMonth: number;
};

export function TrendsChart({ values, daysInMonth }: TrendsChartProps) {
  const width = 720;
  const height = 280;
  const padding = { top: 16, right: 12, bottom: 28, left: 28 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(4, ...values);
  const yTicks = Array.from({ length: maxValue + 1 }, (_, i) => i);

  const xForDay = (dayIndex: number) =>
    padding.left + (dayIndex / Math.max(daysInMonth - 1, 1)) * plotWidth;

  const yForValue = (value: number) =>
    padding.top + plotHeight - (value / maxValue) * plotHeight;

  const points = values
    .map((value, index) => `${xForDay(index)},${yForValue(value)}`)
    .join(" ");

  const hasData = values.some((value) => value > 0);

  const xLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
    (day) => day === 1 || day % 2 === 1 || day === daysInMonth,
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Tickets received per day this month"
    >
      {yTicks.map((tick) => {
        const y = yForValue(tick);
        return (
          <g key={`y-${tick}`}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#eceff3"
              strokeWidth={1}
            />
            <text
              x={padding.left - 8}
              y={y + 3}
              textAnchor="end"
              className="fill-zinc-400"
              fontSize={10}
            >
              {tick}
            </text>
          </g>
        );
      })}

      {Array.from({ length: daysInMonth }, (_, i) => i).map((dayIndex) => {
        const x = xForDay(dayIndex);
        return (
          <line
            key={`x-grid-${dayIndex}`}
            x1={x}
            x2={x}
            y1={padding.top}
            y2={padding.top + plotHeight}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        );
      })}

      {hasData ? (
        <polyline
          fill="none"
          stroke="#2d3252"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      ) : null}

      {xLabels.map((day) => (
        <text
          key={`x-label-${day}`}
          x={xForDay(day - 1)}
          y={height - 8}
          textAnchor="middle"
          className="fill-zinc-400"
          fontSize={10}
        >
          {day}
        </text>
      ))}
    </svg>
  );
}
