import { useEffect, useMemo, useState } from "react";

function masteryColor(mastery) {
  const value = Math.max(0, Math.min(1, Number(mastery ?? 0.5)));
  const red = Math.round(222 - value * 120);
  const green = Math.round(78 + value * 140);
  const blue = Math.round(88 - value * 28);
  return `rgb(${red}, ${green}, ${blue})`;
}

function textColor(mastery) {
  return Number(mastery ?? 0.5) > 0.58 ? "#101217" : "#f7f2e9";
}

function computeDepths(nodes, edges) {
  const incoming = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, []]));

  for (const edge of edges) {
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);
    outgoing.set(edge.source, [...(outgoing.get(edge.source) || []), edge.target]);
  }

  const queue = nodes.filter((node) => (incoming.get(node.id) || 0) === 0).map((node) => node.id);
  const depths = new Map(queue.map((id) => [id, 0]));

  while (queue.length) {
    const current = queue.shift();
    const currentDepth = depths.get(current) || 0;

    for (const target of outgoing.get(current) || []) {
      incoming.set(target, (incoming.get(target) || 0) - 1);
      depths.set(target, Math.max(depths.get(target) || 0, currentDepth + 1));
      if ((incoming.get(target) || 0) <= 0) {
        queue.push(target);
      }
    }
  }

  for (const node of nodes) {
    if (!depths.has(node.id)) {
      depths.set(node.id, 0);
    }
  }

  return depths;
}

function buildLayout(nodes, edges) {
  const depths = computeDepths(nodes, edges);
  const levels = new Map();

  for (const node of nodes) {
    const level = depths.get(node.id) || 0;
    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level).push(node);
  }

  const orderedLevels = [...levels.entries()].sort((left, right) => left[0] - right[0]);
  const nodeWidth = 168;
  const nodeHeight = 60;
  const horizontalGap = 90;
  const verticalGap = 34;
  const padding = 28;
  const positions = new Map();
  const width = padding * 2 + orderedLevels.length * nodeWidth + Math.max(orderedLevels.length - 1, 0) * horizontalGap;
  const tallestLevel = Math.max(...orderedLevels.map(([, levelNodes]) => levelNodes.length), 1);
  const height = padding * 2 + tallestLevel * nodeHeight + Math.max(tallestLevel - 1, 0) * verticalGap;

  orderedLevels.forEach(([level, levelNodes], levelIndex) => {
    const totalLevelHeight = levelNodes.length * nodeHeight + Math.max(levelNodes.length - 1, 0) * verticalGap;
    const startY = (height - totalLevelHeight) / 2;

    levelNodes
      .slice()
      .sort((left, right) => left.topic.localeCompare(right.topic) || left.label.localeCompare(right.label))
      .forEach((node, nodeIndex) => {
        positions.set(node.id, {
          x: padding + levelIndex * (nodeWidth + horizontalGap),
          y: startY + nodeIndex * (nodeHeight + verticalGap),
          width: nodeWidth,
          height: nodeHeight,
          level,
        });
      });
  });

  return { positions, width, height, nodeWidth, nodeHeight };
}

export function ConceptGraphCard({ conceptGraph = {}, conceptRecommendations = [] }) {
  const subjectOptions = useMemo(
    () => Object.keys(conceptGraph || {}).filter((subject) => (conceptGraph[subject]?.nodes || []).length),
    [conceptGraph]
  );
  const [selectedSubject, setSelectedSubject] = useState(subjectOptions[0] || "");

  useEffect(() => {
    if (!subjectOptions.length) {
      setSelectedSubject("");
      return;
    }

    if (!subjectOptions.includes(selectedSubject)) {
      setSelectedSubject(subjectOptions[0]);
    }
  }, [selectedSubject, subjectOptions]);

  const graph = selectedSubject ? conceptGraph[selectedSubject] || { nodes: [], edges: [] } : { nodes: [], edges: [] };
  const layout = useMemo(() => buildLayout(graph.nodes || [], graph.edges || []), [graph]);
  const nodeLookup = useMemo(
    () => new Map((graph.nodes || []).map((node) => [node.id, node])),
    [graph]
  );
  const subjectRecommendations = conceptRecommendations
    .filter((entry) => entry.subject === selectedSubject)
    .slice(0, 4);

  return (
    <section className="panel concept-graph-card">
      <div className="panel-header concept-graph-header">
        <div>
          <h2>Concept dependency graph</h2>
          <p className="muted">
            Mastery flows from red to green. Edges show prerequisite relationships inside the selected subject.
          </p>
        </div>
        <label className="field concept-select">
          <span>Subject</span>
          <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
      </div>

      {graph.nodes?.length ? (
        <>
          <div className="concept-legend">
            <span className="legend-pill weak">Weak</span>
            <div className="legend-gradient" />
            <span className="legend-pill strong">Strong</span>
          </div>

          <div className="concept-graph-wrap">
            <svg
              className="concept-graph-svg"
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              role="img"
              aria-label={`${selectedSubject} concept graph`}
            >
              {(graph.edges || []).map((edge) => {
                const source = layout.positions.get(edge.source);
                const target = layout.positions.get(edge.target);
                if (!source || !target) {
                  return null;
                }

                const sourceNode = nodeLookup.get(edge.source);
                const targetNode = nodeLookup.get(edge.target);
                const strokeColor = masteryColor(
                  ((sourceNode?.mastery || 0.5) + (targetNode?.mastery || 0.5)) / 2
                );

                return (
                  <path
                    key={`${edge.source}-${edge.target}`}
                    d={`M ${source.x + source.width} ${source.y + source.height / 2} C ${source.x + source.width + 40} ${source.y + source.height / 2}, ${target.x - 40} ${target.y + target.height / 2}, ${target.x} ${target.y + target.height / 2}`}
                    className="concept-edge"
                    style={{ stroke: strokeColor }}
                  />
                );
              })}

              {(graph.nodes || []).map((node) => {
                const position = layout.positions.get(node.id);
                if (!position) {
                  return null;
                }

                return (
                  <g key={node.id} transform={`translate(${position.x}, ${position.y})`}>
                    <rect
                      rx="18"
                      ry="18"
                      width={position.width}
                      height={position.height}
                      fill={masteryColor(node.mastery)}
                      className="concept-node"
                    />
                    <text x="14" y="22" fill={textColor(node.mastery)} className="concept-node-label">
                      {node.label}
                    </text>
                    <text x="14" y="41" fill={textColor(node.mastery)} className="concept-node-meta">
                      {node.topic}
                    </text>
                    <text x={position.width - 14} y="41" textAnchor="end" fill={textColor(node.mastery)} className="concept-node-meta">
                      {Math.round((node.mastery || 0) * 100)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {subjectRecommendations.length ? (
            <div className="concept-recommendations">
              {subjectRecommendations.map((entry) => (
                <div key={`${entry.subject}-${entry.concept}`} className="concept-recommendation">
                  <strong>{entry.concept}</strong>
                  <span className="muted">
                    {Math.round((entry.mastery || 0) * 100)}% mastery, {Math.round((entry.uncertainty || 0) * 100)}% uncertainty
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <p className="muted">No concept graph data is available for this session yet.</p>
      )}
    </section>
  );
}
