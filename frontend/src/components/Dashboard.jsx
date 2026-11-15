
import {
  WandSparkles,
  PenTool,
  PlayCircle,
  ArrowRight,
  Workflow,
  Cpu,
  Code2
} from "lucide-react";

function Dashboard({ onNavigate, currentDfa }) {
  const features = [
    {
      title: "Automatic DFA",
      description:
        "Generate a DFA using predefined pattern recognition structures.",
      icon: WandSparkles,
      color: "purple",
      page: "automatic"
    },
    {
      title: "Manual DFA Builder",
      description:
        "Create your own states, initial state, final states and transitions.",
      icon: PenTool,
      color: "blue",
      page: "manual"
    },
    {
      title: "DFA Simulator",
      description:
        "Enter an input string and check whether the DFA accepts it.",
      icon: PlayCircle,
      color: "green",
      page: "simulator"
    }
  ];

  return (
    <div className="page-content">
      <section className="welcome-banner">
        <div>
          <span className="eyebrow">COMPILER DESIGN MINI PROJECT</span>
          <h1>AI-Free DFA Simulator</h1>
          <p>
            Build, configure and simulate Deterministic Finite
            Automata for pattern recognition.
          </p>

          <button
            className="primary-button"
            onClick={() => onNavigate("automatic")}
          >
            Get Started <ArrowRight size={17} />
          </button>
        </div>

        <div className="welcome-graphic">
          <Workflow size={100} strokeWidth={1.2} />
        </div>
      </section>

      <div className="section-heading">
        <div>
          <h2>Project Overview</h2>
          <p>Explore the main capabilities of your simulator.</p>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <div className="overview-icon purple-bg">
            <Workflow />
          </div>
          <div>
            <h3>Finite Automata</h3>
            <p>Deterministic state transitions</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon blue-bg">
            <Cpu />
          </div>
          <div>
            <h3>Python Backend</h3>
            <p>Flask API integration</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon green-bg">
            <Code2 />
          </div>
          <div>
            <h3>React Frontend</h3>
            <p>Interactive user interface</p>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Explore Features</h2>
          <p>Choose how you want to create and simulate a DFA.</p>
        </div>
      </div>

      <div className="feature-grid">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div className="feature-card" key={feature.title}>
              <div className={`feature-icon ${feature.color}-bg`}>
                <Icon size={25} />
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>

              <button
                className="text-button"
                onClick={() => onNavigate(feature.page)}
              >
                Open feature <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="current-dfa-card">
        <div>
          <h3>Current DFA Configuration</h3>
          <p>
            {currentDfa
              ? `${currentDfa.states.length} states configured`
              : "No DFA configuration loaded yet."}
          </p>
        </div>

        <span className={currentDfa ? "loaded-badge" : "empty-badge"}>
          {currentDfa ? "Loaded" : "Not configured"}
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
