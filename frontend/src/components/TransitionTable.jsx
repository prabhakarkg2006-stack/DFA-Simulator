
function TransitionTable({ dfa, history = [], activeStep = 0 }) {
  if (!dfa) {
    return null;
  }

  const currentState = history[activeStep]?.next_state;

  return (
    <div className="transition-display-card">
      <div className="visualization-heading">
        <div>
          <h3>Transition Table</h3>
          <p>δ (Current State, Input Symbol) = Next State</p>
        </div>
        <span className="diagram-label">TRANSITIONS</span>
      </div>

      <div className="table-wrapper">
        <table className="transition-table">
          <thead>
            <tr>
              <th>State</th>
              {dfa.alphabet.map((symbol) => (
                <th key={symbol}>Input {symbol}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {dfa.states.map((state) => {
              const isInitial = state === dfa.initial_state;
              const isFinal = dfa.final_states.includes(state);
              const isCurrent = state === currentState;

              return (
                <tr
                  key={state}
                  className={isCurrent ? "current-transition-row" : ""}
                >
                  <td>
                    <strong>{state}</strong>

                    {isInitial && (
                      <span className="table-state-tag">Start</span>
                    )}

                    {isFinal && (
                      <span className="table-final-tag">Final</span>
                    )}
                  </td>

                  {dfa.alphabet.map((symbol) => (
                    <td key={symbol}>
                      {dfa.transitions[state][symbol]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransitionTable;
