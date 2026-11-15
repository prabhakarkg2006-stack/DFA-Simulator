
import { useEffect, useState } from "react";
import {
  Database,
  Trash2,
  Download,
  RefreshCw,
  History as HistoryIcon
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000";

function History({ onDfaLoaded }) {
  const [savedDfas, setSavedDfas] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [activeTab, setActiveTab] = useState("saved");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [dfaResponse, historyResponse] = await Promise.all([
        fetch(`${API_URL}/api/dfa/saved`),
        fetch(`${API_URL}/api/history`)
      ]);

      const dfaData = await dfaResponse.json();
      const historyData = await historyResponse.json();

      if (!dfaResponse.ok || !historyResponse.ok) {
        throw new Error("Could not retrieve database records.");
      }

      setSavedDfas(dfaData.saved_dfas);
      setSimulations(historyData.history);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadDfa(id) {
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/dfa/saved/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load DFA.");
      }

      const dfa = {
        ...data.saved_dfa.configuration,
        saved_id: data.saved_dfa.id,
        saved_name: data.saved_dfa.name
      };

      onDfaLoaded(dfa);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeDfa(id) {
    if (!window.confirm("Delete this saved DFA configuration?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/dfa/saved/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete DFA.");
      }

      setMessage(data.message);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearHistory() {
    if (!window.confirm("Delete all simulation history records?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/history`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not clear history.");
      }

      setMessage(data.message);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function formatDate(value) {
    return new Date(value).toLocaleString();
  }

  return (
    <div className="page-content">
      <div className="page-title">
        <div>
          <span className="eyebrow">LOCAL DATABASE</span>
          <h1>Saved DFAs & History</h1>
          <p>Manage saved configurations and previous simulations.</p>
        </div>

        <div className="page-title-icon blue-bg">
          <Database size={28} />
        </div>
      </div>

      <div className="history-toolbar">
        <div className="history-tabs">
          <button
            className={activeTab === "saved" ? "history-tab active" : "history-tab"}
            onClick={() => setActiveTab("saved")}
          >
            <Database size={16} />
            Saved DFAs ({savedDfas.length})
          </button>

          <button
            className={activeTab === "simulations" ? "history-tab active" : "history-tab"}
            onClick={() => setActiveTab("simulations")}
          >
            <HistoryIcon size={16} />
            Simulations ({simulations.length})
          </button>
        </div>

        <button
          className="secondary-button"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {loading ? (
        <div className="form-card history-empty">
          Loading database records...
        </div>
      ) : activeTab === "saved" ? (
        <div className="history-list">
          {savedDfas.length === 0 ? (
            <div className="form-card history-empty">
              <Database size={32} />
              <h3>No saved DFAs yet</h3>
              <p>Generate or create a DFA to save it here.</p>
            </div>
          ) : (
            savedDfas.map((dfa) => (
              <div className="history-record" key={dfa.id}>
                <div className="history-record-main">
                  <div className="record-icon">
                    <Database size={20} />
                  </div>

                  <div>
                    <h3>{dfa.name}</h3>
                    <p>
                      {dfa.creation_mode} · Saved {formatDate(dfa.created_at)}
                    </p>
                  </div>
                </div>

                <div className="record-actions">
                  <button
                    className="secondary-button"
                    onClick={() => loadDfa(dfa.id)}
                  >
                    <Download size={15} />
                    Load
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => removeDfa(dfa.id)}
                    aria-label={`Delete ${dfa.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="history-list">
          {simulations.length > 0 && (
            <div className="history-actions">
              <button
                className="delete-button clear-history-button"
                onClick={clearHistory}
              >
                <Trash2 size={15} />
                Clear all history
              </button>
            </div>
          )}

          {simulations.length === 0 ? (
            <div className="form-card history-empty">
              <HistoryIcon size={32} />
              <h3>No simulation history</h3>
              <p>Your simulation attempts will appear here.</p>
            </div>
          ) : (
            simulations.map((item) => (
              <div className="history-record" key={item.id}>
                <div className="history-record-main">
                  <div className="record-icon">
                    <HistoryIcon size={20} />
                  </div>

                  <div>
                    <h3>{item.dfa_name}</h3>
                    <p>
                      Input: <strong>{item.input_string || "(empty)"}</strong>
                      {" · "}Final state: {item.final_state || "—"}
                    </p>
                    <p>{formatDate(item.created_at)}</p>
                  </div>
                </div>

                <span
                  className={
                    item.result === "Accepted"
                      ? "loaded-badge"
                      : "rejected-badge"
                  }
                >
                  {item.result}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default History;
