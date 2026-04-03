const SMART_LABEL_MAP = {
  "General Maths": "Gen Maths",
  "Miscellaneous CS": "Misc CS",
  "Computer Security": "Comp Sec",
  "Machine Learning": "ML"
};

function formatLabel(label, condensedLabels) {
  const text = String(label || "");
  if (!condensedLabels) {
    return text;
  }

  if (SMART_LABEL_MAP[text]) {
    return SMART_LABEL_MAP[text];
  }

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && text.length > 12) {
    const initials = words.map((word) => word[0]?.toUpperCase()).join("");
    if (initials.length >= 2) {
      return initials;
    }
  }

  return text;
}

export function ChartCard({
  title,
  items,
  suffix = "%",
  emptyLabel = "No data yet.",
  labelStyle = "default",
  condensedLabels = false
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const numericValues = safeItems.map((item) => Number(item.score ?? item.percentage ?? 0));
  const maxValue = Math.max(...numericValues, 1);

  return (
    <section className="panel chart-card">
      <div className="panel-header">
        <h3>{title}</h3>
      </div>
      {safeItems.length ? (
        <div className="bar-chart">
          {safeItems.map((item, index) => {
            const value = numericValues[index];
            const relativeHeight = Math.max((value / maxValue) * 100, value > 0 ? 8 : 0);
            const rawLabel = item.label || item.subject;
            const displayLabel = formatLabel(rawLabel, condensedLabels);

            return (
            <div key={rawLabel} className={`bar-entry ${labelStyle === "angled" ? "bar-entry-angled" : ""}`}>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${relativeHeight}%` }}
                />
              </div>
              <div className="bar-label-wrap" title={rawLabel}>
                <strong className={`bar-label ${labelStyle === "angled" ? "bar-label-angled" : ""}`}>
                  {displayLabel}
                </strong>
              </div>
              <span>{Math.round(value)}{suffix}</span>
            </div>
            );
          })}
        </div>
      ) : (
        <p className="muted">{emptyLabel}</p>
      )}
    </section>
  );
}
