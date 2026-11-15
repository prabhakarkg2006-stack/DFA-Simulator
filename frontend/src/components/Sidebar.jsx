
import {
  LayoutDashboard,
  WandSparkles,
  PenTool,
  PlayCircle,
  Workflow,
  Database
} from "lucide-react";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      id: "automatic",
      label: "Automatic DFA",
      icon: WandSparkles
    },
    {
      id: "manual",
      label: "Manual DFA Builder",
      icon: PenTool
    },
    {
      id: "simulator",
      label: "DFA Simulator",
      icon: PlayCircle
    },
    {
      id: "history",
      label: "Saved DFAs & History",
      icon: Database
    }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Workflow size={25} />
        </div>

        <div>
          <h2>DFA Studio</h2>
          <p>Pattern Recognition</p>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">WORKSPACE</p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={
                activePage === item.id
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="status-dot"></div>
        <span>Backend integration</span>
        <span className="online-label">API</span>
      </div>
    </aside>
  );
}

export default Sidebar;
