
import { useEffect, useState } from "react";
import { PenTool, LoaderCircle, Plus } from "lucide-react";

const API_URL = "http://127.0.0.1:5000";

function ManualDFA({ onDfaCreated }) {
  const [alphabetText, setAlphabetText] = useState("0,1");
  const [statesText, setStatesText] = useState("q0,q1,q2");
  const [initialState, setInitialState] = useState("q0");
  const [finalStates, setFinalStates] = useState(["q2"]);
  const [transitions, setTransitions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const alphabet = alphabetText
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  const states = statesText
    .split(",")
    .map((state) => state.trim())
    .filter(Boolean);

  useEffect(() => {
    setInitialState((current) =>
      states.includes(current) ? current : states[0] || ""
    );

    setFinalStates((current) =>
      current.filter((state) => states.includes(state))
    );

    setTransitions((current) => {
      const updated = {};

      states.forEach((state) => {
        updated[state] = {};

        alphabet.forEach((symbol) => {
          const previousDestination = current[state]?.[symbol];

          updated[state][symbol] = states.includes(previousDestination)
            ? previousDestination
            : states[0] || "";
        });
      });

      return updated;
    });
  }, [alphabetText, statesText]);

  function updateTransition(state, symbol, destination) {
    setTransitions((current) => ({
      ...current,
      [state]: {
        ...current[state],
        [symbol]: destination
      }
    }));
  }

  function toggleFinalState(state) {
    setFinalStates((current) =>
      current.includes(state)
        ? current.filter((item) => item !== state)
        : [...current, state]
    );
  }

  async function createManualDFA(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/dfa/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          alphabet,
          states,
          initial_state: initialState,
          final_states: finalStates,
          transitions
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Manual DFA creation failed.");
      }

      onDfaCreated(data.dfa);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to backend. Start the Flask server first."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-title">
        <div>
          <span className="eyebrow">CUSTOM CONSTRUCTION</span>
          <h1>Manual DFA Builder</h1>
          <p>Define your own states and transition rules.</p>
        </div>
        <div className="page-title-icon blue-bg">
          <PenTool size={28} />
        </div>
      </div>

      <form onSubmit={createManualDFA}>
        <div className="form-card">
          <h2>1. Basic Configuration</h2>

          <label>Alphabet</label>
          <input
            value={alphabetText}
            onChange={(event) => setAlphabetText(event.target.value)}
            placeholder="0,1"
            required
          />
          <small>Enter comma-separated symbols.</small>

          <label>States</label>
          <input
            value={statesText}
            onChange={(event) => setStatesText(event.target.value)}
            placeholder="q0,q1,q2"
            required
          />
          <small>Enter comma-separated state names.</small>

          <label>Initial State</label>
          <select
            value={initialState}
            onChange={(event) => setInitialState(event.target.value)}
            required
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <label>Final States</label>
          <div className="final-state-list">
            {states.map((state) => (
              <label className="final-state-option" key={state}>
                <input
                  type="checkbox"
                  checked={finalStates.includes(state)}
                  onChange={() => toggleFinalState(state)}
                />
                {state}
              </label>
            ))}
          </div>
        </div>

        <div className="form-card transition-form-card">
          <h2>2. Define Transitions</h2>
          <p className="form-description">
            Select the destination state for each input symbol.
          </p>

          {states.length > 0 && alphabet.length > 0 ? (
            <div className="table-wrapper">
              <table className="transition-table">
                <thead>
                  <tr>
                    <th>Current State</th>
                    {alphabet.map((symbol) => (
                      <th key={symbol}>Input {symbol}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {states.map((state) => (
                    <tr key={state}>
                      <td>
                        <strong>{state}</strong>
                        {state === initialState && (
                          <span className="state-tag">Start</span>
                        )}
                        {finalStates.includes(state) && (
                          <span className="state-tag final-tag">Final</span>
                        )}
                      </td>

                      {alphabet.map((symbol) => (
                        <td key={symbol}>
                          <select
                            value={transitions[state]?.[symbol] || ""}
                            onChange={(event) =>
                              updateTransition(
                                state,
                                symbol,
                                event.target.value
                              )
                            }
                            required
                          >
                            {states.map((destination) => (
                              <option
                                key={destination}
                                value={destination}
                              >
                                {destination}
                              </option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="error-message">
              Enter at least one valid state and alphabet symbol.
            </p>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="primary-button"
          type="submit"
          disabled={loading || states.length === 0 || alphabet.length === 0}
        >
          {loading ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Creating DFA...
            </>
          ) : (
            <>
              <Plus size={18} />
              Create Manual DFA
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ManualDFA;
