import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  ShoppingCart,
  BarChart2,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronDown,
  Settings,
  Users,
  Truck,
  FileText,
  Brain,
  ClipboardList,
  User,
  X,
  Check,
  FileSpreadsheet,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
} from "../utils/api";

const NAV_MAIN = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Products", icon: Package, path: "/products" },
  { label: "Low Stock", icon: AlertTriangle, path: "/low-stock" },
  { label: "Sales", icon: ShoppingCart, path: "/sales" },
  { label: "Analytics", icon: BarChart2, path: "/analytics" },
  { label: "AI Assistant", icon: Brain, path: "/ai" },
];

const NAV_MANAGE = [
  { label: "Suppliers", icon: Truck, path: "/suppliers" },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "Users", icon: Users, path: "/users" },
  { label: "Audit Logs", icon: ClipboardList, path: "/audit" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    getNotifications()
      .then((r) => setNotifications(r.data))
      .catch(() => setNotifications(getDemoNotifications()));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
    } catch {}
    setNotifications((n) =>
      n.map((x) => (x._id === id ? { ...x, read: true } : x)),
    );
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
    } catch {}
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout-root">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {!collapsed && (
              <div>
                <span className="brand-name">NeuroStock</span>
                <span className="brand-sub">Smart Inventory System</span>
              </div>
            )}
          </div>
        </div>

        {!collapsed && <div className="nav-label">Navigation</div>}

        <nav className="sidebar-nav">
          {NAV_MAIN.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? "nav-item--active" : ""}`}
            >
              <item.icon size={17} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          <div className="nav-divider" />
          {!collapsed && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--text-muted)",
                padding: "4px 10px 4px",
                textTransform: "uppercase",
              }}
            >
              Manage
            </div>
          )}

          {NAV_MANAGE.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item nav-item--muted ${isActive(item.path) ? "nav-item--active" : ""}`}
            >
              <item.icon size={16} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={17} />
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main */}
      <div className="main-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="topbar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu size={20} />
          </button>

          <div className="topbar-search">
            <Search size={14} className="search-icon" />
            <input placeholder="Search anything..." className="search-input" />
            <span className="search-kbd">⌘ K</span>
          </div>

          <div className="topbar-right">
            {/* Notifications */}
            <div className="notif-wrap" ref={notifRef}>
              <button
                className="notif-btn"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={18} />
                {unread > 0 && <span className="notif-badge">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    Notifications
                    <button className="notif-mark-read" onClick={handleMarkAll}>
                      Mark all read
                    </button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: 20,
                          textAlign: "center",
                          color: "var(--text-muted)",
                          fontSize: 13,
                        }}
                      >
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={n._id || i}
                          className={`notif-item ${!n.read ? "unread" : ""}`}
                          onClick={() => handleMarkRead(n._id)}
                        >
                          <span style={{ fontSize: 18, flexShrink: 0 }}>
                            {n.icon || getNotifIcon(n.type)}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div className="notif-text">
                              {n.message || n.text}
                            </div>
                            <div className="notif-time">
                              {n.time || formatTime(n.createdAt)}
                            </div>
                          </div>
                          {!n.read && (
                            <div
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "var(--accent-blue)",
                                flexShrink: 0,
                                marginTop: 4,
                              }}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="notif-wrap" ref={profileRef}>
              <div
                className="user-info"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="user-avatar"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div className="user-avatar">
                    {(user.name || "A").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="user-text">
                  <span className="user-name">{user.name || "Admin"}</span>
                  <span className="user-role">
                    {user.role === "admin" ? "Super Admin" : "Worker"}
                  </span>
                </div>
                <ChevronDown size={13} />
              </div>
              {profileOpen && (
                <div className="notif-dropdown" style={{ width: 200 }}>
                  <div
                    style={{
                      padding: "6px 8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Link
                      to="/profile"
                      className="nav-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={15} /> My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="nav-item nav-item--muted"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={15} /> Settings
                    </Link>
                    <div className="nav-divider" />
                    <button
                      className="nav-item"
                      style={{ color: "var(--accent-red)" }}
                      onClick={handleLogout}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

function getNotifIcon(type) {
  const map = { warning: "⚠️", danger: "🚨", success: "✅", info: "ℹ️" };
  return map[type] || "🔔";
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function getDemoNotifications() {
  return [
    {
      _id: "1",
      icon: "⚠️",
      message: "Low stock: Printer Ink (3 left)",
      time: "2m ago",
      read: false,
      type: "warning",
    },
    {
      _id: "2",
      icon: "🚨",
      message: "Out of stock: USB Hub",
      time: "15m ago",
      read: false,
      type: "danger",
    },
    {
      _id: "3",
      icon: "✅",
      message: "Sale recorded successfully",
      time: "1h ago",
      read: true,
      type: "success",
    },
    {
      _id: "4",
      icon: "🤖",
      message: "AI: Demand spike predicted for Laptops",
      time: "2h ago",
      read: true,
      type: "info",
    },
  ];
}
