import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LayoutDashboard, LogOut, BookOpen } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div className="app-container">
      <aside style={{
        width: '250px',
        background: 'var(--bg-card)',
        padding: '2rem 1rem',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 1rem' }}>
          <BookOpen color="var(--color-mint-green)" />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>LearnTrack</h3>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <Link to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: location.pathname === '/' ? 'var(--color-peach)' : 'transparent',
                color: location.pathname === '/' ? '#8c2f5d' : 'var(--text-main)',
                fontWeight: location.pathname === '/' ? '600' : '400',
              }}>
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '1rem', fontWeight: '500' }}>
            Hi, {user?.name.split(' ')[0]}
          </div>
          <button onClick={logout} className="btn" style={{ width: '100%', background: 'transparent', color: 'var(--text-muted)', justifyContent: 'flex-start', padding: '0.5rem 0' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
