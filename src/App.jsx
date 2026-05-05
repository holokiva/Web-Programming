import { NavLink, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import About from './pages/About.jsx'
import Account from './pages/Account.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import MyReservations from './pages/MyReservations.jsx'
import Register from './pages/Register.jsx'
import RoomSearch from './pages/RoomSearch.jsx'
import { isAdminUser } from './utils/roles.js'
import './App.css'

const navLinkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')

export default function App() {
  const { isAuthenticated, user, logout } = useAuth()
  const isAdmin = isAdminUser(user)

  return (
    <div className="layout">
      <header className="header">
        <nav className="nav">
          <NavLink to="/" end className={navLinkClass}>
            Главная
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>
            Поиск
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            О нас
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/reservations" className={navLinkClass}>
                Мои брони
              </NavLink>
              <NavLink to="/account" className={navLinkClass}>
                Кабинет
              </NavLink>
              {isAdmin ? (
                <NavLink to="/admin" className={navLinkClass}>
                  Админ
                </NavLink>
              ) : null}
              <button type="button" className="nav-btn" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Вход
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<RoomSearch />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
