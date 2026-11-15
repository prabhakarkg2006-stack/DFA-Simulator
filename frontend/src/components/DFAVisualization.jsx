
function DFAVisualization({ dfa, history = [], activeStep = 0 }) {
  if (!dfa || !Array.isArray(dfa.states) || dfa.states.length === 0) {
    return (
      <div className="visualization-empty">
        Create a DFA to display its state diagram.
      </div>
    );
  }

  const width = 760;
  const height = 440;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(145, 65 + dfa.states.length * 13);
  const stateRadius = 29;

  // Arrange states in a circle.
  const positions = {};

  dfa.states.forEach((state, index) => {
    const angle =
      -Math.PI / 2 + (2 * Math.PI * index) / dfa.states.length;

    positions[state] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  // Group symbols that lead from the same source to the same destination.
  const edges = [];

  dfa.states.forEach((state) => {
    dfa.alphabet.forEach((symbol) => {
      const destination = dfa.transitions?.[state]?.[symbol];

      if (!destination || !positions[destination]) return;

      const existing = edges.find(
        (edge) =>
          edge.from === state && edge.to === destination
      );

      if (existing) {
        existing.symbols.push(symbol);
      } else {
        edges.push({
          from: state,
          to: destination,
          symbols: [symbol]
        });
      }
    });
  });

  // Find the states and transitions visited up to the selected step.
  const visitedStates = new Set();

  const visitedEdges = new Set();

  history.slice(0, activeStep + 1).forEach((step) => {
    visitedStates.add(step.current_state);
    visitedStates.add(step.next_state);

    if (step.symbol !== null) {
      visitedEdges.add(
        `${step.current_state}->${step.next_state}`
      );
    }
  });

  return (
    <div className="visualization-wrapper">
      <div className="visualization-heading">
        <div>
          <h3>DFA State Diagram</h3>
          <p>Visual representation of states and transitions.</p>
        </div>
        <span className="diagram-label">SVG DIAGRAM</span>
      </div>

      <div className="svg-scroll">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="dfa-svg"
          role="img"
          aria-label="Deterministic finite automaton state diagram"
        >
          <defs>
            <marker
              id="dfa-arrow-head"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,6 L9,3 z"
                fill="#78839b"
              />
            </marker>

            <marker
              id="dfa-active-arrow"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,6 L9,3 z"
                fill="#625cf5"
              />
            </marker>
          </defs>

          {/* Transition arrows */}
          {edges.map((edge, index) => {
            const from = positions[edge.from];
            const to = positions[edge.to];

            const edgeKey = `${edge.from}->${edge.to}`;
            const active = visitedEdges.has(edgeKey);

            let path;
            let labelX;
            let labelY;

            if (edge.from === edge.to) {
              // Draw a loop for transitions returning to the same state.
              path = [
                `M ${from.x - 17} ${from.y - 22}`,
                `C ${from.x - 75} ${from.y - 95},`,
                `${from.x + 75} ${from.y - 95},`,
                `${from.x + 17} ${from.y - 22}`
              ].join(" ");

              labelX = from.x;
              labelY = from.y - 83;
            } else {
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const length = Math.sqrt(dx * dx + dy * dy) || 1;

              const unitX = dx / length;
              const unitY = dy / length;

              const startX = from.x + unitX * stateRadius;
              const startY = from.y + unitY * stateRadius;
              const endX = to.x - unitX * (stateRadius + 7);
              const endY = to.y - unitY * (stateRadius + 7);

              const middleX = (startX + endX) / 2;
              const middleY = (startY + endY) / 2;

              // Curve the arrow to keep reverse transitions readable.
              const curve = 24 + (index % 2) * 9;
              const controlX = middleX - (dy / length) * curve;
              const controlY = middleY + (dx / length) * curve;

              path = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

              labelX =
                0.25 * startX + 0.5 * controlX + 0.25 * endX;
              labelY =
                0.25 * startY + 0.5 * controlY + 0.25 * endY - 10;
            }

            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={active ? "#625cf5" : "#8792a9"}
                  strokeWidth={active ? 3.5 : 2}
                  markerEnd={
                    active
                      ? "url(#dfa-active-arrow)"
                      : "url(#dfa-arrow-head)"
                  }
                  className="dfa-edge"
                />

                <rect
                  x={labelX - 17}
                  y={labelY - 13}
                  width="34"
                  height="24"
                  rx="7"
                  fill={active ? "#e9e7ff" : "#ffffff"}
                  stroke={active ? "#625cf5" : "#e0e5ef"}
                />

                <text
                  x={labelX}
                  y={labelY + 3}
                  textAnchor="middle"
                  className="edge-label"
                  fill={active ? "#5146cf" : "#46516a"}
                >
                  {edge.symbols.join(",")}
                </text>
              </g>
            );
          })}

          {/* Initial state arrow */}
          {positions[dfa.initial_state] && (
            <g>
              <path
                d={`M ${positions[dfa.initial_state].x - 90} ${positions[dfa.initial_state].y}
                    L ${positions[dfa.initial_state].x - stateRadius - 5} ${positions[dfa.initial_state].y}`}
                stroke="#16a477"
                strokeWidth="2.5"
                fill="none"
                markerEnd="url(#dfa-arrow-head)"
              />
              <text
                x={positions[dfa.initial_state].x - 90}
                y={positions[dfa.initial_state].y - 12}
                textAnchor="middle"
                className="initial-label"
              >
                START
              </text>
            </g>
          )}

          {/* State circles */}
          {dfa.states.map((state) => {
            const position = positions[state];
            const isFinal = dfa.final_states.includes(state);
            const isActive = history.length > 0 &&
              history[activeStep]?.next_state === state;
            const isVisited = visitedStates.has(state);

            return (
              <g key={state}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={stateRadius}
                  fill={
                    isActive
                      ? "#e8e5ff"
                      : isVisited
                        ? "#eef0ff"
                        : "#ffffff"
                  }
                  stroke={isActive ? "#625cf5" : "#53617c"}
                  strokeWidth={isActive ? 4 : 2}
                />

                {isFinal && (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={stateRadius - 5}
                    fill="none"
                    stroke={isActive ? "#625cf5" : "#53617c"}
                    strokeWidth="1.8"
                  />
                )}

                <text
                  x={position.x}
                  y={position.y + 5}
                  textAnchor="middle"
                  className="state-label"
                  fill="#26324c"
                >
                  {state}
                </text>

                {isActive && (
                  <text
                    x={position.x}
                    y={position.y + 48}
                    textAnchor="middle"
                    className="active-state-label"
                  >
                    CURRENT
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="diagram-legend">
        <span><i className="legend-initial"></i> Initial state</span>
        <span><i className="legend-final"></i> Final state</span>
        <span><i className="legend-active"></i> Current state</span>
      </div>
    </div>
  );
}

export default DFAVisualization;
