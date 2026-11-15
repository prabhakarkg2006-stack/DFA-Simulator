
import { useState } from "react";
import {
  Play,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

import DFAVisualization from "./DFAVisualization";
import TransitionTable from "./TransitionTable";

const API_URL = "http://127.0.0.1:5000";

function Simulator({ currentDfa }) {
  const [inputString, setInputString] = useState("101");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  async function simulate(event) {
    event.preventDefault();

    if (!currentDfa) {
      setError("Create or generate a DFA before starting simulation.");
      return;
    }

    setError("");
    setResult(null);
    setActiveStep(0);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/dfa/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
{
  alphabet: currentDfa.alphabet,
  states: currentDfa.states,
  initial_state: currentDfa.initial_state,
  final_states: currentDfa.final_states,
  transitions: currentDfa.transitions,
  input_string: inputString,
  dfa_id: currentDfa.saved_id || null,
  dfa_name: currentDfa.saved_name || "Current DFA"
}
)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Simulation failed.");
      }

      setResult(data);
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

  function goToPreviousStep() {
    setActiveStep((current) => Math.max(0, current - 1));
  }

  function goToNextStep() {
    setActiveStep((current) =>
      Math.min(result.history.length - 1, current + 1)
    );
  }

  return (
    <div className="page-content">
      <div className="page-title">
        <div>
          <span className="eyebrow">INPUT PROCESSING</span>
          <h1>DFA Simulator</h1>
          <p>Simulate input strings and visualize state transitions.</p>
        </div>

        <div className="page-title-icon green-bg">
          <Play size={28} />
        </div>
      </div>

      <div className="form-card">
        <h2>Active DFA Configuration</h2>

        {currentDfa ? (
          <>
            <div className="dfa-summary">
              <div>
                <span>Creation mode</span>
                <strong>
                  {currentDfa.creation_mode || "automatic"}
                </strong>
              </div>

              <div>
                <span>Number of states</span>
                <strong>{currentDfa.states.length}</strong>
              </div>

              <div>
                <span>Alphabet</span>
                <strong>{currentDfa.alphabet.join(", ")}</strong>
              </div>
            </div>

            <p className="configuration-line">
              Initial state: <strong>{currentDfa.initial_state}</strong>
            </p>

            <p className="configuration-line">
              Final states:{" "}
              <strong>{currentDfa.final_states.join(", ")}</strong>
            </p>
          </>
        ) : (
          <div className="empty-state">
            <p>No DFA configuration is currently loaded.</p>
            <p>Generate a DFA or create one manually first.</p>
          </div>
        )}
      </div>

      <div className="form-card">
        <h2>Run Simulation</h2>

        <p className="form-description">
          Enter a string using only the symbols in your DFA alphabet.
        </p>

        <form onSubmit={simulate}>
          <label>Input String</label>

          <input
            value={inputString}
            onChange={(event) => setInputString(event.target.value)}
            placeholder="Example: 101"
            required
          />

          {error && (
            <div className="error-message">{error}</div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading || !currentDfa}
          >
            {loading ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Simulating...
              </>
            ) : (
              <>
                <Play size={17} />
                Run Simulation
              </>
            )}
          </button>
        </form>
      </div>

      {currentDfa && (
        <>
          <div className="form-card visualization-card">
            <DFAVisualization
              dfa={currentDfa}
              history={result?.history || []}
              activeStep={activeStep}
            />

            {result?.history && (
              <div className="step-controls">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={goToPreviousStep}
                  disabled={activeStep === 0}
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>

                <span className="step-counter">
                  Step {activeStep} of {result.history.length - 1}
                </span>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={goToNextStep}
                  disabled={activeStep === result.history.length - 1}
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="form-card">
            <TransitionTable
              dfa={currentDfa}
              history={result?.history || []}
              activeStep={activeStep}
            />
          </div>
        </>
      )}

      {result && (
        <div className="form-card result-card">
          <div className="result-heading">
            {result.accepted ? (
              <CheckCircle2 size={32} className="success-text" />
            ) : (
              <XCircle size={32} className="failure-text" />
            )}

            <div>
              <h2>{result.result}</h2>
              <p>{result.message}</p>
            </div>
          </div>

          <div className="result-details">
            <div>
              <span>Input</span>
              <strong>{result.input_string}</strong>
            </div>

            <div>
              <span>Final State Reached</span>
              <strong>{result.final_state_reached}</strong>
            </div>

            <div>
              <span>Symbols Read</span>
              <strong>{result.total_symbols}</strong>
            </div>
          </div>

          <h3 className="history-title">Simulation Steps</h3>

          <div className="simulation-history">
            {result.history.map((step) => (
              <button
                type="button"
                className={
                  activeStep === step.step
                    ? "simulation-step selected-step"
                    : "simulation-step"
                }
                key={step.step}
                onClick={() => setActiveStep(step.step)}
              >
                <span className="step-number">{step.step}</span>

                <div>
                  <strong>{step.description}</strong>

                  {step.symbol !== null && (
                    <p>
                      Read symbol: <b>{step.symbol}</b>
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Simulator;
