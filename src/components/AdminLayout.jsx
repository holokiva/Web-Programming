import { NavLink, Outlet } from 'react-router-dom'

const subNavClass = ({ isActive }) => (isActive ? 'admin-subnav-link active' : 'admin-subnav-link')

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <nav className="admin-subnav" aria-label="Admin sections">
        <NavLink to="/admin" end className={subNavClass}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/reservations" className={subNavClass}>
          Reservations
        </NavLink>
        <NavLink to="/admin/locations" className={subNavClass}>
          Locations
        </NavLink>
      </nav>
      <div className="admin-outlet">
        <Outlet />
      </div>
    </div>
  )
}
