"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut, Home, LayoutDashboard, ChevronDown } from "lucide-react";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check auth session
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {}
    setUser(null);
    setDropdownOpen(false);
    setMobileOpen(false);
    window.location.href = "/";
  }

  const links = [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/learn", label: "Learn" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/quiz", label: "Free Estimate" },
  ];

  const avatarInitial = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <AbodeLogo />
          </Link>

          <div className="navbar-links">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="navbar-link">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar-actions">
            {authChecked && !user && (
              <Link href="/login" className="btn btn-subtle btn-sm">
                Log in
              </Link>
            )}

            {authChecked && user ? (
              /* Logged-in: avatar + dropdown */
              <div className="navbar-user-menu" ref={dropdownRef}>
                <button
                  className="navbar-avatar-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-label="Account menu"
                  aria-expanded={dropdownOpen}
                  type="button"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt=""
                      className="navbar-avatar-img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="navbar-avatar-initial">{avatarInitial}</span>
                  )}
                  <ChevronDown size={14} className={`navbar-avatar-chevron ${dropdownOpen ? "open" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-user">
                      <div className="navbar-dropdown-name">{user.name}</div>
                      <div className="navbar-dropdown-email">{user.email}</div>
                    </div>
                    <div className="navbar-dropdown-divider" />
                    <Link
                      href="/app/dashboard"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      href="/app/properties"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Home size={15} />
                      My Properties
                    </Link>
                    <div className="navbar-dropdown-divider" />
                    <button
                      className="navbar-dropdown-item navbar-dropdown-logout"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/quiz" className="btn btn-primary btn-sm">
                Get My Estimate
              </Link>
            )}

            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <div style={{ marginBottom: "var(--space-2)" }}>
          <AbodeLogo />
        </div>

        {/* Mobile: show user info if logged in */}
        {user && (
          <div className="mobile-menu-user">
            {user.picture ? (
              <img src={user.picture} alt="" className="mobile-menu-avatar" referrerPolicy="no-referrer" />
            ) : (
              <span className="mobile-menu-avatar-initial">{avatarInitial}</span>
            )}
            <div>
              <div className="mobile-menu-user-name">{user.name}</div>
              <div className="mobile-menu-user-email">{user.email}</div>
            </div>
          </div>
        )}

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="mobile-menu-link"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        {user && (
          <>
            <Link
              href="/app/dashboard"
              className="mobile-menu-link"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/app/properties"
              className="mobile-menu-link"
              onClick={() => setMobileOpen(false)}
            >
              My Properties
            </Link>
          </>
        )}

        {user ? (
          <button
            className="btn btn-outline btn-lg"
            onClick={handleLogout}
            style={{ marginTop: "auto" }}
          >
            <LogOut size={16} />
            Log out
          </button>
        ) : (
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <Link
              href="/login"
              className="btn btn-outline btn-lg"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/quiz"
              className="btn btn-primary btn-lg"
              onClick={() => setMobileOpen(false)}
            >
              Get Your Free Estimate
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Abode Logo — brand guide specification ─── */
export function AbodeLogo({ variant = "light" }) {
  const isDark   = variant === "dark";
  const isTurq   = variant === "turq";
  const inkColor      = isDark ? "rgba(244,240,234,0.45)" : isTurq ? "rgba(255,255,255,0.55)" : "#1C1916";
  const doorStroke    = isDark ? "#C0DEDE"               : isTurq ? "rgba(255,255,255,0.9)"  : "#1A8C8C";
  const doorFill      = isDark ? "rgba(192,222,222,0.12)": isTurq ? "rgba(255,255,255,0.15)" : "rgba(26,140,140,0.08)";
  const nameColor     = isDark ? "var(--surface)"        : isTurq ? "#fff"                   : "var(--ink)";
  const dotColor      = isDark ? "var(--turq-light)"     : isTurq ? "rgba(255,255,255,0.5)"  : "var(--turq)";

  return (
    <span className="abode-logo-lockup">
      <svg
        className="abode-logo-glyph"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="12" width="26" height="15" rx="1"
          stroke={inkColor} strokeWidth="1.2" fill="none" />
        <polyline points="1,12 14,2 27,12"
          stroke={inkColor} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
        <rect x="10" y="19" width="8" height="8" rx="0.5"
          stroke={doorStroke} strokeWidth="1.1" fill={doorFill} />
        <line x1="14" y1="19" x2="14" y2="27"
          stroke={doorStroke} strokeWidth="1.1" />
      </svg>
      <span className="abode-logo-name" style={{ color: nameColor }}>
        ABODE<span className="abode-logo-dot" style={{ color: dotColor }}> .</span>
      </span>
    </span>
  );
}
