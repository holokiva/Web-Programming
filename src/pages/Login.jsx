import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { getApiErrorMessage, pickTokenFromAuthResponse, pickUserFromAuthResponse, postLogin } from '../services/auth.js'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState(() =>
    searchParams.get('reason') === 'session' ? 'Сессия истекла. Войдите снова.' : '',
  )
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = 'Введите email'
    else if (!emailRe.test(email.trim())) next.email = 'Некорректный email'
    if (!password) next.password = 'Введите пароль'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setLoading(true)
    try {
      const data = await postLogin({
        email: email.trim(),
        password,
      })
      const token = pickTokenFromAuthResponse(data)
      if (!token) {
        setApiError('Сервер не вернул токен')
        return
      }
      const user = pickUserFromAuthResponse(data)
      login({ token, user })
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h1>Вход</h1>

      <form className="form" onSubmit={onSubmit} noValidate>
        {apiError ? (
          <p className="alert alert-error" role="alert">
            {apiError}
          </p>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {fieldErrors.email ? <small className="field-error">{fieldErrors.email}</small> : null}
        </label>

        <label className="field">
          <span>Пароль</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {fieldErrors.password ? <small className="field-error">{fieldErrors.password}</small> : null}
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </section>
  )
}
