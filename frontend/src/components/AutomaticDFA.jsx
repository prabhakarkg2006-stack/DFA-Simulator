
import { useState } from "react";
import { WandSparkles, LoaderCircle, ArrowRight } from "lucide-react";

const API_URL = "http://127.0.0.1:5000";

function AutomaticDFA({ onDfaCreated }) {
  const [alphabet, setAlphabet] = useState("0,1");
  const [structure, setStructure] = useState("ends_with");
  const [pattern, setPattern] = useState("01");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const structures = [
    { value: "ends_with", label: "Strings Ending With Pattern" },
    { value: "starts_with", label: "Strings Starting With Pattern" },
    { value: "contains", label: "Contains Pattern" },
    { value: "even_ones", label: "Even Number of Ones" },
    { value: "exact_match", label: "Exact Pattern Matching" }
  ];

  async function generateDFA(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const alphabetArray = alphabet
        .split(",")
        .map((symbol) => symbol.trim())
        .filter(Boolean);

      const response = await fetch(`${API_URL}/api/dfa/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          alphabet: alphabetArray,
          structure,
          pattern: structure === "even_ones" ? null : pattern
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "DFA generation failed.");
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
          <span className="eyebrow">DFA CONSTRUCTION</span>
          <h1>Automatic DFA Generator</h1>
          <p>Generate a DFA using predefined recognition patterns.</p>
        </div>
        <div className="page-title-icon purple-bg">
          <WandSparkles size={28} />
        </div>
      </div>

      <div className="form-card">
        <h2>Configure Your DFA</h2>
        <p className="form-description">
          Enter the alphabet and choose a recognition structure.
        </p>

        <form onSubmit={generateDFA}>
          <label>Input Alphabet</label>
          <input
            value={alphabet}
            onChange={(event) => setAlphabet(event.target.value)}
            placeholder="Example: 0,1"
            required
          />
          <small>Separate symbols using commas. Example: 0,1</small>

          <label>DFA Structure</label>
          <select
            value={structure}
            onChange={(event) => setStructure(event.target.value)}
          >
            {structures.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          {structure !== "even_ones" && (
            <>
              <label>Pattern</label>
              <input
                value={pattern}
                onChange={(event) => setPattern(event.target.value)}
                placeholder="Example: 01"
                required
              />
              <small>
                Enter a pattern made from the selected alphabet.
              </small>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            className="primary-button full-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Generating...
              </>
            ) : (
              <>
                Generate DFA <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AutomaticDFA;
