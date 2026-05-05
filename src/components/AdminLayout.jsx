import { NavLink, Outlet } from 'react-router-dom'

const subNavClass = ({ isActive }) => (isActive ? 'admin-subnav-link active' : 'admin-subnav-link')

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <nav className="admin-subnav" aria-label="Админ-разделы">
        <NavLink to="/admin" end className={subNavClass}>
          Дашборд
        </NavLink>
        <NavLink to="/admin/reservations" className={subNavClass}>
          Бронирования
        </NavLink>
        <NavLink to="/admin/locations" className={subNavClass}>
          Локации
        </NavLink>
      </nav>
      <div className="admin-outlet">
        <Outlet />
      </div>
    </div>
  )
}
