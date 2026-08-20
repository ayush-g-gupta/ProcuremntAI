import { NavLink, Outlet } from "react-router-dom";
import { Icon } from "./Icon";
import { SmartBuyChatbot } from "./SmartBuyChatbot";
import { useState } from "react";
import avatarImg from "../images/image (1).png";
const navItems = [
  ["/", "Dashboard", "chevron"],
  ["/products", "Products", "cube"],
  ["/inventory-agent", "Inventory AI", "alert"],
  ["/recommendation", "Recommendations", "cube"],
  ["/quotes", "Quotes", "chevron"],
  ["/orders", "Orders", "chevron"],
  ["/approvals", "Approvals", "check"],
];
export function AppLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="mobile-brand">
          <span>S</span> B2B SmartBuy
        </div>
        <label className="search">
          <Icon name="cube" size={15} />
          <input placeholder="Search products, SKUs, suppliers or ask a question..." />
        </label>
        <div className="top-actions">
          <span>
            🔔<i>2</i>
          </span>
          <span>?</span>
          <div className="avatar"><img className="avatar-img" src={avatarImg} alt="Avatar" /></div>
          <div className="user">
            <b>Sophie Anderson</b>
            <small>Procurement Manager</small>
          </div>
        </div>
      </header>
      <aside className="sidebar">
        <div className="logo">
          <span>S</span>
          <div>
            <b>B2B SmartBuy</b>
            <small>AI Procurement Platform</small>
          </div>
        </div>
        <nav>
          {navItems.map(([path, label, icon]) => (
            <NavLink end={path === "/"} to={path} key={path}>
              <Icon name={icon} size={15} />
              {label}
              {label === "Recommendations" && <em>1</em>}
              {label === "Approvals" && <em className="orange">3</em>}
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <button>
            🔔 Notifications <em>2</em>
          </button>
          <button>⚙ Settings</button>
          <div className="user-side">
            <span className="avatar">PS</span>
            <div>
              <b>Sophie Anderson</b>
              <small>Procurement Manager</small>
            </div>
          </div>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
      {chatOpen && <SmartBuyChatbot onClose={() => setChatOpen(false)} />}

      <button
        type="button"
        className="ai-bubble"
        onClick={() => setChatOpen(true)}
        aria-label="Open SmartBuy AI"
      >
        ✦ <span>SmartBuy AI</span>
        <i>1</i>
      </button>
    </div>
  );
}
