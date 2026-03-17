"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  HelpCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/properties", label: "Properties", icon: Home },
  { href: "/app/studies", label: "Studies", icon: FileText },
  { href: "/app/account", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // STUB: Replace with real auth session check
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {
        // Session endpoint not available yet — fall through silently
      });
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {}
    setUser(null);
    window.location.href = "/";
  }, []);

  /** First letter of user name for avatar, with fallback */
  const avatarInitial = user?.name?.[0]?.toUpperCase() ?? "U";
  const displayName = user?.name ?? "User";
  const displayEmail = user?.email ?? "";

  return (
    <div className="app-layout">
      {/* ── Desktop Sidebar ── */}
      <aside className="app-sidebar" role="navigation" aria-label="Main navigation">
        <Link href="/" className="app-sidebar-logo">
          abode<span className="app-sidebar-logo-dot">.</span>
        </Link>

        <nav className="app-nav">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`app-nav-link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <item.icon size={18} strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="app-nav-link"
          onClick={() => window.openAbby?.()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
        >
          <HelpCircle size={18} strokeWidth={1.5} />
          Help &amp; Support
        </button>

        <div className="app-sidebar-user">
          <div className="app-sidebar-user-info">
            <div className="app-sidebar-user-name">{displayName}</div>
            {displayEmail && (
              <div className="app-sidebar-user-email">{displayEmail}</div>
            )}
          </div>
          <button
            className="btn btn-subtle btn-icon"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="app-main">
        {/* Mobile top bar */}
        <header className="app-mobile-header">
          <Link href="/" className="app-mobile-logo">
            abode<span className="app-sidebar-logo-dot">.</span>
          </Link>
          <button
            className="btn btn-subtle btn-icon"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile slide-out drawer */}
        {sidebarOpen && (
          <div
            className="app-mobile-overlay"
            onClick={closeSidebar}
            role="presentation"
          >
            <div
              className="app-mobile-drawer"
              onClick={(e) => e.stopPropagation()}
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="app-mobile-drawer-header">
                <Link href="/" className="app-sidebar-logo" onClick={closeSidebar}>
                  abode<span className="app-sidebar-logo-dot">.</span>
                </Link>
                <button
                  className="btn btn-subtle btn-icon"
                  onClick={closeSidebar}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="app-nav">
                {NAV_ITEMS.map((item) => {
                  const active = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`app-mobile-nav-link${active ? " active" : ""}`}
                      onClick={closeSidebar}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon size={18} strokeWidth={active ? 2 : 1.5} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <button
                className="app-mobile-nav-link"
                onClick={() => { window.openAbby?.(); closeSidebar(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <HelpCircle size={18} strokeWidth={1.5} />
                Help &amp; Support
              </button>

              <div className="app-sidebar-user" style={{ marginTop: "auto" }}>
                <div className="app-sidebar-user-info">
                  <div className="app-sidebar-user-name">{displayName}</div>
                  {displayEmail && (
                    <div className="app-sidebar-user-email">{displayEmail}</div>
                  )}
                </div>
                <button
                  className="btn btn-subtle btn-icon"
                  onClick={handleLogout}
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop top bar */}
        <header className="app-topbar">
          <div className="app-topbar-user">
            <div className="app-topbar-avatar" aria-hidden="true">
              {avatarInitial}
            </div>
            <span className="app-topbar-name">{displayName}</span>
            <button
              className="btn btn-subtle btn-icon"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="app-page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
