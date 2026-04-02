export function ChartCard({ title, items, suffix = "%", emptyLabel = "No data yet." }) {
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

            return (
            <div key={item.label || item.subject} className="bar-entry">
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${relativeHeight}%` }}
                />
              </div>
              <strong>{item.label || item.subject}</strong>
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
