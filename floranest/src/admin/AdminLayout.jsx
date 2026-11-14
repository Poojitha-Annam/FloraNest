// src/admin/AdminLayout.jsx
import { NavLink, useLocation } from 'react-router-dom'
import './admin.css'

const NAV = [
  { to: '/admin',            label: 'Dashboard',  icon: '📊' },
  { to: '/admin/products',   label: 'Products',   icon: '🌿' },
  { to: '/admin/categories', label: 'Categories', icon: '🏷️'  },
  { to: '/admin/inventory',  label: 'Inventory',  icon: '📦' },
  { to: '/admin/orders',     label: 'Orders',     icon: '🛒' },
  { to: '/admin/customers',  label: 'Customers',  icon: '👥' },
  { to: '/admin/reports',    label: 'Reports',    icon: '📈' },
]

export default function AdminLayout({ admin, onLogout, children, pageTitle }) {
  const location = useLocation()

  return (
    <div className="admin-wrapper">

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">

        <div className="sidebar-logo">
          <h2>Flora<span>Nest</span></h2>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => {
            // Exact match for dashboard root; prefix match for sub-pages
            const isActive = item.to === '/admin'
              ? location.pathname === '/admin' || location.pathname === '/admin/'
              : location.pathname.startsWith(item.to)

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={isActive ? 'active' : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout}>🚪 Logout</button>
        </div>

      </aside>

      {/* ── Main area ── */}
      <div className="admin-main">

        <header className="admin-topbar">
          <h1>{pageTitle}</h1>
          <div className="admin-badge">
            <span>👤</span>
            <span>{admin?.name || 'Admin'}</span>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>

      </div>

    </div>
  )
}
