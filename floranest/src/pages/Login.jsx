
import { useState } from 'react'
import Button from '../components/Button'

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSuccess(false)

    if (!email.trim() || !password) {
      setMessage('Please fill in all fields.')
      return
    }

    setIsLoggingIn(true)

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed.')
      }

      setIsSuccess(true)
      setMessage(`Welcome to FloraNest, ${result.user.name}! 🌿`)
      setPassword('')
      onLoginSuccess?.(result.user)
    } catch (error) {
      setMessage(
        error.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please try again.'
          : error.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Welcome Back 🌿</h1>
        <p>Login to your FloraNest account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            className="cart-button"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {message && (
          <p
            className="login-message"
            role="status"
            style={{ color: isSuccess ? 'green' : undefined }}
          >
            {message}
          </p>
        )}

        <p className="register-link">
          Don't have an account? <a href="#register">Register</a>
        </p>
      </section>
    </main>
  )
}

export default Login
