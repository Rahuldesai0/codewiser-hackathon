const RANGE_OPTIONS = [
  { value: "day", label: "1 day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "all", label: "All time" }
];

const CHART_WIDTH = 760;
const CHART_HEIGHT = 280;
const PADDING = { top: 20, right: 20, bottom: 42, left: 40 };

function cloneDate(date) {
  return new Date(date.getTime());
}

function addDays(date, amount) {
  const next = cloneDate(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date, amount) {
  const next = cloneDate(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function addYears(date, amount) {
  const next = cloneDate(date);
  next.setFullYear(next.getFullYear() + amount);
  return next;
}

function startOfHour(date) {
  const next = cloneDate(date);
  next.setMinutes(0, 0, 0);
  return next;
}

function startOfDay(date) {
  const next = cloneDate(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date) {
  const next = startOfDay(date);
  next.setDate(1);
  return next;
}

function startOfYear(date) {
  const next = startOfDay(date);
  next.setMonth(0, 1);
  return next;
}

function formatBucketLabel(date, range) {
  switch (range) {
    case "day":
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    case "week":
      return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric"
      });
    case "month":
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
      });
    case "year":
      return date.toLocaleDateString("en-IN", {
        month: "short"
      });
    default:
      return String(date.getFullYear());
  }
}

function buildBuckets(range, sessions) {
  const now = new Date();

  if (range === "day") {
    const current = startOfHour(now);
    const first = addDays(current, -1);
    const alignedStart = new Date(first.getTime());
    alignedStart.setHours(first.getHours() - (first.getHours() % 2), 0, 0, 0);
    return Array.from({ length: 13 }, (_unused, index) => {
      const start = new Date(alignedStart.getTime() + index * 2 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      return { start, end, label: formatBucketLabel(start, range) };
    });
  }

  if (range === "week") {
    const start = startOfDay(addDays(now, -6));
    return Array.from({ length: 7 }, (_unused, index) => {
      const bucketStart = addDays(start, index);
      return {
        start: bucketStart,
        end: addDays(bucketStart, 1),
        label: formatBucketLabel(bucketStart, range)
      };
    });
  }

  if (range === "month") {
    const start = startOfDay(addDays(now, -28));
    return Array.from({ length: 5 }, (_unused, index) => {
      const bucketStart = addDays(start, index * 7);
      return {
        start: bucketStart,
        end: addDays(bucketStart, 7),
        label: formatBucketLabel(bucketStart, range)
      };
    });
  }

  if (range === "year") {
    const currentMonth = startOfMonth(now);
    const start = addMonths(currentMonth, -11);
    return Array.from({ length: 12 }, (_unused, index) => {
      const bucketStart = addMonths(start, index);
      return {
        start: bucketStart,
        end: addMonths(bucketStart, 1),
        label: formatBucketLabel(bucketStart, range)
      };
    });
  }

  const datedSessions = sessions
    .map((session) => new Date(session.startedAt))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => left - right);
  const firstYear = datedSessions.length ? datedSessions[0].getFullYear() : now.getFullYear();
  const lastYear = datedSessions.length ? datedSessions[datedSessions.length - 1].getFullYear() : now.getFullYear();
  const bucketCount = Math.max(1, lastYear - firstYear + 1);

  return Array.from({ length: bucketCount }, (_unused, index) => {
    const start = startOfYear(new Date(firstYear + index, 0, 1));
    return {
      start,
      end: addYears(start, 1),
      label: formatBucketLabel(start, range)
    };
  });
}

function average(values) {
  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildTrendPoints(sessions, range) {
  const buckets = buildBuckets(range, sessions);
  const normalizedSessions = sessions
    .map((session) => ({
      startedAt: new Date(session.startedAt),
      percentage: Number(session.percentage ?? 0)
    }))
    .filter((session) => !Number.isNaN(session.startedAt.getTime()));

  return buckets.map((bucket) => {
    const values = normalizedSessions
      .filter((session) => session.startedAt >= bucket.start && session.startedAt < bucket.end)
      .map((session) => session.percentage);

    return {
      label: bucket.label,
      value: average(values),
      count: values.length
    };
  });
}

function fillMissingTrendValues(points) {
  const filled = points.map((point) => ({ ...point, interpolated: false }));
  const knownIndexes = filled
    .map((point, index) => (point.value == null ? null : index))
    .filter((index) => index != null);

  if (!knownIndexes.length) {
    return filled;
  }

  const firstKnown = knownIndexes[0];
  const lastKnown = knownIndexes[knownIndexes.length - 1];

  for (let index = 0; index < firstKnown; index += 1) {
    filled[index].value = filled[firstKnown].value;
    filled[index].interpolated = true;
  }

  for (let index = lastKnown + 1; index < filled.length; index += 1) {
    filled[index].value = filled[lastKnown].value;
    filled[index].interpolated = true;
  }

  for (let cursor = 0; cursor < knownIndexes.length - 1; cursor += 1) {
    const leftIndex = knownIndexes[cursor];
    const rightIndex = knownIndexes[cursor + 1];
    const gap = rightIndex - leftIndex;
    if (gap <= 1) {
      continue;
    }

    const leftValue = filled[leftIndex].value;
    const rightValue = filled[rightIndex].value;
    for (let offset = 1; offset < gap; offset += 1) {
      const ratio = offset / gap;
      filled[leftIndex + offset].value = leftValue + (rightValue - leftValue) * ratio;
      filled[leftIndex + offset].interpolated = true;
    }
  }

  return filled;
}

function buildPath(points) {
  const drawableWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const drawableHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const step = points.length > 1 ? drawableWidth / (points.length - 1) : 0;
  const segments = [];
  let current = "";

  points.forEach((point, index) => {
    if (point.value == null) {
      if (current) {
        segments.push(current);
        current = "";
      }
      return;
    }

    const x = PADDING.left + step * index;
    const y = PADDING.top + ((100 - point.value) / 100) * drawableHeight;
    const command = `${current ? "L" : "M"} ${x} ${y}`;
    current = current ? `${current} ${command}` : command;
  });

  if (current) {
    segments.push(current);
  }

  return {
    segments,
    points: points.map((point, index) => {
      const x = PADDING.left + step * index;
      const y = point.value == null
        ? null
        : PADDING.top + ((100 - point.value) / 100) * drawableHeight;
      return { ...point, x, y };
    })
  };
}

export function AccuracyTrendCard({
  sessions,
  range,
  onRangeChange,
  loading = false
}) {
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const points = fillMissingTrendValues(buildTrendPoints(safeSessions, range));
  const path = buildPath(points);
  const yTicks = [0, 25, 50, 75, 100];
  const drawableHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  return (
    <section className="panel chart-card line-chart-card">
      <div className="panel-header">
        <h3>Accuracy over time</h3>
        <label className="field concept-select chart-range-select">
          <span>Range</span>
          <select value={range} onChange={(event) => onRangeChange(event.target.value)}>
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? <p className="muted">Refreshing history...</p> : null}
      {safeSessions.length ? (
        <div className="line-chart-wrap">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="line-chart-svg" role="img" aria-label="Accuracy over time">
            {yTicks.map((tick) => {
              const y = PADDING.top + ((100 - tick) / 100) * drawableHeight;
              return (
                <g key={tick}>
                  <line className="line-chart-grid" x1={PADDING.left} y1={y} x2={CHART_WIDTH - PADDING.right} y2={y} />
                  <text className="line-chart-y-label" x={PADDING.left - 10} y={y + 4}>
                    {tick}%
                  </text>
                </g>
              );
            })}
            {path.segments.map((segment, index) => (
              <path key={index} d={segment} className="line-chart-path" />
            ))}
            {path.points.map((point) =>
              point.y == null ? null : (
                <g key={point.label}>
                  <circle className="line-chart-point" cx={point.x} cy={point.y} r="4.5" />
                  <title>
                    {point.label}: {Math.round(point.value)}%{point.count
                      ? ` (${point.count} session${point.count === 1 ? "" : "s"})`
                      : point.interpolated
                        ? " (interpolated)"
                        : ""}
                  </title>
                </g>
              )
            )}
            {path.points.map((point) => (
              <text key={`label-${point.label}`} className="line-chart-x-label" x={point.x} y={CHART_HEIGHT - 12}>
                {point.label}
              </text>
            ))}
          </svg>
        </div>
      ) : (
        <p className="muted">No history is available for this user yet.</p>
      )}
    </section>
  );
}
