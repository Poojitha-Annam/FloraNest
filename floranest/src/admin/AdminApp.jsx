// src/admin/AdminApp.jsx
// Self-contained admin SPA — rendered at /admin/* route
import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'

import AdminLogin         from './AdminLogin'
import AdminLayout        from './AdminLayout'
import Dashboard          from './Dashboard'
import ProductManagement  from './ProductManagement'
import CategoryManagement from './CategoryManagement'
import Inventory          from './Inventory'
import OrderManagement    from './OrderManagement'
import CustomerManagement from './CustomerManagement'
import Reports            from './Reports'

// Page titles keyed by the REMAINING path after /admin
// (React Router v6 child <Routes> sees the leftover segment, not the full URL)
const TITLES = {
  '':            'Dashboard',
  '/':           'Dashboard',
  '/products':   'Product Management',
  '/categories': 'Category Management',
  '/inventory':  'Inventory Tracker',
  '/orders':     'Order Management',
  '/customers':  'Customer Management',
  '/reports':    'Reports & Analytics',
}

export default function AdminApp() {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('floranest_admin')) } catch { return null }
  })
  const navigate = useNavigate()
  const location = useLocation()

  // Strip the /admin prefix to get the remaining segment, then look up the title.
  // window.location.pathname is used so the title is always live.
  const remaining = location.pathname.replace(/^\/admin/, '') || '/'
  const pageTitle = TITLES[remaining] || 'Admin Dashboard'

  function handleLogin(adminData) {
    setAdmin(adminData)
    navigate('/admin')
  }

  function handleLogout() {
    localStorage.removeItem('floranest_admin')
    setAdmin(null)
    navigate('/admin')
  }

  if (!admin) return <AdminLogin onLogin={handleLogin} />

  return (
    <AdminLayout admin={admin} onLogout={handleLogout} pageTitle={pageTitle}>
      {/*
        IMPORTANT: When a child <Routes> lives inside a parent <Route path="/admin/*">,
        React Router v6 strips the matched prefix (/admin) so child paths must be
        RELATIVE — they must NOT start with /admin.
      */}
      <Routes>
        <Route index                  element={<Dashboard          adminId={admin.id} />} />
        <Route path="products"        element={<ProductManagement  adminId={admin.id} />} />
        <Route path="categories"      element={<CategoryManagement adminId={admin.id} />} />
        <Route path="inventory"       element={<Inventory          adminId={admin.id} />} />
        <Route path="orders"          element={<OrderManagement    adminId={admin.id} />} />
        <Route path="customers"       element={<CustomerManagement adminId={admin.id} />} />
        <Route path="reports"         element={<Reports            adminId={admin.id} />} />
        <Route path="*"               element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  )
}
