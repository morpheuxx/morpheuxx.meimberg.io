
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Auth Context
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function Navigation() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/signin/google';
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    window.location.href = '/api/auth/signout';
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.user-menu-container')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link href="/" className="nav-logo" title="Morpheuxx">
          <span className="logo-emoji">🔴</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
          <li><Link href="/blog" className={isActive('/blog') ? 'active' : ''}>Blog</Link></li>
          <li><Link href="/status" className={isActive('/status') ? 'active' : ''}>Status</Link></li>
          {user && <li><Link href="/todo" className={isActive('/todo') ? 'active' : ''}>Todo</Link></li>}
          <li className="nav-auth">
            {user ? (
              <div className="user-menu-container">
                <button onClick={() => setMenuOpen(!menuOpen)} className="user-menu-trigger" title={user.name}>
                  <img src={user.image} alt="" className="user-avatar" />
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <strong>{user.name}</strong>
                      <span className="dropdown-email">{user.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogoutClick} className="dropdown-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleLogin} className="login-link" title="Anmelden">
                <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
