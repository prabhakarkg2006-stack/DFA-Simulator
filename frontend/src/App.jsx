
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import AutomaticDFA from "./components/AutomaticDFA";
import ManualDFA from "./components/ManualDFA";
import Simulator from "./components/Simulator";
import History from "./components/History";

import "./App.css";

const API_URL = "http://127.0.0.1:5000";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [currentDfa, setCurrentDfa] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  async function handleDfaCreated(dfa) {
    const creationMode =
      dfa.creation_mode ||
      (dfa.structure === "custom" ? "manual" : "automatic");

    const configuration = {
      ...dfa,
      creation_mode: creationMode
    };

    setCurrentDfa(configuration);
    setActivePage("simulator");
    setSaveMessage("Saving DFA...");

    const defaultName =
      creationMode === "manual"
        ? "Manual DFA"
        : `${dfa.structure || "Automatic"} DFA`;

    try {
      const response = await fetch(`${API_URL}/api/dfa/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: defaultName,
          dfa: configuration
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save DFA.");
      }

      setCurrentDfa({
        ...configuration,
        saved_id: data.id,
        saved_name: data.name
      });

      setSaveMessage("DFA saved to database.");
    } catch (error) {
      setSaveMessage(`DFA created, but not saved: ${error.message}`);
    }
  }

  function handleDfaLoaded(dfa) {
    setCurrentDfa(dfa);
    setSaveMessage("");
    setActivePage("simulator");
  }

  const pageTitles = {
    dashboard: "Dashboard",
    automatic: "Automatic DFA Generator",
    manual: "Manual DFA Builder",
    simulator: "DFA Simulator",
    history: "Saved DFAs & History"
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="topbar-label">DFA SIMULATOR</p>
            <h2>{pageTitles[activePage]}</h2>
          </div>

          <div className="topbar-profile">
            <div className="profile-avatar">DS</div>
            <div>
              <strong>Project Workspace</strong>
              <span>Compiler Design</span>
            </div>
          </div>
        </header>

        {saveMessage && (
          <div className="save-notice">
            {saveMessage}
          </div>
        )}

        {activePage === "dashboard" && (
          <Dashboard
            onNavigate={setActivePage}
            currentDfa={currentDfa}
          />
        )}

        {activePage === "automatic" && (
          <AutomaticDFA onDfaCreated={handleDfaCreated} />
        )}

        {activePage === "manual" && (
          <ManualDFA onDfaCreated={handleDfaCreated} />
        )}

        {activePage === "simulator" && (
          <Simulator currentDfa={currentDfa} />
        )}

        {activePage === "history" && (
          <History onDfaLoaded={handleDfaLoaded} />
        )}
      </main>
    </div>
  );
}

export default App;
