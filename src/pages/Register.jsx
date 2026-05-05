import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import {
  getApiErrorMessage,
  pickTokenFromAuthResponse,
  pickUserFromAuthResponse,
  postRegister,
} from '../services/auth.js'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = 'Введите email'
    else if (!emailRe.test(email.trim())) next.email = 'Некорректный email'
    if (!password) next.password = 'Введите пароль'
    else if (password.length < 6) next.password = 'Минимум 6 символов'
    if (confirm !== password) next.confirm = 'Пароли не совпадают'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setInfo('')
    if (!validate()) return

    setLoading(true)
    try {
      const data = await postRegister({
        email: email.trim(),
        password,
      })
      const token = pickTokenFromAuthResponse(data)
      if (token) {
        const user = pickUserFromAuthResponse(data)
        login({ token, user })
        navigate('/')
        return
      }
      setInfo('Регистрация прошла успешно. Теперь можно войти.')
    } catch (err) {
      setApiError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h1>Регистрация</h1>

      <form className="form" onSubmit={onSubmit} noValidate>
        {apiError ? (
          <p className="alert alert-error" role="alert">
            {apiError}
          </p>
        ) : null}
        {info ? (
          <p className="alert alert-success" role="status">
            {info}{' '}
            <Link to="/login">Перейти ко входу</Link>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {fieldErrors.password ? <small className="field-error">{fieldErrors.password}</small> : null}
        </label>

        <label className="field">
          <span>Подтверждение пароля</span>
          <input
            type="password"
            name="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
          />
          {fieldErrors.confirm ? <small className="field-error">{fieldErrors.confirm}</small> : null}
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Отправка…' : 'Зарегистрироваться'}
        </button>
      </form>
    </section>
  )
}
